export default {
    name: 'rentComparable',
    title: 'Rent Comparable Data',
    type: 'document',
    fields: [
        {
            name: 'leaseAnalysis',
            title: 'Lease Analysis Reference',
            type: 'reference',
            to: [{ type: 'leaseAnalysis' }]
        },
        { name: 'searchDate', title: 'Search Date', type: 'datetime' },
        { name: 'userRent', title: 'User Rent', type: 'number' },
        { name: 'zipCode', title: 'Zip Code', type: 'string' },
        { name: 'bedrooms', title: 'Bedrooms', type: 'number' },
        {
            name: 'comparables',
            title: 'Comparable Listings',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'address', title: 'Address', type: 'string' },
                        { name: 'rent', title: 'Rent Amount', type: 'number' },
                        { name: 'source', title: 'Source', type: 'string' },
                        { name: 'listingUrl', title: 'Listing URL', type: 'url' },
                        { name: 'sqft', title: 'Square Footage', type: 'number' }
                    ]
                }
            ]
        },
        { name: 'medianRent', title: 'Median Rent', type: 'number' },
        { name: 'overpaymentAmount', title: 'Overpayment Amount', type: 'number' },
        { name: 'percentileRank', title: 'Percentile Rank', type: 'number' },
        { name: 'negotiationLetterUrl', title: 'Negotiation Letter URL', type: 'url' }
    ]
}
