// @ts-nocheck
import React, { useMemo, useState } from "react";
import api from "../api/api";
import { useAuth } from "../lib/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Video,
  CheckCircle,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { toast } from "sonner";

const statusColors = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-slate-100 text-slate-600",
  REJECTED: "bg-red-100 text-red-700",
};

export default function DoctorAppointments() {
  const { user, isLoadingAuth } = useAuth();
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [meetingLink, setMeetingLink] = useState("");
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

  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery({
    queryKey: ["doctor-appointments", doctor?.id],
    queryFn: async () => {
      const res = await api.get("/appointments");
      const rawAppointments = res.data?.appointments || res.data || [];

      const filtered = rawAppointments.filter((apt) => {
        return apt.doctorId === doctor?.id || apt.doctor?.id === doctor?.id;
      });

      return filtered.map((apt) => ({
        ...apt,
        appointment_date: apt.appointment_date || apt.appointmentDate,
        appointment_time: apt.appointment_time || apt.appointmentTime,
        patient_name:
          apt.patient_name ||
          apt.patient?.name ||
          apt.patient?.full_name ||
          apt.patient?.email?.split("@")[0] ||
          "Patient",
        patient_email: apt.patient_email || apt.patient?.email || "No email",
        meeting_link: apt.meeting_link || apt.meetingLink || "",
      }));
    },
    enabled: !!doctor,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, meetingLink }) => {
      const res = await api.patch(`/appointments/${id}/status`, {
        status,
        meetingLink: meetingLink || null,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment updated successfully");
      setSelectedAppointment(null);
      setMeetingLink("");
    },
    onError: (error) => {
      console.error("Update appointment error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update appointment"
      );
    },
  });

  const handleAction = (appointmentId, status) => {
    if (status === "CONFIRMED") {
      const apt = appointments.find((a) => a.id === appointmentId);
      setSelectedAppointment(apt);
    } else {
      updateStatusMutation.mutate({
        id: appointmentId,
        status,
      });
    }
  };

  const handleApproveWithLink = () => {
    if (!selectedAppointment) return;

    updateStatusMutation.mutate({
      id: selectedAppointment.id,
      status: "CONFIRMED",
      meetingLink,
    });
  };

  const handleComplete = (appointmentId) => {
    updateStatusMutation.mutate({
      id: appointmentId,
      status: "COMPLETED",
    });
  };

  const pending = appointments.filter((a) => a.status === "PENDING");
  const approved = appointments.filter((a) => a.status === "CONFIRMED");
  const past = appointments.filter((a) =>
    ["COMPLETED", "CANCELLED", "REJECTED"].includes(a.status)
  );

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
          <p className="text-slate-500 mt-2">You need to be logged in to view appointments.</p>
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">My Appointments</h1>
        <p className="text-slate-500 mt-1">Manage your patient consultations</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="pending" className="relative">
            Pending
            {pending.length > 0 && (
              <Badge className="ml-2 bg-amber-500 h-5 w-5 p-0 flex items-center justify-center">
                {pending.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approved.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({past.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {isLoadingAppointments ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl h-32 animate-pulse" />
              ))}
            </div>
          ) : pending.length > 0 ? (
            <div className="space-y-4">
              {pending.map((apt) => (
                <div key={apt.id} className="bg-white rounded-xl border border-slate-100 p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                      {apt.patient_name?.[0]?.toUpperCase() || "P"}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">{apt.patient_name}</h3>
                      <p className="text-sm text-slate-500">{apt.patient_email}</p>

                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {apt.appointment_date
                            ? format(new Date(apt.appointment_date), "MMM d, yyyy")
                            : "N/A"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {apt.appointment_time || "N/A"}
                        </span>
                      </div>

                      {apt.symptoms && (
                        <p className="mt-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                          <strong>Symptoms:</strong> {apt.symptoms}
                        </p>
                      )}

                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleAction(apt.id, "CANCELLED")}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-teal-500 to-cyan-500"
                          onClick={() => handleAction(apt.id, "CONFIRMED")}
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
              <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-800">No pending requests</h3>
              <p className="text-slate-500">New appointment requests will appear here</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved">
          {approved.length > 0 ? (
            <div className="space-y-4">
              {approved.map((apt) => (
                <div key={apt.id} className="bg-white rounded-xl border border-slate-100 p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
                      {apt.patient_name?.[0]?.toUpperCase() || "P"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-800">{apt.patient_name}</h3>
                          <p className="text-sm text-slate-500">{apt.patient_email}</p>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700">Confirmed</Badge>
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {apt.appointment_date
                            ? format(new Date(apt.appointment_date), "MMM d, yyyy")
                            : "N/A"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {apt.appointment_time || "N/A"}
                        </span>
                      </div>

                      <div className="flex gap-2 mt-4">
                        {apt.meeting_link && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(apt.meeting_link, "_blank")}
                          >
                            <Video className="w-4 h-4 mr-1" />
                            Join Call
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-teal-500 to-cyan-500"
                          onClick={() => handleComplete(apt.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark Complete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
              <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-800">No confirmed appointments</h3>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {past.length > 0 ? (
            <div className="space-y-4">
              {past.map((apt) => (
                <div key={apt.id} className="bg-white rounded-xl border border-slate-100 p-5 opacity-80">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                      {apt.patient_name?.[0]?.toUpperCase() || "P"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800">{apt.patient_name}</h3>
                        <Badge className={statusColors[apt.status] || "bg-slate-100 text-slate-600"}>
                          {apt.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {apt.appointment_date
                            ? format(new Date(apt.appointment_date), "MMM d, yyyy")
                            : "N/A"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {apt.appointment_time || "N/A"}
                        </span>
                      </div>
                    </div>
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

      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Appointment</DialogTitle>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="font-medium">{selectedAppointment.patient_name}</p>
                <p className="text-sm text-slate-500">
                  {selectedAppointment.appointment_date
                    ? format(new Date(selectedAppointment.appointment_date), "MMMM d, yyyy")
                    : "N/A"}{" "}
                  at {selectedAppointment.appointment_time || "N/A"}
                </p>
              </div>

              <div>
                <Label>Meeting Link (optional)</Label>
                <Input
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://zoom.us/j/... or Google Meet link"
                  className="mt-1"
                />
              </div>

              <Button
                onClick={handleApproveWithLink}
                disabled={updateStatusMutation.isPending}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500"
              >
                Approve Appointment
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}