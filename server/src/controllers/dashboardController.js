import Item from '../models/Item.js';
import Claim from '../models/Claim.js';
import Match from '../models/Match.js';

export async function getDashboardStats(_request, response, next) {
  try {
    const now = new Date();
    const since = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const [itemStats, categoryStats, monthlyReports, recoveryStats, recentReports, matchCount, claimCount] = await Promise.all([
      Item.aggregate([
        { $facet: {
          types: [{ $group: { _id: '$type', count: { $sum: 1 } } }],
          statuses: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
          total: [{ $count: 'count' }],
        } },
      ]),
      Item.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
      ]),
      Item.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          reports: { $sum: 1 },
          lost: { $sum: { $cond: [{ $eq: ['$type', 'lost'] }, 1, 0] } },
          found: { $sum: { $cond: [{ $eq: ['$type', 'found'] }, 1, 0] } },
        } },
        { $sort: { _id: 1 } },
      ]),
      Item.aggregate([
        { $match: { returnedAt: { $ne: null } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$returnedAt' } }, recoveries: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Item.find().select('itemName type category location dateOfIncident imageUrl status createdAt').sort({ createdAt: -1 }).limit(6).lean(),
      Match.countDocuments({ status: { $in: ['suggested', 'confirmed'] } }),
      Claim.countDocuments({ status: 'pending' }),
    ]);

    const types = Object.fromEntries((itemStats[0]?.types || []).map((entry) => [entry._id, entry.count]));
    const statuses = Object.fromEntries((itemStats[0]?.statuses || []).map((entry) => [entry._id, entry.count]));
    const monthMap = new Map(monthlyReports.map((entry) => [entry._id, { month: entry._id, reports: entry.reports, lost: entry.lost, found: entry.found, recoveries: 0 }]));
    for (const entry of recoveryStats) {
      const target = monthMap.get(entry._id) || { month: entry._id, reports: 0, lost: 0, found: 0, recoveries: 0 };
      target.recoveries = entry.recoveries;
      monthMap.set(entry._id, target);
    }

    return response.json({
      totals: {
        total: itemStats[0]?.total?.[0]?.count || 0,
        lost: types.lost || 0,
        found: types.found || 0,
        open: statuses.open || 0,
        returned: statuses.returned || 0,
        matches: matchCount,
        pendingClaims: claimCount,
      },
      statuses,
      categories: categoryStats.map(({ _id, count }) => ({ category: _id, count })),
      monthly: [...monthMap.values()].sort((a, b) => a.month.localeCompare(b.month)),
      recentReports,
    });
  } catch (error) {
    return next(error);
  }
}
