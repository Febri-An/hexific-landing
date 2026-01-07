import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    // Fetch Job and its Records
    const { data: job, error } = await supabase
        .from('audit_jobs')
        .select(`
      status,
      audit_records ( id, name, status, audit_result )
    `)
        .eq('id', jobId)
        .single();

    if (error || !job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    // Calculate Progress
    const records = job.audit_records as any[];
    const total = records.length;
    const done = records.filter(r => r.status === 'DONE').length;
    const progress = total === 0 ? 0 : Math.round((done / total) * 100);

    return NextResponse.json({
        status: job.status,
        progress,
        results: records.map(r => r.audit_result).filter(Boolean)
    });
}