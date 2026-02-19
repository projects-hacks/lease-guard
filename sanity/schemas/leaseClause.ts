export default {
    name: 'leaseClause',
    title: 'Lease Clause',
    type: 'document',
    fields: [
        {
            name: 'clauseType',
            title: 'Clause Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Late Fee', value: 'late_fee' },
                    { title: 'Security Deposit', value: 'security_deposit' },
                    { title: 'Pet Policy', value: 'pet_policy' },
                    { title: 'Maintenance', value: 'maintenance' },
                    { title: 'Subletting', value: 'subletting' },
                    { title: 'Entry', value: 'entry' },
                    { title: 'Termination', value: 'termination' },
                    { title: 'Other', value: 'other' },
                ],
            },
        },
        {
            name: 'commonName',
            title: 'Common Name',
            type: 'string',
        },
        {
            name: 'description',
            title: 'Description',
            type: 'text',
        },
        {
            name: 'redFlagPatterns',
            title: 'Red Flag Patterns',
            type: 'array',
            of: [{ type: 'string' }],
            description: 'Patterns identifying potential issues'
        },
        {
            name: 'stateRules',
            title: 'State Rules',
            type: 'object',
            fields: [
                { name: 'CA', type: 'object', fields: [{ name: 'maxLateFee', type: 'string' }, { name: 'statute', type: 'string' }] },
                { name: 'NY', type: 'object', fields: [{ name: 'maxLateFee', type: 'string' }, { name: 'statute', type: 'string' }] },
                // Simplified for hackathon, usually would be a separate document type
            ]
        },
        {
            name: 'counterTemplate',
            title: 'Counter Letter Template',
            type: 'text',
        },
        {
            name: 'tenantRights',
            title: 'Tenant Rights Explanation',
            type: 'array',
            of: [{ type: 'string' }]
        }
    ],
}
