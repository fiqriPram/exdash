"use client";

import React, { useState } from "react";
import { Users, Plus, Trash2, Shield, User as UserIcon, X } from "lucide-react";
import { User, UserRole } from "@/types";
import { getUsers, addUser, deleteUser } from "@/utils/storage";

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(getUsers());
  const [isAdding, setIsAdding] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    name: "",
    role: "user" as UserRole,
  });

  const handleAddUser = () => {
    if (!newUser.username || !newUser.name) return;

    const user = addUser(newUser);
    setUsers([...users, user]);
    setIsAdding(false);
    setNewUser({ username: "", name: "", role: "user" });
  };

  const handleDeleteUser = (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUser(id);
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  return (
    <div className="bg-background rounded-xl shadow-sm border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">
            User Management
          </h3>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {isAdding && (
        <div className="mb-6 p-4 bg-muted rounded-lg border border-border">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-foreground">Add New User</h4>
            <button
              onClick={() => setIsAdding(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Username"
              value={newUser.username}
              onChange={(e) =>
                setNewUser({ ...newUser, username: e.target.value })
              }
              className="px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground placeholder:text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Full Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground placeholder:text-muted-foreground"
            />
            <select
              value={newUser.role}
              onChange={(e) =>
                setNewUser({ ...newUser, role: e.target.value as UserRole })
              }
              className="px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-foreground"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Password will be:{" "}
            <span className="font-mono text-foreground">
              {newUser.username}123
            </span>
          </p>
          <button
            onClick={handleAddUser}
            disabled={!newUser.username || !newUser.name}
            className="mt-4 px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            Create User
          </button>
        </div>
      )}

      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-foreground">
                Name
              </th>
              <th className="px-4 py-3 text-left font-medium text-foreground">
                Username
              </th>
              <th className="px-4 py-3 text-left font-medium text-foreground">
                Role
              </th>
              <th className="px-4 py-3 text-left font-medium text-foreground">
                Created
              </th>
              <th className="px-4 py-3 text-center font-medium text-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-background">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-foreground">
                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                    {user.name}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {user.username}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      user.role === "admin"
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    }`}
                  >
                    {user.role === "admin" ? (
                      <Shield className="w-3 h-3" />
                    ) : (
                      <UserIcon className="w-3 h-3" />
                    )}
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-destructive/70 hover:text-destructive transition-colors"
                    title="Delete user"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
