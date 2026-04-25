// @ts-nocheck
import React, { useMemo, useState, useEffect } from "react";
import api from "../api/api";
import { useAuth } from "../lib/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DoctorProfileSettings() {
  const { user, isLoadingAuth } = useAuth();
  const [message, setMessage] = useState("");
const [messageType, setMessageType] = useState(""); // "success" | "error"
  const queryClient = useQueryClient();

  const [availability, setAvailability] = useState({
    available_days: [],
    available_hours_start: "09:00",
    available_hours_end: "17:00",
  });

  // ✅ Fetch doctors
  const { data: doctors = [], isLoading: isLoadingDoctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const res = await api.get("/doctors");
      return res.data?.doctors || [];
    },
    enabled: !!user,
  });

  // ✅ Find logged-in doctor
  const doctor = useMemo(() => {
    if (!user || !doctors.length) return null;

    return (
      doctors.find((d) => d.userId === user.id) ||
      doctors.find((d) => d.user?.id === user.id) ||
      doctors.find((d) => d.user?.email === user.email) ||
      null
    );
  }, [doctors, user]);

  // ✅ Sync backend data → state
  useEffect(() => {
    if (doctor) {
      setAvailability({
        available_days: doctor.available_days || doctor.availableDays || [],
        available_hours_start:
          doctor.available_hours_start ||
          doctor.availableHoursStart ||
          "09:00",
        available_hours_end:
          doctor.available_hours_end ||
          doctor.availableHoursEnd ||
          "17:00",
      });
    }
  }, [doctor]);

  // ✅ Toggle days
  const toggleDay = (day) => {
    setAvailability((prev) => {
      const exists = prev.available_days.includes(day);

      return {
        ...prev,
        available_days: exists
          ? prev.available_days.filter((d) => d !== day)
          : [...prev.available_days, day],
      };
    });
  };

const saveMutation = useMutation({
  mutationFn: async (data) => {
    const payload = {
  availableDays: data.available_days,
  availableHoursStart: data.available_hours_start,
  availableHoursEnd: data.available_hours_end,
};

    console.log("📦 Correct payload:", payload);

    const res = await api.patch("/doctors/me/availability", payload);
    return res.data;
  },

 onSuccess: () => {
    setMessage("Availability updated successfully!");
    setMessageType("success");

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  },

  onError: () => {
    setMessage("Failed to update availability");
    setMessageType("error");

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  },
});


const validateAvailability = () => {
  if (!availability.available_days.length) {
    setMessage("Please select at least one available day");
    setMessageType("error");
     setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
    return false;
  }

  if (!availability.available_hours_start) {
    setMessage("Start time is required");
    setMessageType("error");
     setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
    return false;
  }

  if (!availability.available_hours_end) {
    setMessage("End time is required");
    setMessageType("error");
     setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
    return false;
  }

  if (availability.available_hours_start >= availability.available_hours_end) {
    setMessage("End time must be after start time");
    setMessageType("error");
     setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
    return false;
  }

  return true;
};

  // ✅ Handle Save
const handleSave = () => {
  console.log("🟢 Save clicked");

  // clear old message
  setMessage("");
  setMessageType("");

  if (!validateAvailability()) return;

  saveMutation.mutate({
    available_days: availability.available_days,
    available_hours_start: availability.available_hours_start,
    available_hours_end: availability.available_hours_end,
  });
};

  // ✅ Loading
  if (isLoadingAuth || isLoadingDoctors) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-gray-500">Update your availability</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-500" />
              Availability
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* DAYS */}
            <div>
              <Label>Available Days</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1 rounded border transition ${
                      availability.available_days.includes(day)
                        ? "bg-teal-600 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* TIME */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Available From</Label>
                <input
                  type="time"
                  value={availability.available_hours_start}
                  onChange={(e) =>
                    setAvailability((prev) => ({
                      ...prev,
                      available_hours_start: e.target.value,
                    }))
                  }
                  className="border p-2 rounded w-full"
                />
              </div>

              <div>
                <Label>Available Until</Label>
                <input
                  type="time"
                  value={availability.available_hours_end}
                  onChange={(e) =>
                    setAvailability((prev) => ({
                      ...prev,
                      available_hours_end: e.target.value,
                    }))
                  }
                  className="border p-2 rounded w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* SAVE BUTTON */}
      <Button
  onClick={handleSave}
  disabled={saveMutation.isPending}
  className="w-full mt-6 bg-teal-600 hover:bg-teal-700"
>
  {saveMutation.isPending ? "Saving..." : "Save Changes"}
</Button>
{message && (
  <div
    className={`mb-4 p-3 rounded-lg text-sm border ${
      messageType === "success"
        ? "bg-green-100 text-green-700 border-green-200"
        : "bg-red-100 text-red-700 border-red-200"
    }`}
  >
    {message}
  </div>
)}
    </div>
  );
}