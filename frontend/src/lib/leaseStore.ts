export interface StoredLease {
    id: string;
    name: string;
    state: string;
    riskScore: number;
    uploadedAt: string;
}

const STORAGE_KEY = "leaseguard_leases";

function readStore(): StoredLease[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function writeStore(leases: StoredLease[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leases));
}

/** Save a new lease to localStorage (deduplicates by id) */
export function saveLeaseToStore(lease: StoredLease) {
    const leases = readStore().filter((l) => l.id !== lease.id);
    leases.unshift(lease); // newest first
    writeStore(leases);
}

/** Get all saved leases, newest first */
export function getLeases(): StoredLease[] {
    return readStore();
}

/** Remove a lease from localStorage by id */
export function removeLease(id: string) {
    writeStore(readStore().filter((l) => l.id !== id));
}

/** Get a single lease by id */
export function getLeaseById(id: string): StoredLease | undefined {
    return readStore().find((l) => l.id === id);
}
