// @ts-nocheck
import React from "react";
import api from "../api/api";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  FileText,
  Pill,
  Calendar,
  User,
  ChevronRight,
  Link2,
  Clock,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Card, CardContent } from "../components/ui/card";

function parsePrescriptionDetails(prescription) {
  let parsed = {};

  if (prescription.instructions) {
    try {
      parsed =
        typeof prescription.instructions === "string"
          ? JSON.parse(prescription.instructions)
          : prescription.instructions;
    } catch {
      parsed = {};
    }
  }

  return {
    diagnosis:
      parsed.diagnosis ||
      prescription.diagnosis ||
      "General Consultation",

    doctorName:
      parsed.doctorName ||
      prescription.doctorName ||
      prescription.doctor_name ||
      prescription.doctor?.name ||
      prescription.doctor?.user?.email?.split("@")[0] ||
      "Doctor",

    createdDate:
      prescription.appointment?.appointment_date ||
      prescription.createdAt ||
      prescription.created_date ||
      null,

    createdTime:
      prescription.appointment?.appointment_time ||
      parsed.appointmentTime ||
      prescription.appointment_time ||
      null,

    medicines:
      Array.isArray(parsed.medicines) ? parsed.medicines : [],

    additionalNotes:
      parsed.additionalNotes ||
      parsed.additional_notes ||
      prescription.additional_notes ||
      "",

    followUpDate:
      parsed.followUpDate ||
      parsed.follow_up_date ||
      prescription.follow_up_date ||
      null,
  };
}

export default function MyPrescriptions() {
  const [selectedPrescription, setSelectedPrescription] = React.useState(null);

  const { data: prescriptions = [], isLoading } = useQuery({
    queryKey: ["my-prescriptions"],
    queryFn: async () => {
      const res = await api.get("/prescriptions");
      const payload = res.data;
      
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.prescriptions)) return payload.prescriptions;
      if (Array.isArray(payload?.data)) return payload.data;

      return [];
    },
  });

  const normalized = prescriptions.map((prescription) => {
    const details = parsePrescriptionDetails(prescription);

    return {
      ...prescription,
      diagnosis: details.diagnosis,
      doctor_name: details.doctorName,
      created_date: details.createdDate,
      created_time: details.createdTime,
      medicines: details.medicines,
      additional_notes: details.additionalNotes,
      follow_up_date: details.followUpDate,
    };
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">My Prescriptions</h1>
        <p className="text-slate-500 mt-1">
          View your medical prescriptions and history
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl h-28 animate-pulse" />
          ))}
        </div>
      ) : normalized.length > 0 ? (
        <div className="space-y-4">
          {normalized.map((prescription) => (
            <Card
              key={prescription.id}
              className="cursor-pointer hover:shadow-md transition-all rounded-2xl"
              onClick={() => setSelectedPrescription(prescription)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-800 text-xl">
                        {prescription.diagnosis}
                      </h3>

                      <p className="text-sm text-slate-500 flex items-center gap-2 mt-2">
                        <User className="w-4 h-4" />
                        Dr. {prescription.doctor_name}
                      </p>

                      <div className="text-sm text-slate-500 flex items-center gap-2 mt-2 flex-wrap">
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {prescription.created_date
                            ? format(new Date(prescription.created_date), "MMM d, yyyy")
                            : "N/A"}
                        </span>

                        {prescription.created_time && (
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {prescription.created_time}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Link2 className="w-3 h-3" />
                      {prescription.medicines?.length || 0} medicines
                    </Badge>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
          <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800">
            No prescriptions yet
          </h3>
          <p className="text-slate-500 mt-1">
            Prescriptions will appear here after consultations
          </p>
        </div>
      )}

      <Dialog
        open={!!selectedPrescription}
        onOpenChange={() => setSelectedPrescription(null)}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>Prescription Details</DialogTitle>
          </DialogHeader>

          {selectedPrescription && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                <div className="flex justify-between gap-4">
                  <span className="text-sm text-slate-500">Doctor</span>
                  <span className="font-medium">
                    Dr. {selectedPrescription.doctor_name}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-slate-500">Date</span>
                  <span className="font-medium text-right">
                    {selectedPrescription.created_date
                      ? format(
                          new Date(selectedPrescription.created_date),
                          "MMM d, yyyy"
                        )
                      : "N/A"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-slate-500">Time</span>
                  <span className="font-medium text-right">
                    {selectedPrescription.created_time || "N/A"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-sm text-slate-500">Diagnosis</span>
                  <span className="font-medium text-right">
                    {selectedPrescription.diagnosis}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-3">
                  Prescribed Medicines
                </h4>

                <div className="space-y-3">
                  {selectedPrescription.medicines?.length > 0 ? (
                    selectedPrescription.medicines.map((med, i) => (
                      <div
                        key={i}
                        className="p-4 bg-white border border-slate-100 rounded-xl"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                            <Pill className="w-5 h-5 text-teal-600" />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-800">
                              {med.name}
                            </p>

                            {med.dosage && (
                              <p className="text-sm text-slate-500">
                                {med.dosage}
                              </p>
                            )}

                            {(med.frequency || med.duration) && (
                              <p className="text-sm text-slate-500">
                                {med.frequency || ""}
                                {med.frequency && med.duration ? " for " : ""}
                                {med.duration || ""}
                              </p>
                            )}

                            {med.instructions && (
                              <p className="text-sm text-teal-600 mt-1">
                                {med.instructions}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-white border border-slate-100 rounded-xl text-sm text-slate-500">
                      No medicine details available
                    </div>
                  )}
                </div>
              </div>

              {selectedPrescription.additional_notes && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">
                    Additional Notes
                  </h4>
                  <p className="text-sm text-slate-600 bg-amber-50 p-3 rounded-lg">
                    {selectedPrescription.additional_notes}
                  </p>
                </div>
              )}

              {selectedPrescription.follow_up_date && (
                <div className="p-4 bg-teal-50 rounded-xl">
                  <p className="text-sm text-teal-800">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Follow-up recommended:{" "}
                    {format(
                      new Date(selectedPrescription.follow_up_date),
                      "MMMM d, yyyy"
                    )}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}