/* ============================================================================
   DATA LAYER ABSTRACTION (user/personalization data)
   None of this is wired to a backend yet — it defines the contract the app will
   use for user state. v1 implementation is local-only (localStorage). v2 swaps
   in an authenticated API client implementing the SAME interface. UI components
   call `useUserData()` and never learn where the data lives.
   ========================================================================== */

export interface ReadingProgress {
  slug: string;
  percent: number; // 0..100
  updatedAt: string;
}

export interface UserDataProvider {
  /** Saved / bookmarked articles. */
  getSaved(): Promise<string[]>;
  toggleSaved(slug: string): Promise<string[]>;
  /** Reading progress per article. */
  getProgress(slug: string): Promise<ReadingProgress | null>;
  setProgress(slug: string, percent: number): Promise<void>;
  /** Highlights / notes — reserved for v2. */
  getNotes(slug: string): Promise<string[]>;
}

const SAVED_KEY = "hf:saved";
const PROGRESS_KEY = "hf:progress";

/** v1: browser-local provider. No account required, fully static-compatible. */
export class LocalUserDataProvider implements UserDataProvider {
  private read<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }
  private write<T>(key: string, value: T) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  async getSaved(): Promise<string[]> {
    return this.read<string[]>(SAVED_KEY, []);
  }
  async toggleSaved(slug: string): Promise<string[]> {
    const saved = await this.getSaved();
    const next = saved.includes(slug)
      ? saved.filter((s) => s !== slug)
      : [...saved, slug];
    this.write(SAVED_KEY, next);
    return next;
  }
  async getProgress(slug: string): Promise<ReadingProgress | null> {
    const all = this.read<Record<string, ReadingProgress>>(PROGRESS_KEY, {});
    return all[slug] ?? null;
  }
  async setProgress(slug: string, percent: number): Promise<void> {
    const all = this.read<Record<string, ReadingProgress>>(PROGRESS_KEY, {});
    all[slug] = { slug, percent, updatedAt: new Date().toISOString() };
    this.write(PROGRESS_KEY, all);
  }
  async getNotes(): Promise<string[]> {
    return [];
  }
}

let instance: UserDataProvider | null = null;
export function getUserDataProvider(): UserDataProvider {
  if (!instance) instance = new LocalUserDataProvider();
  return instance;
}
