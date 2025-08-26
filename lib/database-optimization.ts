import "./server-only";
import { prisma } from "./prisma";

/**
 * Database Performance Optimization Service
 * Implements optimizations for handling large numbers of clients and transactions
 */
export class DatabaseOptimizationService {
  /**
   * Optimized transfer queries with pagination and indexing
   */
  static async getTransfersOptimized(
    userId: string,
    page: number = 1,
    limit: number = 20,
    status?: string,
    dateFrom?: Date,
    dateTo?: Date
  ) {
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (status) where.status = status;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    // Use parallel queries for better performance
    const [transfers, totalCount] = await Promise.all([
      prisma.transfer.findMany({
        where,
        select: {
          id: true,
          amountCAD: true,
          amountMGA: true,
          status: true,
          type: true,
          createdAt: true,
          beneficiary: {
            select: {
              id: true,
              name: true,
              phone: true,
              city: true,
              country: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.transfer.count({ where }),
    ]);

    return {
      transfers,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Optimized admin dashboard queries with aggregations
   */
  static async getAdminDashboardStatsOptimized() {
    // Use raw queries for complex aggregations when needed
    const [userStats, transferStats, subscriptionStats, recentTransfers] =
      await Promise.all([
        // User statistics
        prisma.user.aggregate({
          _count: true,
          where: { status: "ACTIVE" },
        }),

        // Transfer statistics with aggregations
        prisma.transfer.aggregate({
          _count: true,
          _sum: {
            amountCAD: true,
            feeCAD: true,
          },
          where: {
            status: "COMPLETED",
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        }),

        // Subscription statistics
        prisma.subscription.aggregate({
          _count: true,
          where: { status: "ACTIVE" },
        }),

        // Recent transfers with limited data
        prisma.transfer.findMany({
          select: {
            id: true,
            amountCAD: true,
            status: true,
            createdAt: true,
            user: {
              select: { name: true, email: true },
            },
            beneficiary: {
              select: { name: true, city: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
      ]);

    return {
      users: {
        total: userStats._count,
      },
      transfers: {
        total: transferStats._count,
        totalVolume: Number(transferStats._sum.amountCAD || 0),
        totalFees: Number(transferStats._sum.feeCAD || 0),
      },
      subscriptions: {
        active: subscriptionStats._count,
      },
      recentTransfers,
    };
  }

  /**
   * Batch processing for large operations
   */
  static async batchUpdateTransfers(
    updates: Array<{ id: string; status: string; confirmedBy?: string }>
  ) {
    // Process in batches to avoid overwhelming the database
    const batchSize = 100;
    const results = [];

    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);

      const batchPromises = batch.map((update) =>
        prisma.transfer.update({
          where: { id: update.id },
          data: {
            status: update.status as any,
            confirmedBy: update.confirmedBy,
            confirmedAt: update.status === "COMPLETED" ? new Date() : undefined,
            updatedAt: new Date(),
          },
        })
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Optimized search with full-text search capabilities
   */
  static async searchTransfersOptimized(
    searchTerm: string,
    userId?: string,
    limit: number = 20
  ) {
    // Use database-specific full-text search for better performance
    const whereClause = userId ? `AND t.user_id = '${userId}'` : "";

    const query = `
      SELECT 
        t.id,
        t.amount_cad,
        t.amount_mga,
        t.status,
        t.type,
        t.created_at,
        u.name as user_name,
        u.email as user_email,
        b.name as beneficiary_name,
        b.phone as beneficiary_phone,
        b.city as beneficiary_city
      FROM transfers t
      JOIN users u ON t.user_id = u.id
      JOIN beneficiaries b ON t.beneficiary_id = b.id
      WHERE (
        u.name ILIKE $1 OR
        u.email ILIKE $1 OR
        b.name ILIKE $1 OR
        b.phone ILIKE $1 OR
        t.id::text ILIKE $1
      ) ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT $2
    `;

    const searchPattern = `%${searchTerm}%`;
    const results = await prisma.$queryRawUnsafe(query, searchPattern, limit);

    return results;
  }

  /**
   * Database connection pooling optimization
   */
  static async optimizeConnectionPool() {
    // Check current connection status
    const connectionInfo = await prisma.$queryRaw`
      SELECT 
        count(*) as active_connections,
        current_setting('max_connections') as max_connections
      FROM pg_stat_activity 
      WHERE state = 'active'
    `;

    console.log("[DB_OPTIMIZATION] Connection pool status:", connectionInfo);

    // Cleanup idle connections if needed
    await prisma.$queryRaw`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE state = 'idle'
      AND state_change < NOW() - INTERVAL '5 minutes'
      AND query NOT LIKE '%pg_stat_activity%'
    `;
  }

  /**
   * Database maintenance and optimization
   */
  static async performMaintenance() {
    try {
      console.log("[DB_MAINTENANCE] Starting database maintenance...");

      // Analyze tables for query optimization
      await prisma.$executeRaw`ANALYZE transfers, users, beneficiaries, subscriptions`;

      // Update statistics
      await prisma.$executeRaw`UPDATE pg_stat_user_tables SET n_tup_ins = n_tup_ins`;

      // Vacuum analyze on critical tables (if needed)
      // Note: This should be done during maintenance windows
      // await prisma.$executeRaw`VACUUM ANALYZE transfers`;

      console.log("[DB_MAINTENANCE] Database maintenance completed");
    } catch (error) {
      console.error("[DB_MAINTENANCE] Maintenance failed:", error);
    }
  }

  /**
   * Get database performance metrics
   */
  static async getDatabaseMetrics() {
    const [tableStats, indexStats, connectionStats, slowQueries] =
      await Promise.all([
        // Table statistics
        prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes,
          n_live_tup as live_tuples,
          n_dead_tup as dead_tuples
        FROM pg_stat_user_tables
        ORDER BY n_live_tup DESC
      `,

        // Index usage statistics
        prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          indexrelname,
          idx_tup_read as index_reads,
          idx_tup_fetch as index_fetches
        FROM pg_stat_user_indexes
        WHERE idx_tup_read > 0
        ORDER BY idx_tup_read DESC
        LIMIT 10
      `,

        // Connection statistics
        prisma.$queryRaw`
        SELECT 
          state,
          count(*) as count
        FROM pg_stat_activity
        GROUP BY state
      `,

        // Long-running queries (potential issues)
        prisma.$queryRaw`
        SELECT 
          pid,
          user as db_user,
          application_name,
          state,
          query_start,
          state_change,
          EXTRACT(EPOCH FROM (NOW() - query_start)) as duration_seconds,
          LEFT(query, 100) as query_snippet
        FROM pg_stat_activity
        WHERE state != 'idle'
        AND query_start < NOW() - INTERVAL '30 seconds'
        ORDER BY query_start ASC
      `,
      ]);

    return {
      tableStats,
      indexStats,
      connectionStats,
      slowQueries,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Implement caching strategy for frequently accessed data
   */
  private static cache = new Map<string, { data: any; expiry: number }>();

  static async getCachedData<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMinutes: number = 5
  ): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && cached.expiry > now) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(key, {
      data,
      expiry: now + ttlMinutes * 60 * 1000,
    });

    return data;
  }

  /**
   * Clear cache
   */
  static clearCache(pattern?: string) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * Initialize database optimizations
   */
  static async initialize() {
    console.log("[DB_OPTIMIZATION] Initializing database optimizations...");

    // Set up periodic maintenance
    if (process.env.NODE_ENV === "production") {
      // Run maintenance every 6 hours
      setInterval(() => {
        this.performMaintenance();
      }, 6 * 60 * 60 * 1000);

      // Optimize connection pool every hour
      setInterval(() => {
        this.optimizeConnectionPool();
      }, 60 * 60 * 1000);
    }

    console.log("[DB_OPTIMIZATION] Database optimizations initialized");
  }
}
