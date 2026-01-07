import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { supabase } from "@/lib/supabase";

const processAudit = inngest.createFunction(
    { id: "worker-audit-router", concurrency: 20 },
    { event: "audit/process.code" },
    async ({ event, step }) => {
        const { recordId, jobId, mode } = event.data; // mode is 'STATIC' or 'AI'

        // Step A: Fetch Data
        const { data: record } = await step.run("fetch-code", async () => {
            return await supabase.from('audit_records').select('*').eq('id', recordId).single();
        });

        if (!record) throw new Error("Record missing");

        // Step B: Route to Correct Python Endpoint
        const aiResult = await step.run("call-backend-api", async () => {
            // 1. DYNAMIC URL
            console.log("🚀 STARTING API CALL");
            const endpoint = mode === 'AI' ? '/audit/fastaudit-single' : '/audit/staticaudit-single';
            const apiUrl = `${process.env.FASTAPI_URL}${endpoint}`;

            console.log("👉 Target URL:", apiUrl);

            // 2. CREATE VIRTUAL FILE
            console.log("📦 Payload being sent:", JSON.stringify({
                source_code_preview: record.source_code.substring(0, 50) + "..." // Don't print massive strings
            }, null, 2));

            const formData = new FormData();
            const fileBlob = new Blob([record.source_code], { type: 'text/plain' });
            formData.append("file", fileBlob, "contract.sol");

            // 3. SEND REQUEST
            const response = await fetch(apiUrl, {
                method: "POST",
                body: formData,
            });

            console.log(`📡 Response Status: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ PYTHON ERROR:", errorText);
                throw new Error(errorText);
            }

            return await response.json();
        });

        // Step C: Save & Finish
        await step.run("save-result", async () => {
            await supabase.from('audit_records').update({
                audit_result: aiResult,
                status: 'DONE'
            }).eq('id', recordId);
        });

        // Step D: Check Job Completion
        await step.run("check-completion", async () => {
            const { count } = await supabase
                .from('audit_records')
                .select('*', { count: 'exact', head: true })
                .eq('job_id', jobId)
                .neq('status', 'DONE');

            if (count === 0) {
                await supabase.from('audit_jobs').update({ status: 'COMPLETED' }).eq('id', jobId);
            }
        });

        return { success: true, mode };
    }
);

export const { GET, POST, PUT } = serve({ client: inngest, functions: [processAudit] });