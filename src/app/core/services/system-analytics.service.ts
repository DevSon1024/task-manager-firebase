import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  getCountFromServer,
  getDocs
} from '@angular/fire/firestore';

export interface CollectionStats {
  name: string;
  documentCount: number;
  estimatedSizeKB: number;
}

export interface DatabaseUsage {
  totalDocuments: number;
  collections: CollectionStats[];
  totalReadsThisSession: number;
}

export interface StorageUsage {
  totalEstimatedSizeKB: number;
  collections: { name: string; sizeKB: number; percentage: number }[];
  firestoreQuotaMB: number;
  usagePercentage: number;
}

export interface ApiPerformance {
  averageResponseMs: number;
  totalOperations: number;
  recentOperations: { name: string; durationMs: number; timestamp: number }[];
  fastestMs: number;
  slowestMs: number;
}

export interface ErrorRates {
  totalErrors: number;
  totalOperations: number;
  successRate: number;
  recentErrors: { message: string; timestamp: number; operation: string }[];
}

export interface AdvancedMetrics {
  completionRate: number;
  avgCompletionTimeHours: number;
  mostActiveUsers: { uid: string; taskCount: number }[];
}

export interface SystemAnalytics {
  database: DatabaseUsage;
  storage: StorageUsage;
  apiPerformance: ApiPerformance;
  errorRates: ErrorRates;
  advanced: AdvancedMetrics;
  lastUpdated: Date;
}

// Average estimated document sizes in KB for each collection
const AVG_DOC_SIZES: Record<string, number> = {
  users: 1.2,
  tasks: 0.8,
  notes: 1.5,
};

const FIRESTORE_FREE_QUOTA_MB = 1024; // 1 GB free tier

@Injectable({
  providedIn: 'root',
})
export class SystemAnalyticsService {
  private firestore = inject(Firestore);

  // Static trackers for API performance and errors (in-session)
  private static operationLog: { name: string; durationMs: number; timestamp: number }[] = [];
  private static errorLog: { message: string; timestamp: number; operation: string }[] = [];
  private static totalReads = 0;

  /**
   * Call this before and after Firestore operations in services
   * to track performance metrics.
   */
  static trackOperation(name: string, durationMs: number): void {
    SystemAnalyticsService.operationLog.push({
      name,
      durationMs,
      timestamp: Date.now(),
    });
    SystemAnalyticsService.totalReads++;
    // Keep last 50 operations
    if (SystemAnalyticsService.operationLog.length > 50) {
      SystemAnalyticsService.operationLog.shift();
    }
  }

  static trackError(operation: string, message: string): void {
    SystemAnalyticsService.errorLog.push({
      message,
      timestamp: Date.now(),
      operation,
    });
    // Keep last 50 errors
    if (SystemAnalyticsService.errorLog.length > 50) {
      SystemAnalyticsService.errorLog.shift();
    }
  }

