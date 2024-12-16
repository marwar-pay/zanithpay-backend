
export function getPaginationArray(page, limit) {
    page = Number(page) || 1
    limit = Number(limit) || 10
    return [
        {
            $facet: {
                paginatedResults: [{ $skip: (page - 1) * limit }, { $limit: limit }],
                totalCount: [
                    {
                        $count: 'value'
                    }
                ]
            }
        },
        {
            $unwind: '$totalCount'
        },
        {
            $addFields: {
                docs: '$paginatedResults',
                totalDocs: '$totalCount.value',
                limit: limit,
                page: page,
                totalPages: {
                    $ceil: {
                        $divide: ['$totalCount.value', limit]
                    }
                },
                pagingCounter: page,
                hasPrevPage: {
                    $cond: {
                        if: { $gt: [page, 1] },
                        then: true,
                        else: false
                    }
                },
                hasNextPage: {
                    $cond: {
                        if: {
                            $lt: [
                                page,
                                { $ceil: { $divide: ['$totalCount.value', limit] } }
                            ]
                        },
                        then: true,
                        else: false
                    }
                },
                prevPage: {
                    $cond: {
                        if: { $gt: [page, 1] },
                        then: page - 1,
                        else: null
                    }
                },
                nextPage: {
                    $cond: {
                        if: {
                            $lt: [
                                page,
                                { $ceil: { $divide: ['$totalCount.value', limit] } }
                            ]
                        },
                        then: page + 1,
                        else: null
                    }
                }
            }
        },
        {
            $project: {
                paginatedResults: 0,
                totalCount: 0
            }
        }
    ]
}