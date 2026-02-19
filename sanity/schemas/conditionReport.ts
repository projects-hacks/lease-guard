export default {
    name: 'conditionReport',
    title: 'Condition Report',
    type: 'document',
    fields: [
        {
            name: 'leaseAnalysis',
            title: 'Lease Analysis Reference',
            type: 'reference',
            to: [{ type: 'leaseAnalysis' }]
        },
        { name: 'inspectionDate', title: 'Inspection Date', type: 'datetime' },
        { name: 'videoUrl', title: 'Video URL', type: 'url' },
        {
            name: 'defects',
            title: 'Detected Defects',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'id', title: 'ID', type: 'string' },
                        {
                            name: 'type',
                            title: 'Type',
                            type: 'string',
                            options: {
                                list: ['scratch', 'crack', 'stain', 'hole', 'water_damage', 'mold', 'other']
                            }
                        },
                        { name: 'location', title: 'Location', type: 'string' },
                        { name: 'description', title: 'Description', type: 'text' },
                        {
                            name: 'severity',
                            title: 'Severity',
                            type: 'string',
                            options: { list: ['minor', 'moderate', 'major'] }
                        },
                        { name: 'screenshotUrl', title: 'Screenshot URL', type: 'url' },
                        { name: 'timestamp', title: 'Video Timestamp (s)', type: 'number' },
                        { name: 'confidence', title: 'AI Confidence', type: 'number' }
                    ]
                }
            ]
        },
        { name: 'reportPdfUrl', title: 'Report PDF URL', type: 'url' },
        { name: 'emailedToLandlord', title: 'Emailed to Landlord', type: 'boolean' },
        { name: 'emailDate', title: 'Email Date', type: 'datetime' }
    ]
}
