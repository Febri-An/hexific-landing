import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { inngest } from '@/lib/inngest';
import { fetchContractSource } from '@/lib/etherscan'; // (Keep your existing helper)
import JSZip from 'jszip';

export const maxDuration = 240;

export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        // 1. Get the Toggle Switch Value
        const isAiAudit = formData.get('ai_mode') === 'true'; // Frontend sends this
        const jobMode = isAiAudit ? 'AI' : 'STATIC';

        // 2. Create Job
        const { data: job, error: jobError } = await supabase
            .from('audit_jobs')
            .insert({ status: 'PENDING', mode: jobMode }) // Store the mode!
            .select()
            .single();

        if (jobError || !job) throw new Error("Failed to create job");

        const files = formData.getAll('files') as File[];
        const addresses = formData.getAll('addresses') as string[];

        const recordsToInsert: Array<{
            job_id: string;
            name: string;
            source_type: string;
            source_code: string;
        }> = [];

        // --- Standardized File Processing (Same for AI & Static) ---
        for (const file of files) {
            if (file.name.endsWith('.zip')) {
                try {
                    // Extract all .sol files from ZIP
                    const arrayBuffer = await file.arrayBuffer();
                    const zip = await JSZip.loadAsync(arrayBuffer);

                    for (const [filepath, zipEntry] of Object.entries(zip.files)) {
                        // Skip directories, non-.sol files, and macOS metadata
                        if (zipEntry.dir) continue;
                        if (!filepath.endsWith('.sol')) continue;
                        if (filepath.startsWith('__MACOSX/')) continue;
                        if (filepath.includes('/._')) continue; // macOS resource forks


                        const code = await zipEntry.async('string');
                        recordsToInsert.push({
                            job_id: job.id,
                            name: filepath,
                            source_type: 'FILE',
                            source_code: code
                        });
                    }

                } catch (zipError: any) {
                    console.error('ZIP extraction failed:', zipError);
                    throw new Error(`ZIP extraction failed: ${zipError.message}`);
                }
            } else {
                const code = await file.text();
                recordsToInsert.push({
                    job_id: job.id,
                    name: file.name,
                    source_type: 'FILE',
                    source_code: code
                });
            }
        }

        // --- Address Processing ---
        for (const addr of addresses) {
            if (addr.length >= 42) {
                try {
                    const code = await fetchContractSource(addr);
                    recordsToInsert.push({
                        job_id: job.id,
                        name: addr,
                        source_type: 'ADDRESS',
                        source_code: code
                    });
                } catch (e: any) {
                    throw new Error(`Failed to fetch contract source for ${addr}: ${e.message}`);
                }
            }
        }

        if (recordsToInsert.length === 0) return NextResponse.json({ error: "No inputs" }, { status: 400 });

        // 3. Save to DB
        const { data: savedRecords, error: insertError } = await supabase
            .from('audit_records')
            .insert(recordsToInsert)
            .select();

        if (insertError) throw new Error(insertError.message);

        // 4. Trigger Queue with the Mode info
        const events = savedRecords.map((record) => ({
            name: "audit/process.code",
            data: {
                recordId: record.id,
                jobId: job.id,
                mode: jobMode // Pass 'STATIC' or 'AI' to the worker
            }
        }));

        await inngest.send(events);

        return NextResponse.json({ success: true, jobId: job.id, mode: jobMode });

    } catch (error: any) {
        console.error('Ingest API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}