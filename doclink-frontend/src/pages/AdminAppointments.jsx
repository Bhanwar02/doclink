// @ts-nocheck
import React from "react";
import api from "../api/api";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, Clock } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

const statusColors = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-slate-100 text-slate-600",
};

export default function AdminAppointments() {
  const { data: appointments = [], isLoading, error } = useQuery({
    queryKey: ["admin-appointments"],
    queryFn: async () => {
      const res = await api.get("/appointments");
      return res.data?.appointments || res.data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl h-28 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="p-6 text-red-600">
            Failed to load appointments
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">All Appointments</h1>
        <p className="text-slate-500 mt-1">View all patient appointments</p>
      </div>

      {appointments.length > 0 ? (
        <div className="space-y-4">
          {appointments.map((apt) => {
            const patientName =
              apt.patient_name ||
              apt.patient?.name ||
              apt.patient?.full_name ||
              apt.patient?.email?.split("@")[0] ||
              "Patient";

            const doctorName =
              apt.doctor?.name ||
              apt.doctor_name ||
              "Doctor";

            const dateValue = apt.appointment_date || apt.appointmentDate;
            const timeValue = apt.appointment_time || apt.appointmentTime;

            return (
              <Card key={apt.id}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-800">{patientName}</h3>
                      <p className="text-sm text-slate-500">Doctor: {doctorName}</p>
                    </div>
                    <Badge className={statusColors[apt.status] || "bg-slate-100 text-slate-600"}>
                      {apt.status || "Unknown"}
                    </Badge>
                  </div>

                  <div className="flex gap-4 text-sm text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {dateValue ? format(new Date(dateValue), "MMM d, yyyy") : "N/A"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {timeValue || "N/A"}
                    </span>
                  </div>

                  {apt.symptoms && (
                    <p className="mt-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                      <strong>Symptoms:</strong> {apt.symptoms}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-10 text-center text-slate-500">
            No appointments found
          </CardContent>
        </Card>
      )}
    </div>
  );
}