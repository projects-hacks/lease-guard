export default {
    name: 'leaseAnalysis',
    title: 'Lease Analysis',
    type: 'document',
    fields: [
        { name: 'userId', title: 'User ID', type: 'string' },
        { name: 'uploadDate', title: 'Upload Date', type: 'datetime' },
        { name: 'propertyAddress', title: 'Property Address', type: 'string' },
        { name: 'rentAmount', title: 'Rent Amount', type: 'number' },
        { name: 'leaseStart', title: 'Lease Start', type: 'date' },
        { name: 'leaseEnd', title: 'Lease End', type: 'date' },
        { name: 'state', title: 'State', type: 'string' },
        {
            name: 'extractedClauses',
            title: 'Extracted Clauses',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'clauseType', title: 'Type', type: 'string' },
                        { name: 'originalText', title: 'Original Text', type: 'text' },
                        { name: 'riskLevel', title: 'Risk Level', type: 'string', options: { list: ['green', 'yellow', 'red'] } },
                        { name: 'explanation', title: 'Explanation', type: 'text' },
                        { name: 'citation', title: 'Legal Citation', type: 'string' }
                    ]
                }
            ]
        },
        { name: 'overallRiskScore', title: 'Risk Score', type: 'number' },
        {
            name: 'generatedDocuments',
            title: 'Generated Documents',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'type', type: 'string' },
                        { name: 'url', type: 'url' },
                        { name: 'generatedAt', type: 'datetime' }
                    ]
                }
            ]
        }
    ]
}
