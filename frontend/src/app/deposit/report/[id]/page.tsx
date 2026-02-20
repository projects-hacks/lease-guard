import { client } from "@/lib/sanity";
import { notFound } from "next/navigation";
import { Camera, AlertCircle, CheckCircle, Download } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Props {
    params: Promise<{ id: string }>;
}

async function getReport(id: string) {
    return client.fetch(
        `*[_type == "conditionReport" && _id == $id][0]{
      ...,
      defects[]{
        ...,
        screenshot{
          asset->{url}
        }
      }
    }`,
        { id }
    );
}

export default async function ReportPage(props: Props) {
    const params = await props.params;
    const report = await getReport(params.id);

    if (!report) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Condition Report</h1>
                        <p className="text-muted-foreground mt-1">
                            Inspection Date: {new Date(report.inspectionDate).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/deposit" className="text-sm font-medium text-muted-foreground hover:text-primary pt-2">
                            New Inspection
                        </Link>
                        <a
                            href={`/api/v1/generate/report/${params.id}`}
                            target="_blank"
                            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium"
                        >
                            <Download className="w-4 h-4" />
                            Download PDF
                        </a>
                    </div>
                </div>

                {/* Defects Grid */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Camera className="w-5 h-5" />
                        Detected Defects ({report?.defects?.length || 0})
                    </h2>

                    {(!report.defects || report.defects.length === 0) ? (
                        <div className="p-8 border rounded-lg bg-green-50 text-green-800 flex items-center justify-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            <span>No defects detected in this video!</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {report.defects.map((defect: any, idx: number) => (
                                <div key={idx} className="bg-card border rounded-lg overflow-hidden shadow-sm flex flex-col">
                                    {/* Screenshot */}
                                    <div className="relative aspect-video bg-muted">
                                        {defect.screenshot?.asset?.url ? (
                                            <Image
                                                src={defect.screenshot.asset.url}
                                                alt="Defect Screenshot"
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                                No Image
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-sm">
                                            {defect.timestamp?.toFixed(1)}s
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="p-4 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold capitalize">{defect.type?.replace('_', ' ')}</h3>
                                            <span className={cn(
                                                "text-xs px-2 py-0.5 rounded-full font-medium capitalize",
                                                defect.severity === 'major' ? "bg-red-100 text-red-800" :
                                                    defect.severity === 'moderate' ? "bg-yellow-100 text-yellow-800" :
                                                        "bg-gray-100 text-gray-800"
                                            )}>
                                                {defect.severity}
                                            </span>
                                        </div>

                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                                            {defect.description}
                                        </p>

                                        {defect.location && (
                                            <div className="text-xs text-muted-foreground mt-auto">
                                                📍 {defect.location}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
