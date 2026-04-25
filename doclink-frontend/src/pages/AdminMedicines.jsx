// @ts-nocheck
import React, { useState } from "react";
import api from "../api/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Plus,
  Pill,
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
import { Switch } from "../components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { toast } from "sonner";

const CATEGORIES = [
  "Antibiotics",
  "Pain Relief",
  "Cardiovascular",
  "Diabetes",
  "Vitamins",
  "Respiratory",
  "Digestive",
  "Skin Care",
  "Mental Health",
  "Other",
];

const emptyForm = {
  name: "",
  genericName: "",
  category: "",
  description: "",
  price: 0,
  stockQuantity: 0,
  requiresPrescription: true,
  manufacturer: "",
  isAvailable: true,
};

export default function AdminMedicines() {
  const queryClient = useQueryClient();
const [message, setMessage] = useState({ type: "", text: "" });
  const [showForm, setShowForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [deletingMedicine, setDeletingMedicine] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState(emptyForm);

const { data: medicines = [], isLoading } = useQuery({
  queryKey: ["medicines"],
  queryFn: async () => {
    const res = await api.get("/medicines");
    console.log("GET /medicines response:", res.data);

    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data?.medicines)) return res.data.medicines;
    if (Array.isArray(res.data?.data)) return res.data.data;

    return [];
  },
});

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        name: data.name,
        genericName: data.genericName,
        category: data.category,
        description: data.description,
        price: Number(data.price) || 0,
        stockQuantity: Number(data.stockQuantity) || 0,
        requiresPrescription: data.requiresPrescription,
        manufacturer: data.manufacturer,
        isAvailable: data.isAvailable,
      };

      const res = await api.post("/medicines", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success("Medicine added");
      resetForm();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to add medicine");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const payload = {
        name: data.name,
        genericName: data.genericName,
        category: data.category,
        description: data.description,
        price: Number(data.price) || 0,
        stockQuantity: Number(data.stockQuantity) || 0,
        requiresPrescription: data.requiresPrescription,
        manufacturer: data.manufacturer,
        isAvailable: data.isAvailable,
      };

      const res = await api.put(`/medicines/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success("Medicine updated");
      resetForm();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update medicine");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/medicines/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success("Medicine removed");
      setDeletingMedicine(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to remove medicine");
    },
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async ({ id, isAvailable }) => {
      const res = await api.patch(`/medicines/${id}/availability`, {
        isAvailable,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      toast.success("Availability updated");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to update availability"
      );
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingMedicine(null);
    setFormData(emptyForm);
  };

const handleEdit = (medicine) => {
  // RESET MESSAGE
  setMessage({ type: "", text: "" });

  // ========= VALIDATION BEFORE OPEN =========

  if (!medicine) {
    setMessage("error", "Invalid medicine selected");
    setTimeout(() => {
      setMessage("");
    }, 1500);
    return;
  }

  if (!medicine.name || !medicine.name.trim()) {
    setMessage("error", "Cannot edit: medicine name missing");
    setTimeout(() => {
      setMessage("");
    }, 1500);
    return;
  }

  if (!medicine.category || !medicine.category.trim()) {
    setMessage("error", "Cannot edit: category missing");
    setTimeout(() => {
      setMessage("");
    }, 1500);
    return;
  }

  if (medicine.price !== 0 && !medicine.price) {
    setMessage("error", "Cannot edit: price missing");
    setTimeout(() => {
      setMessage("");
    }, 1500);
    return;
  }

  // ========= OPEN FORM SAFELY =========

  setEditingMedicine(medicine);

  setFormData({
    name: medicine.name || "",
    genericName: medicine.genericName || medicine.generic_name || "",
    category: medicine.category || "",
    description: medicine.description || "",
    price: medicine.price ?? 0,
    stockQuantity: medicine.stockQuantity ?? medicine.stock_quantity ?? 0,
    requiresPrescription:
      medicine.requiresPrescription ??
      medicine.requires_prescription ??
      true,
    manufacturer: medicine.manufacturer || "",
    isAvailable: medicine.isAvailable ?? medicine.is_available ?? true,
  });

  setShowForm(true);
};

const handleSubmit = () => {
  setMessage({ type: "", text: "" });

  // NAME
  if (!formData.name || !formData.name.trim()) {
    setMessage({ type: "error", text: "Medicine name is required" });
    setTimeout(() => {
      setMessage("");
    }, 1500);
    return;
  }

  // CATEGORY
  if (!formData.category || !formData.category.trim()) {
    setMessage({ type: "error", text: "Category is required" });
    setTimeout(() => {
      setMessage("");
    }, 1500);
    return;
  }

  // PRICE
  if (!formData.price || Number(formData.price) <= 0) {
    setMessage({ type: "error", text: "Price must be greater than 0" });
    setTimeout(() => {
      setMessage("");
    }, 1500);
    return;
  }

  // STOCK
  if (formData.stockQuantity === null || Number(formData.stockQuantity) < 0) {
    setMessage({ type: "error", text: "Stock cannot be negative" });
    setTimeout(() => {
      setMessage("");
    }, 1500);
    return;
  }

  // MANUFACTURER (optional validation)
  if (formData.manufacturer && !formData.manufacturer.trim()) {
    setMessage({ type: "error", text: "Manufacturer cannot be empty" });
    setTimeout(() => {
      setMessage("");
    }, 1500);
    return;
  }

  // DESCRIPTION LENGTH
  if (formData.description && formData.description.length > 500) {
    setMessage({ type: "error", text: "Description too long (max 500 chars)" });
    setTimeout(() => {
      setMessage("");
    }, 1500);
    return;
  }

  // SUBMIT
  if (editingMedicine) {
    updateMutation.mutate({
      id: editingMedicine.id,
      data: formData,
    });

    setMessage({ type: "success", text: "Medicine updated successfully" });
    setTimeout(() => {
      setMessage("");
    },3000);
  } else {
    createMutation.mutate(formData);

    setMessage({ type: "success", text: "Medicine added successfully" });

    setTimeout(() => {
      setMessage("");
    }, 1500);
  }
};

  const filteredMedicines = medicines.filter((medicine) => {
    const name = medicine.name || "";
    const genericName = medicine.genericName || medicine.generic_name || "";
    const category = medicine.category || "";

    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Medicines</h1>
          <p className="text-slate-500 mt-1">Manage medicine inventory</p>
        </div>

        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-teal-500 to-cyan-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Medicine
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Search medicines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 bg-white"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      ) : filteredMedicines.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-slate-600">
                    Medicine
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-600">
                    Category
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-600">
                    Price
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-600">
                    Stock
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
                {filteredMedicines.map((medicine, index) => {
                  const genericName =
                    medicine.genericName || medicine.generic_name || "";
                  const stock =
                    medicine.stockQuantity ?? medicine.stock_quantity ?? 0;
                  const isAvailable =
                    medicine.isAvailable ?? medicine.is_available ?? true;
                  const requiresPrescription =
                    medicine.requiresPrescription ??
                    medicine.requires_prescription ??
                    true;

                  return (
                    <motion.tr
                      key={medicine.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-slate-800">
                            {medicine.name}
                          </p>
                          {genericName && (
                            <p className="text-sm text-slate-500">
                              {genericName}
                            </p>
                          )}
                          {requiresPrescription && (
                            <Badge className="mt-2" variant="outline">
                              Prescription
                            </Badge>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <Badge variant="outline">{medicine.category}</Badge>
                      </td>

                      <td className="py-4 px-6 text-slate-600">
                        ${medicine.price}
                      </td>

                      <td className="py-4 px-6 text-slate-600">{stock}</td>

                      <td className="py-4 px-6">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            toggleAvailabilityMutation.mutate({
                              id: medicine.id,
                              isAvailable: !isAvailable,
                            })
                          }
                          className="p-0 h-auto"
                        >
                          {isAvailable ? (
                            <div className="flex items-center gap-2 text-emerald-600">
                              <ToggleRight className="w-5 h-5" />
                              <span>Available</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-slate-400">
                              <ToggleLeft className="w-5 h-5" />
                              <span>Unavailable</span>
                            </div>
                          )}
                        </Button>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(medicine)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500"
                            onClick={() => setDeletingMedicine(medicine)}
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
          <Pill className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800">
            No medicines found
          </h3>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingMedicine ? "Edit Medicine" : "Add New Medicine"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Medicine name"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Generic Name</Label>
              <Input
                value={formData.genericName}
                onChange={(e) =>
                  setFormData({ ...formData, genericName: e.target.value })
                }
                placeholder="Generic name"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Category *</Label>
              <Input
                list="medicine-categories"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="Select category"
                className="mt-1"
              />
              <datalist id="medicine-categories">
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price ($) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Stock Quantity</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.stockQuantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stockQuantity: parseInt(e.target.value) || 0,
                    })
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Manufacturer</Label>
              <Input
                value={formData.manufacturer}
                onChange={(e) =>
                  setFormData({ ...formData, manufacturer: e.target.value })
                }
                placeholder="Manufacturer name"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Medicine description..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <Label className="cursor-pointer">Requires Prescription</Label>
              <Switch
                checked={formData.requiresPrescription}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    requiresPrescription: checked,
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <Label className="cursor-pointer">Available</Label>
              <Switch
                checked={formData.isAvailable}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    isAvailable: checked,
                  })
                }
              />
            </div>
{message.text && (
  <div
    className={`mb-4 p-3 rounded text-sm ${
      message.type === "success"
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-700"
    }`}
  >
    {message.text}
  </div>
)}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={resetForm} className="flex-1">
                Cancel
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500"
              >
                {editingMedicine ? "Update" : "Add Medicine"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {deletingMedicine && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-800">
              Delete Medicine
            </h3>
            <p className="text-slate-500 mt-2">
              Are you sure you want to delete this medicine? This action cannot
              be undone.
            </p>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeletingMedicine(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600"
                onClick={() => deleteMutation.mutate(deletingMedicine.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}