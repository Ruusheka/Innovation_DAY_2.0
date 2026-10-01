// ============================================================
// Lightweight In-Memory Sliding-Window Rate Limiter
// Zero external infrastructure required.
// Protects critical endpoints from automated loops/rapid bursts.
// ============================================================

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

// Cleanup stale keys periodically to avoid memory growth
let lastCleanup = Date.now();
function cleanup() {
  const now = Date.now();
  if (now - lastCleanup > 60000) {
    lastCleanup = now;
    for (const [key, record] of memoryStore.entries()) {
      if (record.resetAt <= now) {
        memoryStore.delete(key);
      }
    }
  }
}

/**
 * Checks whether an action from a given identifier exceeds limit within windowMs.
 * @param identifier Unique key (e.g., admin ID, IP, or combination)
 * @param maxRequests Maximum requests allowed within window
 * @param windowMs Time window in milliseconds (default: 60,000ms = 1 minute)
 * @returns { success: boolean; remaining: number; resetAt: number }
 */
export function checkRateLimit(
  identifier: string,
  maxRequests = 60,
  windowMs = 60000
): { success: boolean; remaining: number; resetAt: number } {
  cleanup();
  const now = Date.now();
  const record = memoryStore.get(identifier);

  if (!record || record.resetAt <= now) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + windowMs,
    };
    memoryStore.set(identifier, newRecord);
    return {
      success: true,
      remaining: maxRequests - 1,
      resetAt: newRecord.resetAt,
    };
  }

  if (record.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  record.count += 1;
  return {
    success: true,
    remaining: maxRequests - record.count,
    resetAt: record.resetAt,
  };
}
