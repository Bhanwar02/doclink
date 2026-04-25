// @ts-nocheck
import React, { useMemo } from "react";
import api from "../api/api";
import { useAuth } from "../lib/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Stethoscope, Calendar, Clock, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

export default function DoctorProfile() {
  const { user, isLoadingAuth } = useAuth();

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

  if (isLoadingAuth || isLoadingDoctors) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent" />
      </div>
    );
  }

  const displayName =
    doctor?.name ||
    user?.full_name ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "Doctor";

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Doctor Profile</h1>
        <p className="text-slate-500 mt-1">View your professional information</p>
      </div>

      <div className="grid gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="h-24 w-24 ring-4 ring-teal-100">
                  <AvatarImage src={doctor?.avatar_url || user?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white text-2xl font-bold">
                    {displayName?.[0]?.toUpperCase() || "D"}
                  </AvatarFallback>
                </Avatar>

                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-slate-800">Dr. {displayName}</h2>
                  <p className="text-slate-500">{user?.email}</p>
                  <p className="text-sm text-teal-600 mt-1">
                    {doctor?.specialization || "No specialization added"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-500" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Doctor Name</p>
                <p className="font-medium text-slate-800">{doctor?.name || "Not set"}</p>
              </div>
              <div>
                <p className="text-slate-500">Specialization</p>
                <p className="font-medium text-slate-800">{doctor?.specialization || "Not set"}</p>
              </div>
              <div>
                <p className="text-slate-500">Qualification</p>
                <p className="font-medium text-slate-800">{doctor?.qualification || "Not set"}</p>
              </div>
              <div>
                <p className="text-slate-500">Years of Experience</p>
                <p className="font-medium text-slate-800">
                  {doctor?.experience_years ?? doctor?.experienceYears ?? "Not set"}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-slate-500">Bio</p>
                <p className="font-medium text-slate-800">{doctor?.bio || "Not set"}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-500" />
                Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Available Days</p>
                <p className="font-medium text-slate-800">
                  {doctor?.available_days?.length
                    ? doctor.available_days.join(", ")
                    : "Not set"}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Available Hours</p>
                <p className="font-medium text-slate-800">
                  {doctor?.available_hours_start && doctor?.available_hours_end
                    ? `${doctor.available_hours_start} - ${doctor.available_hours_end}`
                    : "Not set"}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Consultation Fee</p>
                <p className="font-medium text-slate-800">
                  {doctor?.consultation_fee ?? doctor?.consultationFee ?? "Not set"}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}