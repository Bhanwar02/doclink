// @ts-nocheck
import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../lib/AuthContext";
import { Save, User, Mail, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

export default function AdminProfileSettings() {
  const { user, isLoadingAuth, checkAppState } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      if (!user?.id) {
        toast.error("User not found");
        return;
      }

      if (!formData.email) {
        toast.error("Email is required");
        return;
      }

      setSaving(true);

      await api.put(`/users/${user.id}`, {
        email: formData.email,
      });

      toast.success("Profile settings saved successfully");

      if (checkAppState) {
        await checkAppState();
      }
    } catch (error) {
      console.error("Admin profile save error:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to save profile settings"
      );
    } finally {
      setSaving(false);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="p-8 text-center text-slate-500">
            Please log in to access profile settings.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Admin Profile Settings</h1>
        <p className="text-slate-500 mt-1">Update your admin account information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-500" />
            Account Settings
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div>
            <Label>Role</Label>
            <div className="mt-1 px-3 py-2 rounded-md border bg-slate-50 text-slate-700">
              {user.role || "ADMIN"}
            </div>
          </div>

          <div>
            <Label>Email *</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                className="pl-10"
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
                placeholder="Enter email"
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || !formData.email}
            className="bg-gradient-to-r from-teal-500 to-cyan-500"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}