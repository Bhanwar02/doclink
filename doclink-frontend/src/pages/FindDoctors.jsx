// @ts-nocheck
import React, { useMemo, useState } from "react";
import api from "../api/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Filter, Stethoscope } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Calendar } from "../components/ui/calender";
import { toast } from "sonner";
import DoctorCard from "../components/doctors/DoctorCard";

const SPECIALTIES = [
  "All Specialties",
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

const TIME_SLOTS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
];

export default function FindDoctors() {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [booking, setBooking] = useState(false);
const [bookSuccessMessage, setBookSuccessMessage] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: currentUser = null } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.auth.me();
      return res;
    },
  });

  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ["patient-doctors"],
    queryFn: async () => {
      const res = await api.get("/doctors");
      const payload = res.data;

      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.doctors)) return payload.doctors;
      if (Array.isArray(payload?.data)) return payload.data;

      return [];
    },
  });

  const bookAppointmentMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/appointments", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-appointments"] });
      toast.success("Appointment request sent successfully!");
      setBookingDoctor(null);
      setSelectedDate(null);
      setSelectedTime("");
      setSymptoms("");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to book appointment");
    },
  });

  const normalizedDoctors = useMemo(() => {
    return doctors.map((doctor) => ({
      ...doctor,
      displayName: doctor.name || "Doctor",
      displayEmail: doctor.user?.email || doctor.email || "",
      displaySpecialty:
        doctor.specialty || doctor.specialization || "General Practice",
      displayExperience:
        doctor.experienceYears ?? doctor.experience_years ?? 0,
      displayBio: doctor.bio || "Experienced healthcare professional",
      isActive: doctor.isActive ?? doctor.is_active ?? true,
    }));
  }, [doctors]);

  const filteredDoctors = normalizedDoctors.filter((doc) => {
    const q = searchTerm.toLowerCase();

    const matchesSearch =
      doc.displayName.toLowerCase().includes(q) ||
      doc.displaySpecialty.toLowerCase().includes(q) ||
      doc.displayEmail.toLowerCase().includes(q) ||
      doc.displayBio.toLowerCase().includes(q);

    const matchesSpecialty =
      selectedSpecialty === "All Specialties" ||
      doc.displaySpecialty === selectedSpecialty;

    return matchesSearch && matchesSpecialty && doc.isActive;
  });

const handleBookAppointment = async () => {
  console.log("handleBookAppointment fired");
  console.log("selectedDate:", selectedDate);
  console.log("selectedTime:", selectedTime);
  console.log("bookingDoctor:", bookingDoctor);

  if (!selectedDate || !selectedTime || !bookingDoctor) {
    toast.error("Please select a date and time");
    return;
  }

  setBooking(true);

  try {
    const payload = {
      doctorId: bookingDoctor.id,
      appointment_date: selectedDate,
      appointment_time: selectedTime,
      symptoms: symptoms || "General consultation",
    };

    console.log("Sending payload:", payload);

    await bookAppointmentMutation.mutateAsync(payload);
    setBookSuccessMessage("Appointment request sent successfully!");
    setTimeout(() => setBookSuccessMessage(""), 2000);
  } catch (error) {
    console.error("Book appointment error:", error);
    toast.error(
      error?.response?.data?.message || "Failed to book appointment"
    );
  } finally {
    setBooking(false);
  }
};

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Find a Doctor</h1>
        <p className="text-slate-500 mt-1">
          Browse our qualified healthcare professionals
        </p>
      </div>
{bookSuccessMessage && (
  <div className="mt-3 text-green-600 font-medium">
    {bookSuccessMessage}
  </div>
)}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search by name, specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 bg-white border-slate-200"
          />
        </div>

        <div className="relative w-full sm:w-56">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="w-full h-12 rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none"
          >
            {SPECIALTIES.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-72 animate-pulse" />
          ))}
        </div>
      ) : filteredDoctors.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor, i) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <DoctorCard
                doctor={{
                  ...doctor,
                  name: doctor.displayName,
                  specialty: doctor.displaySpecialty,
                  specialization: doctor.displaySpecialty,
                  bio: doctor.displayBio,
                  experienceYears: doctor.displayExperience,
                  user_email: doctor.displayEmail,
                }}
                onBook={setBookingDoctor}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Stethoscope className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800">
            No doctors found
          </h3>
          <p className="text-slate-500">Try adjusting your search or filters</p>
        </div>
      )}

      <Dialog open={!!bookingDoctor} onOpenChange={() => setBookingDoctor(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Book Appointment</DialogTitle>
          </DialogHeader>

          {bookingDoctor && (
            <div className="space-y-5">
              <div className="flex items-center gap-4 p-4 bg-teal-50 rounded-xl">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl">
                  {(bookingDoctor.displayName || bookingDoctor.name || "D")[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    {bookingDoctor.displayName || bookingDoctor.name}
                  </p>
                  <p className="text-sm text-teal-600">
                    {bookingDoctor.displaySpecialty ||
                      bookingDoctor.specialization ||
                      bookingDoctor.specialty}
                  </p>
                </div>
              </div>

            <div>
  <Label>Select Date</Label>
  <Input
    type="date"
    value={
      selectedDate
        ? new Date(selectedDate).toISOString().split("T")[0]
        : ""
    }
    min={new Date().toISOString().split("T")[0]}
    onChange={(e) => {
      if (!e.target.value) {
        setSelectedDate(null);
        return;
      }

      const picked = new Date(`${e.target.value}T00:00:00`);
      setSelectedDate(picked);
    }}
    className="mt-2"
  />
</div>

              <div>
                <Label>Select Time</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {TIME_SLOTS.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                      className={
                        selectedTime === time
                          ? "bg-teal-500 hover:bg-teal-600"
                          : ""
                      }
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Describe Your Symptoms (Optional)</Label>
                <Textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Briefly describe your symptoms or reason for consultation..."
                  className="mt-2"
                  rows={3}
                />
              </div>

              <Button
  onClick={() => {
    console.log("Confirm clicked");
    handleBookAppointment();
  }}
  disabled={booking || !selectedDate || !selectedTime}
  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
>
  {booking ? "Booking..." : "Confirm Appointment"}
</Button>

            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}