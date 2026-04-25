// @ts-nocheck
import React, { useMemo, useState } from "react";
import api from "../api/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, Clock, Video, X, Star } from "lucide-react";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";

export default function MyAppointments() {
  const [feedbackAppointment, setFeedbackAppointment] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
const [successMessage, setSuccessMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  const { data: user = null } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.auth.me();
      return res;
    },
  });

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["my-appointments"],
    enabled: !!user,
    queryFn: async () => {
      const res = await api.get("/appointments");
      const payload = res.data;

      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.appointments)) return payload.appointments;
      if (Array.isArray(payload?.data)) return payload.data;

      return [];
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.patch(`/appointments/${id}/status`, {
        status: "CANCELLED",
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
      toast.success("Appointment cancelled");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to cancel appointment");
    },
  });

const feedbackMutation = useMutation({
  mutationFn: async (data) => {
    const res = await api.post("/feedback", data);
    return res.data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["my-appointments"] });

    setSuccessMessage("Feedback submitted successfully!");
    setErrorMessage("");

    setTimeout(() => {
      setSuccessMessage("");
      setFeedbackAppointment(null);
    }, 2000);

    setRating(5);
    setComment("");
  },
  onError: (error) => {
    setErrorMessage(
      error?.response?.data?.message || "Failed to submit feedback"
    );
    setSuccessMessage("");
  },
});

  const normalizedAppointments = useMemo(() => {
    return appointments.map((apt) => {
      const status = (apt.status || "PENDING").toUpperCase();
      const doctorName =
        apt.doctor?.name ||
        apt.doctor_name ||
        "Doctor";
      const doctorEmail =
        apt.doctor?.user?.email ||
        apt.doctor_email ||
        "";
      const specialization =
        apt.doctor?.specialization ||
        apt.doctor?.specialty ||
        "General Practice";

      return {
        ...apt,
        status,
        doctorName,
        doctorEmail,
        specialization,
        appointmentDate: apt.appointment_date || apt.appointmentDate,
        appointmentTime: apt.appointment_time || apt.appointmentTime,
        meetingLink: apt.meeting_link || apt.meetingLink || "",
        symptoms: apt.symptoms || "",
        notes: apt.notes || "",
      };
    });
  }, [appointments]);

  const upcoming = normalizedAppointments.filter((a) =>
    ["PENDING", "CONFIRMED"].includes(a.status)
  );

  const past = normalizedAppointments.filter((a) =>
    ["COMPLETED", "CANCELLED"].includes(a.status)
  );

const handleSubmitFeedback = () => {
  if (!feedbackAppointment) return;

  // ✅ Validation
  if (!rating || rating < 1 || rating > 5) {
    setErrorMessage("Please select a valid rating");
    return;
  }

  setErrorMessage("");

  feedbackMutation.mutate({
    appointmentId: feedbackAppointment.id,
    rating,
    comments: comment.trim() || "Good consultation",
  });
};

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">My Appointments</h1>
        <p className="text-slate-500 mt-1">Manage your healthcare consultations</p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">
            Upcoming ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({past.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl h-32 animate-pulse" />
              ))}
            </div>
          ) : upcoming.length > 0 ? (
            <div className="space-y-4">
              {upcoming.map((apt) => (
                <div key={apt.id} className="bg-white rounded-xl border border-slate-100 p-5">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        {apt.doctorName}
                      </h3>
                      <p className="text-sm text-teal-600 mt-1">{apt.specialization}</p>
                      {apt.doctorEmail && (
                        <p className="text-sm text-slate-500 mt-1">{apt.doctorEmail}</p>
                      )}

                      <div className="mt-4 space-y-1 text-sm text-slate-600">
                        <p>
                          <span className="font-medium">Date:</span>{" "}
                          {apt.appointmentDate
                            ? format(new Date(apt.appointmentDate), "MMM d, yyyy")
                            : "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Time:</span> {apt.appointmentTime || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Status:</span> {apt.status}
                        </p>
                        {apt.symptoms && (
                          <p>
                            <span className="font-medium">Symptoms:</span> {apt.symptoms}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {apt.status === "PENDING" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => cancelMutation.mutate(apt.id)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      )}

                      {apt.status === "CONFIRMED" && apt.meetingLink && (
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-teal-500 to-cyan-500"
                          onClick={() => window.open(apt.meetingLink, "_blank")}
                        >
                          <Video className="w-4 h-4 mr-1" />
                          Join Consultation
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
              <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-800">No upcoming appointments</h3>
              <p className="text-slate-500 mt-1">Book a consultation with a doctor</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {past.length > 0 ? (
            <div className="space-y-4">
              {past.map((apt) => (
                <div key={apt.id} className="bg-white rounded-xl border border-slate-100 p-5">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        {apt.doctorName}
                      </h3>
                      <p className="text-sm text-teal-600 mt-1">{apt.specialization}</p>

                      <div className="mt-4 space-y-1 text-sm text-slate-600">
                        <p>
                          <span className="font-medium">Date:</span>{" "}
                          {apt.appointmentDate
                            ? format(new Date(apt.appointmentDate), "MMM d, yyyy")
                            : "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Time:</span> {apt.appointmentTime || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Status:</span> {apt.status}
                        </p>
                      </div>
                    </div>

                    {apt.status === "COMPLETED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFeedbackAppointment(apt)}
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Leave Feedback
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
              <Clock className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-800">No past appointments</h3>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!feedbackAppointment} onOpenChange={() => setFeedbackAppointment(null)}>
        <DialogContent>
          {errorMessage && (
  <div className="p-3 rounded-lg bg-red-100 text-red-700 border border-red-200">
    {errorMessage}
  </div>
)}

{successMessage && (
  <div className="p-3 rounded-lg bg-green-100 text-green-700 border border-green-200">
    {successMessage}
  </div>
)}
          <DialogHeader>
            <DialogTitle>Rate Your Experience</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <div>
              <p className="text-sm text-slate-500 mb-2">How was your consultation?</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-500 mb-2">Additional comments (optional)</p>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                rows={3}
              />
            </div>

            <Button
  onClick={handleSubmitFeedback}
  disabled={feedbackMutation.isPending}
  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500"
>
  {feedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}