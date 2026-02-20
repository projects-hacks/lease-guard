import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://96.126.99.75/api/v1";
    // Strip trailing /api/v1 if present, then add it back consistently
    const host = backendUrl.replace(/\/api(\/v1)?$/, "");

    try {
        const res = await fetch(`${host}/api/v1/generate/report/${id}`, {
            headers: { Accept: "application/pdf" },
        });

        if (!res.ok) {
            const text = await res.text();
            return NextResponse.json(
                { error: text },
                { status: res.status }
            );
        }

        const pdfBuffer = await res.arrayBuffer();

        // Return with "inline" so iOS Safari renders the PDF in-browser
        // instead of trying (and failing) to trigger a file download
        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="condition-report-${id}.pdf"`,
                "Cache-Control": "no-store",
            },
        });
    } catch (err: any) {
        console.error("PDF proxy error:", err);
        return NextResponse.json(
            { error: "Failed to generate PDF" },
            { status: 500 }
        );
    }
}
