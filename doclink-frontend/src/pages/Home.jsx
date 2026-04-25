// @ts-nocheck
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils/index";
import api from "../api/api";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuth } from "../lib/AuthContext";
import {
  Calendar,
  Stethoscope,
  Pill,
  FileText,
  GraduationCap,
  ArrowRight,
  CheckCircle,
  Heart,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import StatsCard from "../components/dashboard/StatsCard";
import AppointmentCard from "../components/dashboard/AppointmentCard";

export default function Home() {
  const { user, isLoadingAuth } = useAuth();

  const role = user?.role;
  const isAdmin = role === "ADMIN";
  const isDoctor = role === "DOCTOR";
  const isPatient = role === "PATIENT";

  const { data: appointmentsRaw = [] } = useQuery({
    queryKey: ["appointments", user?.id, role],
    queryFn: async () => {
      if (!user) return [];

      const res = await api.get("/appointments");
      const payload = res.data;

      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.appointments)) return payload.appointments;
      if (Array.isArray(payload?.data)) return payload.data;

      return [];
    },
    enabled: !!user && !isAdmin,
  });

  const { data: seminarsRaw = [] } = useQuery({
    queryKey: ["seminars"],
    queryFn: async () => {
      try {
        const res = await api.get("/seminars");
        const payload = res.data;

        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.seminars)) return payload.seminars;
        if (Array.isArray(payload?.data)) return payload.data;

        return [];
      } catch (error) {
        return [];
      }
    },
    enabled: !!user && !isDoctor,
  });

  const { data: prescriptionsRaw = [] } = useQuery({
    queryKey: ["prescriptions", user?.id],
    queryFn: async () => {
      try {
        const res = await api.get("/prescriptions");
        const payload = res.data;

        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.prescriptions)) return payload.prescriptions;
        if (Array.isArray(payload?.data)) return payload.data;

        return [];
      } catch (error) {
        return [];
      }
    },
    enabled: !!user && !isAdmin && !isDoctor,
  });

  const appointments = useMemo(() => {
    return appointmentsRaw.map((apt) => ({
      ...apt,
      status: (apt.status || "PENDING").toUpperCase(),
      appointment_date: apt.appointment_date || apt.appointmentDate || null,
      appointment_time: apt.appointment_time || apt.appointmentTime || "",
      doctor_name:
        apt.doctor_name ||
        apt.doctor?.name ||
        "Doctor",
      doctor_email:
        apt.doctor_email ||
        apt.doctor?.user?.email ||
        "",
      patient_name:
        apt.patient_name ||
        apt.patient?.name ||
        apt.patient?.email?.split("@")[0] ||
        "Patient",
      patient_email:
        apt.patient_email ||
        apt.patient?.email ||
        "",
      meeting_link: apt.meeting_link || apt.meetingLink || "",
    }));
  }, [appointmentsRaw]);

  const seminars = useMemo(() => {
    return seminarsRaw.map((sem) => ({
      ...sem,
      eventDate: sem.eventDate || sem.event_date || null,
      isActive: sem.isActive ?? sem.is_active ?? true,
    }));
  }, [seminarsRaw]);

  const prescriptions = Array.isArray(prescriptionsRaw) ? prescriptionsRaw : [];

  if (isLoadingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen" id="home">
        <header className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-cyan-500 to-teal-600" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920')] bg-cover bg-center opacity-10" />

          <nav className="relative z-10 flex items-center justify-between px-6 lg:px-16 py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white"><a href="#home">DocLink</a></span>
            </div>
            <Button
              onClick={() => (window.location.href = "/login")}
              className="bg-white text-teal-600 hover:bg-white/90 font-semibold shadow-lg"
            >
              Sign In
            </Button>
          </nav>

          <div className="relative z-10 px-6 lg:px-16 py-20 lg:py-32">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                Healthcare at Your
                <span className="block text-cyan-200">Fingertips</span>
              </h1>
              <p className="mt-6 text-lg lg:text-xl text-white/80 max-w-xl">
                Connect with qualified doctors, book virtual consultations, order medicines, and stay informed about health seminars — all from the comfort of your home.
              </p>
              <div className="flex flex-wrap gap-4 mt-10">
                <Button
                  size="lg"
                  onClick={() => (window.location.href = "/signup")}
                  className="bg-white text-teal-600 hover:bg-white/90 font-semibold shadow-xl text-base px-8"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <a href="#learn-more"><Button
                  size="lg"
                  variant="outline"
                  className="bg-white text-teal-600 hover:bg-white/90 font-semibold shadow-xl text-base px-8"
                >
                  Learn More
                </Button></a>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 to-transparent" />
        </header>

        <section className="px-6 lg:px-16 py-20 bg-slate-50" id="learn-more">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-800">Why Choose DocLink?</h2>
              <p className="mt-4 text-lg text-slate-600">Comprehensive healthcare solutions designed for you</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Stethoscope, title: "Virtual Consultations", desc: "Connect with doctors via video or chat", color: "from-teal-500 to-cyan-500" },
                { icon: Pill, title: "Medicine Ordering", desc: "Order prescribed medicines online", color: "from-purple-500 to-pink-500" },
                { icon: GraduationCap, title: "Health Seminars", desc: "Join informative health webinars", color: "from-orange-500 to-amber-500" },
                { icon: FileText, title: "Medical Records", desc: "Access your prescriptions anytime", color: "from-blue-500 to-indigo-500" },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6 text-center">
                      <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg mb-4`}>
                        <feature.icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-slate-800">{feature.title}</h3>
                      <p className="mt-2 text-sm text-slate-500">{feature.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 lg:px-16 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <Heart className="w-16 h-16 mx-auto text-teal-500 mb-6" />
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-800">Ready to Take Control of Your Health?</h2>
            <p className="mt-4 text-lg text-slate-600">Join thousands of patients already using DocLink for their healthcare needs.</p>
            <Button
              size="lg"
              onClick={() => (window.location.href = "/signup")}
              className="mt-8 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-xl text-base px-10"
            >
              Create Free Account
            </Button>
          </div>
        </section>

        <footer className="bg-slate-900 text-white px-6 lg:px-16 py-12">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">DocLink</span>
            </div>
            <p className="text-slate-400 text-sm">© 2026 DocLink. All rights reserved.</p>
          </div>
        </footer>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your healthcare platform</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Link to={createPageUrl("ManageDoctors")}>
            <StatsCard title="Manage Doctors" value="→" icon={Stethoscope} color="teal" />
          </Link>
          <Link to={createPageUrl("AdminAppointments")}>
            <StatsCard title="All Appointments" value="→" icon={Calendar} color="blue" />
          </Link>
          <Link to={createPageUrl("AdminMedicines")}>
            <StatsCard title="Medicines" value="→" icon={Pill} color="purple" />
          </Link>
          <Link to={createPageUrl("AdminSeminars")}>
            <StatsCard title="Health Seminars" value="→" icon={GraduationCap} color="orange" />
          </Link>
        </div>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(
    (a) => a.status === "CONFIRMED" || a.status === "PENDING"
  );

  const completedCount = appointments.filter(
    (a) => a.status === "COMPLETED"
  ).length;

  const activeSeminarsCount = seminars.filter((s) => s.isActive).length;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-slate-800"
        >
          Welcome, {user?.email?.split("@")[0] || "there"}! 👋
        </motion.h1>
        <p className="text-slate-500 mt-1">
          {isDoctor ? "Manage your consultations and patients" : "Your health dashboard at a glance"}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatsCard
          title="Upcoming Appointments"
          value={upcomingAppointments.length}
          icon={Calendar}
          color="teal"
        />
        <StatsCard
          title="Completed"
          value={completedCount}
          icon={CheckCircle}
          color="green"
        />
        {!isDoctor && (
          <>
            <StatsCard
              title="Prescriptions"
              value={prescriptions.length}
              icon={FileText}
              color="blue"
            />
            <StatsCard
              title="Upcoming Seminars"
              value={activeSeminarsCount}
              icon={GraduationCap}
              color="orange"
            />
          </>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {!isDoctor ? (
            <>
              <Link to={createPageUrl("FindDoctors")}>
                <Card className="cursor-pointer hover:shadow-md transition-all group border-0 bg-gradient-to-br from-teal-500 to-cyan-500 text-white">
                  <CardContent className="p-5 flex items-center gap-4">
                    <Stethoscope className="w-10 h-10" />
                    <div>
                      <p className="font-semibold">Find a Doctor</p>
                      <p className="text-sm text-white/70">Book consultation</p>
                    </div>
                    <ArrowRight className="w-5 h-5 ml-auto opacity-60 group-hover:translate-x-1 transition-transform" />
                  </CardContent>
                </Card>
              </Link>

              <Link to={createPageUrl("OrderMedicines")}>
                <Card className="cursor-pointer hover:shadow-md transition-all group">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Pill className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Order Medicines</p>
                      <p className="text-sm text-slate-500">Browse pharmacy</p>
                    </div>
                    <ArrowRight className="w-5 h-5 ml-auto text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </CardContent>
                </Card>
              </Link>

              <Link to={createPageUrl("Seminars")}>
                <Card className="cursor-pointer hover:shadow-md transition-all group">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Health Seminars</p>
                      <p className="text-sm text-slate-500">Learn & grow</p>
                    </div>
                    <ArrowRight className="w-5 h-5 ml-auto text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </CardContent>
                </Card>
              </Link>

              <Link to={createPageUrl("MyPrescriptions")}>
                <Card className="cursor-pointer hover:shadow-md transition-all group">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Prescriptions</p>
                      <p className="text-sm text-slate-500">View records</p>
                    </div>
                    <ArrowRight className="w-5 h-5 ml-auto text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </CardContent>
                </Card>
              </Link>
            </>
          ) : (
            <>
              <Link to={createPageUrl("DoctorAppointments")}>
                <Card className="cursor-pointer hover:shadow-md transition-all group border-0 bg-gradient-to-br from-teal-500 to-cyan-500 text-white">
                  <CardContent className="p-5 flex items-center gap-4">
                    <Calendar className="w-10 h-10" />
                    <div>
                      <p className="font-semibold">Appointments</p>
                      <p className="text-sm text-white/70">Manage bookings</p>
                    </div>
                    <ArrowRight className="w-5 h-5 ml-auto opacity-60 group-hover:translate-x-1 transition-transform" />
                  </CardContent>
                </Card>
              </Link>

              <Link to={createPageUrl("DoctorPrescriptions")}>
                <Card className="cursor-pointer hover:shadow-md transition-all group">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Prescriptions</p>
                      <p className="text-sm text-slate-500">Issue & manage</p>
                    </div>
                    <ArrowRight className="w-5 h-5 ml-auto text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </CardContent>
                </Card>
              </Link>
            </>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Recent Appointments</h2>
          <Link
            to={createPageUrl(isDoctor ? "DoctorAppointments" : "MyAppointments")}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.slice(0, 3).map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                userType={isDoctor ? "doctor" : "patient"}
              />
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">No appointments yet</p>
              {!isDoctor && (
                <Link to={createPageUrl("FindDoctors")}>
                  <Button className="mt-4 bg-gradient-to-r from-teal-500 to-cyan-500">
                    Book Your First Appointment
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div> 
    </div>
  );
}