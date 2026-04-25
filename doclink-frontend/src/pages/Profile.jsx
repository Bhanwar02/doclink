// @ts-nocheck
import React, { useState, useEffect } from "react";
import api from "../api/api";
import {  Save } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    address: "",
    emergency_contact: "",
    medical_history: "",
    allergies: "",
    blood_group: "",
  });

  useEffect(() => {
    loadUser();
  }, []);

  // ✅ LOAD PROFILE (persist after refresh)
const loadUser = async () => {
  try {
    const res = await api.get("/patient/profile");
    const data = res.data;

    console.log("PROFILE RESPONSE:", data);

    // 👤 user info (header)
    if (data?.user) {
      setUser(data.user);
    }

    // 🧾 profile info (form fields)
    if (data?.profile) {
      setFormData({
        full_name: data.profile.full_name || "",
        phone: data.profile.phone || "",
        date_of_birth: data.profile.date_of_birth
          ? data.profile.date_of_birth.split("T")[0]
          : "",
        gender: data.profile.gender || "",
        address: data.profile.address || "",
        emergency_contact: data.profile.emergency_contact || "",
        medical_history: data.profile.medical_history || "",
        allergies: data.profile.allergies || "",
        blood_group: data.profile.blood_group || "",
      });
    }

  } catch (err) {
    console.log("LOAD ERROR:", err);
  } finally {
    setLoading(false);
  }
};

  // ✅ VALIDATION
 const validate = () => {
  let errors = {};

  if (!formData.full_name) {
    errors.full_name = "Full name is required";
  }

  if (!formData.phone) {
    errors.phone = "Phone is required";
  } else if (!/^\d{10}$/.test(formData.phone)) {
    errors.phone = "Phone must be exactly 10 digits";
  }

  if (!formData.gender) {
    errors.gender = "Gender is required";
  }

  if (!formData.blood_group) {
    errors.blood_group = "Blood group is required";
  }

  setErrors(errors);

  return Object.keys(errors).length === 0;
};

  // ✅ SAVE
  const handleSave = async () => {
    setSuccessMsg("");

    if (!validate()) return;

    setSaving(true);

    try {
      await api.post("/patient/profile", formData);

      setSuccessMsg("Saved successfully ✔");

      // refresh from backend to ensure persistence correctness
      await loadUser();

      setTimeout(() => setSuccessMsg(""), 2000);
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[60vh]">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Patient Profile</h1>
        <p className="text-slate-500 mt-1">View your personal information</p>
      </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="h-24 w-24 ring-4 ring-teal-100">
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white text-2xl font-bold">
                    {formData.full_name?.[0]?.toUpperCase() || "P"}
                  </AvatarFallback>
                </Avatar>

                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-slate-800">{formData.full_name}</h2>
                  <p className="text-slate-500">{user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      {/* FORM */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Patient Profile</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          {/* FULL NAME */}
          <div>
            <Label>Full Name</Label>
            <Input
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
            />
            {errors.full_name && (
              <p className="text-red-500 text-sm">{errors.full_name}</p>
            )}
          </div>

          {/* PHONE */}
          <div>
            <Label>Phone</Label>
            <Input
  value={formData.phone}
  onChange={(e) => {
    const value = e.target.value;

    // only numbers + max 10 digits
    if (/^\d{0,10}$/.test(value)) {
      setFormData({ ...formData, phone: value });
    }
  }}
  maxLength={10}
/>
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone}</p>
            )}
          </div>

          {/* DOB */}
          <div>
            <Label>Date of Birth</Label>
            <Input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) =>
                setFormData({ ...formData, date_of_birth: e.target.value })
              }
            />
          </div>

          {/* GENDER */}
          <div>
            <Label>Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(v) =>
                setFormData({ ...formData, gender: v })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GENDERS.map((g) => (
                  <SelectItem key={g.value} value={g.value}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.gender && (
              <p className="text-red-500 text-sm">{errors.gender}</p>
            )}
          </div>

          {/* BLOOD GROUP */}
          <div>
            <Label>Blood Group</Label>
            <Select
              value={formData.blood_group}
              onValueChange={(v) =>
                setFormData({ ...formData, blood_group: v })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BLOOD_GROUPS.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.blood_group && (
              <p className="text-red-500 text-sm">{errors.blood_group}</p>
            )}
          </div>

          {/* ADDRESS */}
          <div>
            <Label>Address</Label>
            <Textarea
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>

          {/* EMERGENCY CONTACT */}
          <div>
            <Label>Emergency Contact</Label>
            <Input
              value={formData.emergency_contact}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  emergency_contact: e.target.value,
                })
              }
            />
          </div>

          {/* MEDICAL HISTORY */}
          <div>
            <Label>Medical History</Label>
            <Textarea
              value={formData.medical_history}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  medical_history: e.target.value,
                })
              }
            />
          </div>

          {/* ALLERGIES */}
          <div>
            <Label>Allergies</Label>
            <Textarea
              value={formData.allergies}
              onChange={(e) =>
                setFormData({ ...formData, allergies: e.target.value })
              }
            />
          </div>

        </CardContent>
      </Card>

      {/* SAVE BUTTON */}
      <div className="mt-6 flex flex-col items-center gap-2">

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-teal-500"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>

        {successMsg && (
          <p className="text-green-600 font-medium">{successMsg}</p>
        )}

      </div>

    </div>
  );
}