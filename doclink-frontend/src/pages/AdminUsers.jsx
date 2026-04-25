// @ts-nocheck
import React, { useMemo, useState } from "react";
import api from "../api/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Users, Search, Shield, User, Trash2, KeyRound } from "lucide-react";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { toast } from "sonner";

const roleColors = {
  PATIENT: "bg-blue-100 text-blue-700",
  DOCTOR: "bg-teal-100 text-teal-700",
  ADMIN: "bg-purple-100 text-purple-700",
};

const roleLabels = {
  PATIENT: "Patient",
  DOCTOR: "Doctor",
  ADMIN: "Admin",
};

export default function AdminUsers() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [deletingUser, setDeletingUser] = useState(null);
  const [passwordUser, setPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await api.get("/users");
      const payload = res.data;

      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.users)) return payload.users;
      if (Array.isArray(payload?.data)) return payload.data;

      return [];
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }) => {
      const res = await api.patch(`/users/${id}/role`, { role });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User role updated");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update role");
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, password }) => {
      const res = await api.patch(`/users/${id}/password`, { password });
      return res.data;
    },
    onSuccess: () => {
      setShowSuccess(true);
      setTimeout(() => {
    setShowSuccess(false);
  }, 3000);
      setPasswordUser(null);
      setNewPassword("");
      setShowPassword(false);
      
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update password");
    },
  } );

  const deleteUserMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/users/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User removed");
      setDeletingUser(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to remove user");
    },
  });

  const normalizedUsers = useMemo(() => {
    return users.map((user) => {
      const role = (user.role || user.user_type || "PATIENT").toUpperCase();

      const displayName =
        user.name ||
        user.full_name ||
        user.doctor?.name ||
        user.patient?.name ||
        user.email?.split("@")[0] ||
        "No name";

      const createdAt = user.createdAt || user.created_date || user.created_at || null;

      return {
        ...user,
        role,
        displayName,
        createdAt,
      };
    });
  }, [users]);

  const filteredUsers = normalizedUsers.filter((user) => {
    const q = searchTerm.toLowerCase();

    const matchesSearch =
      user.displayName.toLowerCase().includes(q) ||
      (user.email || "").toLowerCase().includes(q);

    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const totalUsers = normalizedUsers.length;
  const totalPatients = normalizedUsers.filter((u) => u.role === "PATIENT").length;
  const totalDoctors = normalizedUsers.filter((u) => u.role === "DOCTOR").length;
  const totalAdmins = normalizedUsers.filter((u) => u.role === "ADMIN").length;

  const handlePasswordSave = () => {
    if (!passwordUser) return;
    if (!newPassword || newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }
    setPasswordError("");
    resetPasswordMutation.mutate({
      id: passwordUser.id,
      password: newPassword,
    });
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Users</h1>
        <p className="text-slate-500 mt-1">Manage platform users and their roles</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 bg-white"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-12 px-3 border rounded-md bg-white min-w-[160px]"
        >
          <option value="ALL">All Users</option>
          <option value="PATIENT">Patients</option>
          <option value="DOCTOR">Doctors</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Total Users</p>
          <p className="text-2xl font-bold text-slate-800">{totalUsers}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Patients</p>
          <p className="text-2xl font-bold text-blue-600">{totalPatients}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Doctors</p>
          <p className="text-2xl font-bold text-teal-600">{totalDoctors}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-sm text-slate-500">Admins</p>
          <p className="text-2xl font-bold text-purple-600">{totalAdmins}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-4 px-6">User</th>
                  <th className="text-left py-4 px-6">Email</th>
                  <th className="text-left py-4 px-6">Type</th>
                  <th className="text-left py-4 px-6">Role</th>
                  <th className="text-left py-4 px-6">Joined</th>
                  <th className="text-right py-4 px-6">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-slate-50"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatarUrl || user.avatar_url} />
                          <AvatarFallback>
                            {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-slate-800">{user.displayName}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6">{user.email}</td>

                    <td className="py-4 px-6">
                      <Badge className={`${roleColors[user.role] || roleColors.PATIENT} border-0`}>
                        {roleLabels[user.role] || "Patient"}
                      </Badge>
                    </td>

                    <td className="py-4 px-6">
                      {user.role === "ADMIN" ? (
                        <Badge className="bg-purple-100 text-purple-700 border-0">
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <User className="w-3 h-3 mr-1" />
                          {roleLabels[user.role] || "User"}
                        </Badge>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "N/A"}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            updateRoleMutation.mutate({
                              id: user.id,
                              role: e.target.value,
                            })
                          }
                          className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm"
                        >
                          <option value="PATIENT">Patient</option>
                          <option value="DOCTOR">Doctor</option>
                          <option value="ADMIN">Admin</option>
                        </select>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPasswordUser(user)}
                          title="Change Password"
                        >
                          <KeyRound className="w-4 h-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500"
                          onClick={() => setDeletingUser(user)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
          <Users className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800">No users found</h3>
        </div>
      )}

      {passwordUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-800">Change Password</h3>
            <p className="text-slate-500 mt-2">
              Set a new password for <span className="font-medium">{passwordUser.email}</span>
            </p>
<div className="relative mt-4">
            <Input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => {
              setNewPassword(e.target.value);

              if (e.target.value.length >= 6) {
                setPasswordError("");
              }
              }}
              placeholder="Enter new password"
              className={`mt-4 ${passwordError ? "border-red-500 focus:ring-red-500" : ""}`}
              />

              {passwordError && (
              <p className="text-red-500 text-sm mt-1">{passwordError}</p>
              )}

              <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
</div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setPasswordUser(null);
                  setNewPassword("");
                  setPasswordError("");
                }}
              >
                Cancel
              </Button>

              <Button
                className="flex-1"
                onClick={handlePasswordSave}
              >
                Save Password
              </Button>

              
            </div>
          </div>
        </div>
      )}

      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-800">Delete User</h3>
            <p className="text-slate-500 mt-2">
              Are you sure you want to delete <span className="font-medium">{deletingUser.email}</span>?
            </p>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeletingUser(null)}
              >
                Cancel
              </Button>

              <Button
                className="flex-1 bg-red-500 hover:bg-red-600"
                onClick={() => deleteUserMutation.mutate(deletingUser.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
  <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
    Password successfully changed!
  </div>
)}
    </div>
  );
}