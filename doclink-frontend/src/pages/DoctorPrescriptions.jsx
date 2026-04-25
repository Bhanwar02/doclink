// @ts-nocheck
import React, { useMemo, useState } from "react";
import api from "../api/api";
import { useAuth } from "../lib/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { FileText, Plus, Pill, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "sonner";

export default function DoctorPrescriptions() {
  const { user, isLoadingAuth } = useAuth();
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [medicines, setMedicines] = useState([
    {
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
      isCustom: false,
      selectedMedicineId: "",
    },
  ]);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [message, setMessage] = useState("");
const [messageType, setMessageType] = useState(""); // "error" | "success"
  const queryClient = useQueryClient();

  const { data: doctors = [], isLoading: isLoadingDoctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const res = await api.get("/doctors");
      return res.data?.doctors || res.data || [];
    },
    enabled: !!user,
  });

  const doctor = useMemo(() => {
    if (!user || !doctors?.length) return null;

    return (
      doctors.find((d) => d.userId === user.id) ||
      doctors.find((d) => d.user?.id === user.id) ||
      doctors.find((d) => d.user?.email === user.email) ||
      null
    );
  }, [doctors, user]);

  const { data: availableMedicines = [] } = useQuery({
    queryKey: ["medicines"],
    queryFn: async () => {
      try {
        const res = await api.get("/medicines");
        const meds = res.data?.medicines || res.data || [];
        return meds.filter((m) => m.isAvailable !== false);
      } catch (error) {
        return [];
      }
    },
    enabled: !!doctor,
  });

  const { data: prescriptions = [], isLoading: isLoadingPrescriptions } = useQuery({
    queryKey: ["doctor-prescriptions", doctor?.id],
    queryFn: async () => {
      try {
        const res = await api.get("/prescriptions");
        const raw = res.data?.prescriptions || res.data || [];
        return raw.filter(
  (p) =>
    p.doctorId === doctor?.id ||
    p.doctor_id === doctor?.id ||
    p.doctor?.id === doctor?.id
);
      } catch (error) {
        return [];
      }
    },
    enabled: !!doctor,
  });

  const { data: completedAppointments = [] } = useQuery({
    queryKey: ["completed-appointments", doctor?.id],
    queryFn: async () => {
      const res = await api.get("/appointments");
      const raw = res.data?.appointments || res.data || [];

      return raw
        .filter(
          (apt) =>
            (apt.doctorId === doctor?.id || apt.doctor?.id === doctor?.id) &&
            apt.status === "COMPLETED"
        )
        .map((apt) => ({
          ...apt,
          appointment_date: apt.appointment_date || apt.appointmentDate,
          patient_name:
            apt.patient_name ||
            apt.patient?.name ||
            apt.patient?.full_name ||
            apt.patient?.email?.split("@")[0] ||
            "Patient",
          patient_email: apt.patient_email || apt.patient?.email || "",
        }));
    },
    enabled: !!doctor,
  });

  const validateForm = () => {
  if (!selectedPatient) {
    setMessage("Please select a patient");
    setMessageType("error");
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 1500);
    return false;
  }

  if (!diagnosis.trim()) {
    setMessage("Diagnosis is required");
    setMessageType("error");
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 1500);
    return false;
  }

  const invalidMedicine = medicines.some((m) => !m.name.trim());

  if (invalidMedicine) {
    setMessage("Please fill all medicine names");
    setMessageType("error");
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 1500);
    return false;
  }
  
  return true;
};

  const createMutation = useMutation({
  mutationFn: async (data) => {
    const res = await api.post("/prescriptions", data);
    return res.data;
  },

  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["doctor-prescriptions"] });

    setMessage("Prescription created successfully!");
    setMessageType("success");

    resetForm();

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  },

  onError: (error) => {
    console.error(error);

    setMessage(
      error?.response?.data?.message || "Failed to create prescription"
    );
    setMessageType("error");

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  },
});

  const resetForm = () => {
    setShowForm(false);
    setSelectedPatient(null);
    setDiagnosis("");
    setMedicines([
      {
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
        isCustom: false,
        selectedMedicineId: "",
      },
    ]);
    setAdditionalNotes("");
    setFollowUpDate("");
  };

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      {
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
        isCustom: false,
        selectedMedicineId: "",
      },
    ]);
  };

  const removeMedicine = (index) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter((_, i) => i !== index));
    }
  };

  const updateMedicine = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const selectInventoryMedicine = (index, medicineId) => {
    const medicine = availableMedicines.find((m) => m.id === medicineId);
    if (medicine) {
      const updated = [...medicines];
      updated[index] = {
        name: medicine.name,
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
        isCustom: false,
        selectedMedicineId: medicineId,
      };
      setMedicines(updated);
    }
  };

  const toggleCustomMode = (index) => {
    const updated = [...medicines];
    updated[index].isCustom = !updated[index].isCustom;
    if (updated[index].isCustom) {
      updated[index].selectedMedicineId = "";
    } else {
      updated[index].name = "";
    }
    setMedicines(updated);
  };

 const handleSubmit = () => {
  if (!validateForm()) return;

  createMutation.mutate({
    appointmentId: selectedPatient.id,
    doctorId: doctor.id,
    instructions: JSON.stringify({
      diagnosis,
      medicines: medicines.filter((m) => m.name),
      additionalNotes,
      followUpDate: followUpDate || null,
      patientName: selectedPatient.patient_name,
      patientEmail: selectedPatient.patient_email,
      doctorName: user?.email?.split("@")[0] || "Doctor",
    }),
  });
};

  if (isLoadingAuth || isLoadingDoctors) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-white rounded-2xl border p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-800">Please log in</h2>
          <p className="text-slate-500 mt-2">You need to be logged in to manage prescriptions.</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-white rounded-2xl border p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-800">Doctor profile not found</h2>
          <p className="text-slate-500 mt-2">
            This logged-in account is not linked to a doctor profile yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Prescriptions</h1>
          <p className="text-slate-500 mt-1">Create and manage patient prescriptions</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-teal-500 to-cyan-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Prescription
        </Button>
      </div>

      {isLoadingPrescriptions ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl h-28 animate-pulse" />
          ))}
        </div>
      ) : prescriptions.length > 0 ? (
        <div className="space-y-4">
          {prescriptions.map((prescription) => {
            let parsedInstructions = {};
            try {
              parsedInstructions = JSON.parse(prescription.instructions || "{}");
            } catch (e) {
              parsedInstructions = {};
            }

            const meds = parsedInstructions.medicines || [];

            return (
              <Card
  key={prescription.id}
  onClick={() => setSelectedPrescription(prescription)}
  className="cursor-pointer hover:shadow-lg transition"
>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {parsedInstructions.patientName || "Patient"}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {parsedInstructions.diagnosis || "No diagnosis"}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Pill className="w-3 h-3" />
                      {meds.length} medicines
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {selectedPrescription && (
  <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-xl w-full max-w-lg">
      <h2 className="text-lg font-semibold mb-4">
        Prescription Details
      </h2>

      {(() => {
        let data = {};
        try {
          data = JSON.parse(selectedPrescription.instructions || "{}");
        } catch {}

        return (
          <div className="space-y-3">
            <p><strong>Patient:</strong> {data.patientName}</p>
            <p><strong>Diagnosis:</strong> {data.diagnosis}</p>

            <div>
              <strong>Medicines:</strong>
              <ul className="list-disc ml-5">
                {(data.medicines || []).map((m, i) => (
                  <li key={i}>
                    {m.name} ({m.dosage}) - {m.frequency}
                  </li>
                ))}
              </ul>
            </div>

            {data.additionalNotes && (
              <p><strong>Notes:</strong> {data.additionalNotes}</p>
            )}
          </div>
        );
      })()}

      <Button
        className="mt-5 w-full"
        onClick={() => setSelectedPrescription(null)}
      >
        Close
      </Button>
    </div>
  </div>
)}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
          <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800">No prescriptions yet</h3>
          <p className="text-slate-500">Create your first prescription for a patient</p>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Prescription</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div>
              <Label>Select Patient (from completed consultations)</Label>
              <Select
                value={selectedPatient?.id || ""}
                onValueChange={(v) =>
                  setSelectedPatient(completedAppointments.find((a) => a.id === v))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {completedAppointments.map((apt) => (
                    <SelectItem key={apt.id} value={apt.id}>
                      {apt.patient_name} -{" "}
                      {apt.appointment_date
                        ? format(new Date(apt.appointment_date), "MMM d")
                        : "N/A"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Diagnosis *</Label>
              <Input
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Enter diagnosis"
                className="mt-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Medicines *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addMedicine}>
                  <Plus className="w-4 h-4 mr-1" /> Add Medicine
                </Button>
              </div>

              <div className="space-y-4">
                {medicines.map((med, index) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">
                        Medicine #{index + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCustomMode(index)}
                          className="text-teal-600 h-8 text-xs"
                        >
                          {med.isCustom ? "Select from inventory" : "Enter manually"}
                        </Button>
                        {medicines.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMedicine(index)}
                            className="text-red-500 h-8"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {!med.isCustom ? (
                      <Select
                        value={med.selectedMedicineId}
                        onValueChange={(v) => selectInventoryMedicine(index, v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select medicine from inventory" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableMedicines.map((medicine) => (
                            <SelectItem key={medicine.id} value={medicine.id}>
                              {medicine.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder="Medicine name *"
                        value={med.name}
                        onChange={(e) => updateMedicine(index, "name", e.target.value)}
                      />
                    )}

                    <div className="grid sm:grid-cols-2 gap-3">
                      <Input
                        placeholder="Dosage (e.g., 500mg)"
                        value={med.dosage}
                        onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
                      />
                      <Input
                        placeholder="Frequency (e.g., Twice daily)"
                        value={med.frequency}
                        onChange={(e) => updateMedicine(index, "frequency", e.target.value)}
                      />
                      <Input
                        placeholder="Duration (e.g., 7 days)"
                        value={med.duration}
                        onChange={(e) => updateMedicine(index, "duration", e.target.value)}
                      />
                    </div>

                    <Input
                      placeholder="Special instructions (optional)"
                      value={med.instructions}
                      onChange={(e) => updateMedicine(index, "instructions", e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Additional Notes</Label>
              <Textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Any additional instructions for the patient..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label>Follow-up Date (optional)</Label>
              <Input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="mt-1"
              />
            </div>
{message && (
  <div
    className={`p-3 rounded-lg text-sm font-medium border ${
      messageType === "error"
        ? "bg-red-100 text-red-700 border-red-200"
        : "bg-green-100 text-green-700 border-green-200"
    }`}
  >
    {message}
  </div>
)}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={resetForm} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending}
                className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500"
              >
                {createMutation.isPending ? "Creating..." : "Create Prescription"}
              </Button>
            </div>
            
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}