import { NextRequest, NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL || 'https://api.hexific.com/audit';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        // Forward to FastAPI: /staticaudit-multi
        const response = await fetch(`${FASTAPI_URL}/staticaudit-multi`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}