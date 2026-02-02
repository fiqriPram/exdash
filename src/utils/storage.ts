import { User, UserRole, SavedMapping, ReportHistory } from "@/types";

const STORAGE_KEYS = {
  USERS: "autoreport_users",
  CURRENT_USER: "autoreport_current_user",
  MAPPINGS: "autoreport_mappings",
  REPORT_HISTORY: "autoreport_history",
  SETTINGS: "autoreport_settings",
};

// Default admin user
const DEFAULT_ADMIN: User = {
  id: "admin-1",
  username: "admin",
  name: "Administrator",
  role: "admin",
  createdAt: new Date().toISOString(),
};

const DEFAULT_USER: User = {
  id: "user-1",
  username: "user",
  name: "Regular User",
  role: "user",
  createdAt: new Date().toISOString(),
};

// Initialize storage with default users
export function initializeStorage(): void {
  if (typeof window === "undefined") return;

  const existingUsers = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!existingUsers) {
    localStorage.setItem(
      STORAGE_KEYS.USERS,
      JSON.stringify([DEFAULT_ADMIN, DEFAULT_USER]),
    );
  }
}

// User Management
export function getUsers(): User[] {
  if (typeof window === "undefined") return [];
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  return users ? JSON.parse(users) : [];
}

export function addUser(user: Omit<User, "id" | "createdAt">): User {
  const users = getUsers();
  const newUser: User = {
    ...user,
    id: `user-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  return newUser;
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return null;

  users[index] = { ...users[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  return users[index];
}

export function deleteUser(id: string): boolean {
  const users = getUsers();
  const filtered = users.filter((u) => u.id !== id);
  if (filtered.length === users.length) return false;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
  return true;
}

// Authentication
export function login(username: string, password: string): User | null {
  if (typeof window === "undefined") return null;

  // Simple password check: username + "123"
  const expectedPassword = `${username}123`;
  if (password !== expectedPassword) return null;

  const users = getUsers();
  const user = users.find((u) => u.username === username);

  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  }
  return null;
}

export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === "admin";
}

// Saved Mappings
export function getSavedMappings(userId?: string): SavedMapping[] {
  if (typeof window === "undefined") return [];
  const mappings = localStorage.getItem(STORAGE_KEYS.MAPPINGS);
  const allMappings = mappings ? JSON.parse(mappings) : [];

  if (userId) {
    return allMappings.filter((m: SavedMapping) => m.id.startsWith(userId));
  }
  return allMappings;
}

export function saveMapping(
  mapping: Omit<SavedMapping, "id" | "createdAt" | "updatedAt">,
  userId: string,
): SavedMapping {
  const mappings = getSavedMappings();
  const newMapping: SavedMapping = {
    ...mapping,
    id: `${userId}-mapping-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mappings.push(newMapping);
  localStorage.setItem(STORAGE_KEYS.MAPPINGS, JSON.stringify(mappings));
  return newMapping;
}

export function deleteMapping(id: string): boolean {
  const mappings = getSavedMappings();
  const filtered = mappings.filter((m) => m.id !== id);
  if (filtered.length === mappings.length) return false;
  localStorage.setItem(STORAGE_KEYS.MAPPINGS, JSON.stringify(filtered));
  return true;
}

// Report History
export function getReportHistory(userId?: string): ReportHistory[] {
  if (typeof window === "undefined") return [];
  const history = localStorage.getItem(STORAGE_KEYS.REPORT_HISTORY);
  const allHistory = history ? JSON.parse(history) : [];

  if (userId) {
    return allHistory.filter((h: ReportHistory) => h.id.startsWith(userId));
  }
  return allHistory.sort(
    (a: ReportHistory, b: ReportHistory) =>
      new Date(b.exportedAt).getTime() - new Date(a.exportedAt).getTime(),
  );
}

export function addReportToHistory(
  report: Omit<ReportHistory, "id" | "exportedAt">,
  userId: string,
): ReportHistory {
  const history = getReportHistory();
  const newReport: ReportHistory = {
    ...report,
    id: `${userId}-report-${Date.now()}`,
    exportedAt: new Date().toISOString(),
  };
  history.unshift(newReport);

  // Keep only last 100 reports per user to prevent storage overflow
  const userReports = history
    .filter((h) => h.id.startsWith(userId))
    .slice(0, 100);
  const otherReports = history.filter((h) => !h.id.startsWith(userId));

  localStorage.setItem(
    STORAGE_KEYS.REPORT_HISTORY,
    JSON.stringify([...userReports, ...otherReports]),
  );
  return newReport;
}

export function deleteReportFromHistory(id: string): boolean {
  const history = getReportHistory();
  const filtered = history.filter((h) => h.id !== id);
  if (filtered.length === history.length) return false;
  localStorage.setItem(STORAGE_KEYS.REPORT_HISTORY, JSON.stringify(filtered));
  return true;
}

export function clearReportHistory(userId?: string): void {
  if (userId) {
    const history = getReportHistory();
    const filtered = history.filter((h) => !h.id.startsWith(userId));
    localStorage.setItem(STORAGE_KEYS.REPORT_HISTORY, JSON.stringify(filtered));
  } else {
    localStorage.removeItem(STORAGE_KEYS.REPORT_HISTORY);
  }
}

// Backup & Restore
export function exportAllData(): string {
  const data = {
    users: getUsers(),
    mappings: getSavedMappings(),
    history: getReportHistory(),
    exportedAt: new Date().toISOString(),
    version: "1.0",
  };
  return JSON.stringify(data, null, 2);
}

export function importAllData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);

    if (data.users) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
    }
    if (data.mappings) {
      localStorage.setItem(
        STORAGE_KEYS.MAPPINGS,
        JSON.stringify(data.mappings),
      );
    }
    if (data.history) {
      localStorage.setItem(
        STORAGE_KEYS.REPORT_HISTORY,
        JSON.stringify(data.history),
      );
    }
    return true;
  } catch {
    return false;
  }
}

export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
  initializeStorage();
}

// Settings
export function getSettings(): {
  deleteAfterExport: boolean;
  defaultPeriod: string;
} {
  if (typeof window === "undefined")
    return { deleteAfterExport: false, defaultPeriod: "monthly" };
  const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return settings
    ? JSON.parse(settings)
    : { deleteAfterExport: false, defaultPeriod: "monthly" };
}

export function saveSettings(settings: {
  deleteAfterExport: boolean;
  defaultPeriod: string;
}): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}