  async getAnalytics(): Promise<SystemAnalytics> {
    const collectionNames = ['users', 'tasks', 'notes'];
    const collectionStats: CollectionStats[] = [];

    for (const name of collectionNames) {
      const start = performance.now();
      try {
        const colRef = collection(this.firestore, name);
        const snapshot = await getCountFromServer(colRef);
        const count = snapshot.data().count;
        const duration = performance.now() - start;

        collectionStats.push({
          name,
          documentCount: count,
          estimatedSizeKB: Math.round(count * (AVG_DOC_SIZES[name] || 1) * 100) / 100,
        });

        SystemAnalyticsService.trackOperation(`count_${name}`, Math.round(duration));
      } catch (err: any) {
        const duration = performance.now() - start;
        SystemAnalyticsService.trackError(`count_${name}`, err.message || 'Unknown error');
        SystemAnalyticsService.trackOperation(`count_${name}`, Math.round(duration));

        collectionStats.push({
          name,
          documentCount: 0,
          estimatedSizeKB: 0,
        });
      }
    }

    const totalDocuments = collectionStats.reduce((sum, c) => sum + c.documentCount, 0);
    const totalEstimatedSizeKB = collectionStats.reduce((sum, c) => sum + c.estimatedSizeKB, 0);

    // Database usage
    const database: DatabaseUsage = {
      totalDocuments,
      collections: collectionStats,
      totalReadsThisSession: SystemAnalyticsService.totalReads,
    };

    // Storage usage
    const storageCols = collectionStats.map((c) => ({
      name: c.name,
      sizeKB: c.estimatedSizeKB,
      percentage: totalEstimatedSizeKB > 0 ? Math.round((c.estimatedSizeKB / totalEstimatedSizeKB) * 100) : 0,
    }));

    const storage: StorageUsage = {
      totalEstimatedSizeKB,
      collections: storageCols,
      firestoreQuotaMB: FIRESTORE_FREE_QUOTA_MB,
      usagePercentage:
        totalEstimatedSizeKB > 0
          ? Math.round((totalEstimatedSizeKB / (FIRESTORE_FREE_QUOTA_MB * 1024)) * 10000) / 100
          : 0,
    };

    // API Performance
    const ops = SystemAnalyticsService.operationLog;
    const avgMs =
      ops.length > 0 ? Math.round(ops.reduce((s, o) => s + o.durationMs, 0) / ops.length) : 0;
    const fastestMs = ops.length > 0 ? Math.min(...ops.map((o) => o.durationMs)) : 0;
    const slowestMs = ops.length > 0 ? Math.max(...ops.map((o) => o.durationMs)) : 0;

    const apiPerformance: ApiPerformance = {
      averageResponseMs: avgMs,
      totalOperations: ops.length,
      recentOperations: ops.slice(-10).reverse(),
      fastestMs,
      slowestMs,
    };

    // Error rates
    const errors = SystemAnalyticsService.errorLog;
    const totalOps = ops.length;
    const totalErrors = errors.length;
    const successRate = totalOps > 0 ? Math.round(((totalOps - totalErrors) / totalOps) * 10000) / 100 : 100;

    const errorRates: ErrorRates = {
      totalErrors,
      totalOperations: totalOps,
      successRate: Math.max(0, successRate),
      recentErrors: errors.slice(-5).reverse(),
    };

    // Advanced Metrics Calculation
    let completionRate = 0;
    let avgCompletionTimeHours = 0;
    let mostActiveUsers: { uid: string; taskCount: number }[] = [];

    try {
      const start = performance.now();
      const tasksSnapshot = await getDocs(collection(this.firestore, 'tasks'));
      const duration = performance.now() - start;
      SystemAnalyticsService.trackOperation('fetch_all_tasks_for_metrics', Math.round(duration));

      const tasks = tasksSnapshot.docs.map(d => d.data());
      
      // Completion Rate
      const totalTasksCount = tasks.length;
      const completedTasks = tasks.filter(t => t['completed'] === true);
      if (totalTasksCount > 0) {
        completionRate = Math.round((completedTasks.length / totalTasksCount) * 100);
      }

      // Avg Completion Time (using createdAt and updatedAt for completed tasks)
      let totalCompletionTimeMs = 0;
      let validCompletedTasksCount = 0;
      completedTasks.forEach(t => {
        if (t['createdAt'] && t['updatedAt']) {
          const createdMs = t['createdAt'].toMillis();
          const updatedMs = t['updatedAt'].toMillis();
          if (updatedMs >= createdMs) {
            totalCompletionTimeMs += (updatedMs - createdMs);
            validCompletedTasksCount++;
          }
        }
      });
      if (validCompletedTasksCount > 0) {
        avgCompletionTimeHours = Math.round((totalCompletionTimeMs / validCompletedTasksCount) / (1000 * 60 * 60) * 10) / 10;
      }

      // Most Active Users (by task count)
      const userTaskCounts: Record<string, number> = {};
      tasks.forEach(t => {
        if (t['userId']) {
          userTaskCounts[t['userId']] = (userTaskCounts[t['userId']] || 0) + 1;
        }
      });
      
      mostActiveUsers = Object.keys(userTaskCounts)
        .map(uid => ({ uid, taskCount: userTaskCounts[uid] }))
        .sort((a, b) => b.taskCount - a.taskCount)
        .slice(0, 3);

    } catch (err: any) {
      SystemAnalyticsService.trackError('fetch_all_tasks_for_metrics', err.message || 'Unknown error');
      // If fetching fails (likely due to rules), metrics remain 0
    }

    const advanced: AdvancedMetrics = {
      completionRate,
      avgCompletionTimeHours,
      mostActiveUsers,
    };

    return {
      database,
      storage,
      apiPerformance,
      errorRates,
      advanced,
      lastUpdated: new Date(),
    };
  }
}
