// @ts-nocheck
import React, { useState } from "react";
import api from "../api/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Plus,
  Stethoscope,
  Edit,
  Trash2,
  Search,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Switch } from "../components/ui/switch";
import { toast } from "sonner";

const SPECIALTIES = [
  "General Practice",
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Orthopedics",
  "Neurology",
  "Psychiatry",
  "Gynecology",
  "Ophthalmology",
  "ENT",
];

const emptyForm = {
  name: "",
  email: "",
  specialty: "",
  qualification: "",
  experienceYears: 0,
  bio: "",
  consultationFee: 0,
  isActive: true,
};

export default function ManageDoctors() {
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [deletingDoctor, setDeletingDoctor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState(emptyForm);

  const { data: doctors = [], isLoading } = useQuery({
  queryKey: ["doctors"],
  queryFn: async () => {
    const res = await api.get("/doctors");
    console.log("GET /doctors response:", res.data);

    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data?.doctors)) return res.data.doctors;
    if (Array.isArray(res.data?.data)) return res.data.data;

    return [];
  },
});

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        name: data.name,
        email: data.email,
        specialty: data.specialty,
        qualification: data.qualification,
        experienceYears: Number(data.experienceYears) || 0,
        bio: data.bio,
        consultationFee: Number(data.consultationFee) || 0,
        isActive: data.isActive,
      };

      const res = await api.post("/doctors", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      toast.success("Doctor added successfully");
      resetForm();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to add doctor");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const payload = {
        name: data.name,
        specialty: data.specialty,
        qualification: data.qualification,
        experienceYears: Number(data.experienceYears) || 0,
        bio: data.bio,
        consultationFee: Number(data.consultationFee) || 0,
        isActive: data.isActive,
      };

      const res = await api.put(`/doctors/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      toast.success("Doctor updated successfully");
      resetForm();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update doctor");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/doctors/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      toast.success("Doctor removed");
      setDeletingDoctor(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to remove doctor");
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }) => {
      const res = await api.patch(`/doctors/${id}/status`, { isActive });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      toast.success("Doctor status updated");
    },
    onError: async ({ response }) => {
      toast.error(response?.data?.message || "Failed to update status");
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingDoctor(null);
    setFormData(emptyForm);
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name || "",
      email: doctor.email || doctor.user?.email || "",
      specialty: doctor.specialty || "",
      qualification: doctor.qualification || "",
      experienceYears: doctor.experienceYears ?? doctor.experience_years ?? 0,
      bio: doctor.bio || "",
      consultationFee: doctor.consultationFee ?? doctor.consultation_fee ?? 0,
      isActive: doctor.isActive ?? doctor.is_active ?? true,
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.specialty) {
      toast.error("Please fill in required fields");
      return;
    }

    if (editingDoctor) {
      updateMutation.mutate({
        id: editingDoctor.id,
        data: formData,
      });
      return;
    }

    createMutation.mutate(formData);
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const name = doctor.name || "";
    const email = doctor.email || doctor.user?.email || "";
    const specialty = doctor.specialty || "";

    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Manage Doctors</h1>
          <p className="text-slate-500 mt-1">
            Add, edit, and manage healthcare providers
          </p>
        </div>

        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-teal-500 to-cyan-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Doctor
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Search doctors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 bg-white"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      ) : filteredDoctors.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-slate-600">
                    Doctor
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-600">
                    Specialty
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-600">
                    Experience
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-600">
                    Fee
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-600">
                    Status
                  </th>
                  <th className="text-right py-4 px-6 font-semibold text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredDoctors.map((doctor, index) => {
                  const isActive = doctor.isActive ?? doctor.is_active ?? true;
                  const experience =
                    doctor.experienceYears ?? doctor.experience_years ?? 0;
                  const fee =
                    doctor.consultationFee ?? doctor.consultation_fee ?? 0;
                  const email = doctor.email || doctor.user?.email || "";

                  return (
                    <motion.tr
                      key={doctor.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-slate-800">
                            {doctor.name || "Unnamed Doctor"}
                          </p>
                          <p className="text-sm text-slate-500">{email}</p>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <Badge variant="outline">{doctor.specialty}</Badge>
                      </td>

                      <td className="py-4 px-6 text-slate-600">
                        {experience} years
                      </td>

                      <td className="py-4 px-6 text-slate-600">${fee}</td>

                      <td className="py-4 px-6">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            toggleStatusMutation.mutate({
                              id: doctor.id,
                              isActive: !isActive,
                            })
                          }
                          className="p-0 h-auto"
                        >
                          {isActive ? (
                            <div className="flex items-center gap-2 text-emerald-600">
                              <ToggleRight className="w-5 h-5" />
                              <span>Active</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-slate-400">
                              <ToggleLeft className="w-5 h-5" />
                              <span>Inactive</span>
                            </div>
                          )}
                        </Button>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(doctor)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500"
                            onClick={() => setDeletingDoctor(doctor)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
          <Stethoscope className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800">
            No doctors found
          </h3>
          <p className="text-slate-500">Add your first healthcare provider</p>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDoctor ? "Edit Doctor" : "Add New Doctor"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Doctor full name"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Email Address *</Label>
              <Input
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="doctor@example.com"
                className="mt-1"
                disabled={!!editingDoctor}
              />
            </div>

            <div>
              <Label>Specialty *</Label>
              <Input
                list="doctor-specialties"
                value={formData.specialty}
                onChange={(e) =>
                  setFormData({ ...formData, specialty: e.target.value })
                }
                placeholder="Select specialty"
                className="mt-1"
              />
              <datalist id="doctor-specialties">
                {SPECIALTIES.map((spec) => (
                  <option key={spec} value={spec} />
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Qualification</Label>
                <Input
                  value={formData.qualification}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      qualification: e.target.value,
                    })
                  }
                  placeholder="e.g., MBBS, MD"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Experience (years)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.experienceYears}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      experienceYears: parseInt(e.target.value) || 0,
                    })
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Consultation Fee ($)</Label>
              <Input
                type="number"
                min="0"
                value={formData.consultationFee}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    consultationFee: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0 for free"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Bio</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Brief description..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <Label className="cursor-pointer">Active</Label>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={resetForm} className="flex-1">
                Cancel
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500"
              >
                {editingDoctor ? "Update" : "Add Doctor"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {deletingDoctor && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-800">
              Remove Doctor
            </h3>
            <p className="text-slate-500 mt-2">
              Are you sure you want to remove this doctor? This action cannot be
              undone.
            </p>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeletingDoctor(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600"
                onClick={() => deleteMutation.mutate(deletingDoctor.id)}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}