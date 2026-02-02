module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/Desktop/exdash/src/utils/storage.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addReportToHistory",
    ()=>addReportToHistory,
    "addUser",
    ()=>addUser,
    "clearAllData",
    ()=>clearAllData,
    "clearReportHistory",
    ()=>clearReportHistory,
    "deleteMapping",
    ()=>deleteMapping,
    "deleteReportFromHistory",
    ()=>deleteReportFromHistory,
    "deleteUser",
    ()=>deleteUser,
    "exportAllData",
    ()=>exportAllData,
    "getCurrentUser",
    ()=>getCurrentUser,
    "getReportHistory",
    ()=>getReportHistory,
    "getSavedMappings",
    ()=>getSavedMappings,
    "getSettings",
    ()=>getSettings,
    "getUsers",
    ()=>getUsers,
    "importAllData",
    ()=>importAllData,
    "initializeStorage",
    ()=>initializeStorage,
    "isAdmin",
    ()=>isAdmin,
    "isAuthenticated",
    ()=>isAuthenticated,
    "login",
    ()=>login,
    "logout",
    ()=>logout,
    "saveMapping",
    ()=>saveMapping,
    "saveSettings",
    ()=>saveSettings,
    "updateUser",
    ()=>updateUser
]);
const STORAGE_KEYS = {
    USERS: "autoreport_users",
    CURRENT_USER: "autoreport_current_user",
    MAPPINGS: "autoreport_mappings",
    REPORT_HISTORY: "autoreport_history",
    SETTINGS: "autoreport_settings"
};
// Default admin user
const DEFAULT_ADMIN = {
    id: "admin-1",
    username: "admin",
    name: "Administrator",
    role: "admin",
    createdAt: new Date().toISOString()
};
const DEFAULT_USER = {
    id: "user-1",
    username: "user",
    name: "Regular User",
    role: "user",
    createdAt: new Date().toISOString()
};
function initializeStorage() {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
    const existingUsers = undefined;
}
function getUsers() {
    if ("TURBOPACK compile-time truthy", 1) return [];
    //TURBOPACK unreachable
    ;
    const users = undefined;
}
function addUser(user) {
    const users = getUsers();
    const newUser = {
        ...user,
        id: `user-${Date.now()}`,
        createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
}
function updateUser(id, updates) {
    const users = getUsers();
    const index = users.findIndex((u)=>u.id === id);
    if (index === -1) return null;
    users[index] = {
        ...users[index],
        ...updates
    };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return users[index];
}
function deleteUser(id) {
    const users = getUsers();
    const filtered = users.filter((u)=>u.id !== id);
    if (filtered.length === users.length) return false;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filtered));
    return true;
}
function login(username, password) {
    if ("TURBOPACK compile-time truthy", 1) return null;
    //TURBOPACK unreachable
    ;
    // Simple password check: username + "123"
    const expectedPassword = undefined;
    const users = undefined;
    const user = undefined;
}
function logout() {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
function getCurrentUser() {
    if ("TURBOPACK compile-time truthy", 1) return null;
    //TURBOPACK unreachable
    ;
    const user = undefined;
}
function isAuthenticated() {
    return getCurrentUser() !== null;
}
function isAdmin() {
    const user = getCurrentUser();
    return user?.role === "admin";
}
function getSavedMappings(userId) {
    if ("TURBOPACK compile-time truthy", 1) return [];
    //TURBOPACK unreachable
    ;
    const mappings = undefined;
    const allMappings = undefined;
}
function saveMapping(mapping, userId) {
    const mappings = getSavedMappings();
    const newMapping = {
        ...mapping,
        id: `${userId}-mapping-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    mappings.push(newMapping);
    localStorage.setItem(STORAGE_KEYS.MAPPINGS, JSON.stringify(mappings));
    return newMapping;
}
function deleteMapping(id) {
    const mappings = getSavedMappings();
    const filtered = mappings.filter((m)=>m.id !== id);
    if (filtered.length === mappings.length) return false;
    localStorage.setItem(STORAGE_KEYS.MAPPINGS, JSON.stringify(filtered));
    return true;
}
function getReportHistory(userId) {
    if ("TURBOPACK compile-time truthy", 1) return [];
    //TURBOPACK unreachable
    ;
    const history = undefined;
    const allHistory = undefined;
}
function addReportToHistory(report, userId) {
    const history = getReportHistory();
    const newReport = {
        ...report,
        id: `${userId}-report-${Date.now()}`,
        exportedAt: new Date().toISOString()
    };
    history.unshift(newReport);
    // Keep only last 100 reports per user to prevent storage overflow
    const userReports = history.filter((h)=>h.id.startsWith(userId)).slice(0, 100);
    const otherReports = history.filter((h)=>!h.id.startsWith(userId));
    localStorage.setItem(STORAGE_KEYS.REPORT_HISTORY, JSON.stringify([
        ...userReports,
        ...otherReports
    ]));
    return newReport;
}
function deleteReportFromHistory(id) {
    const history = getReportHistory();
    const filtered = history.filter((h)=>h.id !== id);
    if (filtered.length === history.length) return false;
    localStorage.setItem(STORAGE_KEYS.REPORT_HISTORY, JSON.stringify(filtered));
    return true;
}
function clearReportHistory(userId) {
    if (userId) {
        const history = getReportHistory();
        const filtered = history.filter((h)=>!h.id.startsWith(userId));
        localStorage.setItem(STORAGE_KEYS.REPORT_HISTORY, JSON.stringify(filtered));
    } else {
        localStorage.removeItem(STORAGE_KEYS.REPORT_HISTORY);
    }
}
function exportAllData() {
    const data = {
        users: getUsers(),
        mappings: getSavedMappings(),
        history: getReportHistory(),
        exportedAt: new Date().toISOString(),
        version: "1.0"
    };
    return JSON.stringify(data, null, 2);
}
function importAllData(jsonData) {
    try {
        const data = JSON.parse(jsonData);
        if (data.users) {
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
        }
        if (data.mappings) {
            localStorage.setItem(STORAGE_KEYS.MAPPINGS, JSON.stringify(data.mappings));
        }
        if (data.history) {
            localStorage.setItem(STORAGE_KEYS.REPORT_HISTORY, JSON.stringify(data.history));
        }
        return true;
    } catch  {
        return false;
    }
}
function clearAllData() {
    Object.values(STORAGE_KEYS).forEach((key)=>{
        localStorage.removeItem(key);
    });
    initializeStorage();
}
function getSettings() {
    if ("TURBOPACK compile-time truthy", 1) return {
        deleteAfterExport: false,
        defaultPeriod: "monthly"
    };
    //TURBOPACK unreachable
    ;
    const settings = undefined;
}
function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}
}),
"[project]/Desktop/exdash/src/contexts/AuthContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$exdash$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/exdash/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$exdash$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/exdash/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$exdash$2f$src$2f$utils$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/exdash/src/utils/storage.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$exdash$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function AuthProvider({ children }) {
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$exdash$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$exdash$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$exdash$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$exdash$2f$src$2f$utils$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initializeStorage"])();
        const currentUser = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$exdash$2f$src$2f$utils$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCurrentUser"])();
        setUser(currentUser);
        setIsLoading(false);
    }, []);
    const login = async (username, password)=>{
        const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$exdash$2f$src$2f$utils$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["login"])(username, password);
        if (user) {
            setUser(user);
            return true;
        }
        return false;
    };
    const logout = ()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$exdash$2f$src$2f$utils$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["logout"])();
        setUser(null);
    };
    if (isLoading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$exdash$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$exdash$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
            }, void 0, false, {
                fileName: "[project]/Desktop/exdash/src/contexts/AuthContext.tsx",
                lineNumber: 60,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Desktop/exdash/src/contexts/AuthContext.tsx",
            lineNumber: 59,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$exdash$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            isAuthenticated: !!user,
            isAdmin: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$exdash$2f$src$2f$utils$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isAdmin"])(),
            login,
            logout
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/Desktop/exdash/src/contexts/AuthContext.tsx",
        lineNumber: 66,
        columnNumber: 5
    }, this);
}
function useAuth() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$exdash$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
}),
"[project]/Desktop/exdash/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else {
        if ("TURBOPACK compile-time truthy", 1) {
            if ("TURBOPACK compile-time truthy", 1) {
                module.exports = __turbopack_context__.r("[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)");
            } else //TURBOPACK unreachable
            ;
        } else //TURBOPACK unreachable
        ;
    }
} //# sourceMappingURL=module.compiled.js.map
}),
"[project]/Desktop/exdash/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/Desktop/exdash/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}),
"[project]/Desktop/exdash/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/Desktop/exdash/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].React; //# sourceMappingURL=react.js.map
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0e5c7c3c._.js.map