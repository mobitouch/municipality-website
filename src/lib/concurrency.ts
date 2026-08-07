/**
 * Admission control for CPU-expensive request handlers.
 *
 * Rate limiting is per-IP, so it does nothing against many *different*
 * clients submitting at once — and each complaint submission does real work
 * on the single Node event loop (multipart parsing, buffering attachments,
 * base64-encoding them for SMTP). Enough concurrent submissions and the
 * process pegs a core, which is what the hosting CPU graph was showing.
 *
 * This caps how many of those handlers run at the same time and how many may
 * wait. Over the queue limit — or after waiting too long — we shed load with
 * a 503 instead of accepting work we can't do. A fast, honest rejection keeps
 * the rest of the site responsive.
 */
export class Semaphore {
  private active = 0;
  /** Each waiter returns false if it had already timed out and was skipped. */
  private readonly waiters: Array<() => boolean> = [];

  constructor(
    private readonly limit: number,
    private readonly maxQueue: number,
    private readonly queueTimeoutMs: number,
  ) {}

  /** Resolves with a release function, or `null` if we should shed the request. */
  acquire(): Promise<(() => void) | null> {
    if (this.active < this.limit) {
      this.active += 1;
      return Promise.resolve(this.makeRelease());
    }

    if (this.waiters.length >= this.maxQueue) {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      let settled = false;

      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        const index = this.waiters.indexOf(grant);
        if (index !== -1) this.waiters.splice(index, 1);
        resolve(null);
      }, this.queueTimeoutMs);

      const grant = () => {
        if (settled) return false;
        settled = true;
        clearTimeout(timer);
        this.active += 1;
        resolve(this.makeRelease());
        return true;
      };

      this.waiters.push(grant);
    });
  }

  private makeRelease(): () => void {
    let released = false;
    return () => {
      if (released) return;
      released = true;
      this.active -= 1;
      // Hand the slot to the next live waiter; skip any that timed out
      // between being queued and being reached.
      while (this.waiters.length > 0) {
        const next = this.waiters.shift();
        if (next?.() !== false) break;
      }
    };
  }
}

function envInt(name: string, fallback: number, min: number): number {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value >= min ? Math.floor(value) : fallback;
}

/**
 * Two concurrent submissions in flight, four more allowed to queue for up to
 * 10s. Sized for a shared 2-core plan: it keeps headroom for page rendering
 * while still absorbing the natural bursts of a municipal site.
 */
export const submissionGate = new Semaphore(
  envInt("SUBMISSION_CONCURRENCY", 2, 1),
  envInt("SUBMISSION_QUEUE", 4, 0),
  envInt("SUBMISSION_QUEUE_TIMEOUT_MS", 10_000, 1_000),
);
