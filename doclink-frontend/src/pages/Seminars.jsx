// @ts-nocheck
import React, { useMemo, useState } from "react";
import api from "../api/api";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Filter, GraduationCap, CalendarDays, Clock, User2 } from "lucide-react";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

const CATEGORIES = [
  "All Categories",
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Diabetes",
  "Mental Health",
  "General Wellness",
];

export default function Seminars() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [activeTab, setActiveTab] = useState("upcoming");

  const { data: user = null } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.auth.me();
      return res;
    },
  });

  const { data: seminars = [], isLoading } = useQuery({
    queryKey: ["seminars"],
    queryFn: async () => {
      const res = await api.get("/seminars");
      const payload = res.data;

      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.seminars)) return payload.seminars;
      if (Array.isArray(payload?.data)) return payload.data;

      return [];
    },
  });

  const normalizedSeminars = useMemo(() => {
    return seminars.map((sem) => ({
      ...sem,
      displayTitle: sem.title || "Untitled Seminar",
      displayDescription: sem.description || "No description available",
      displaySpeakerName: sem.speakerName || sem.speaker_name || "Guest Speaker",
      displaySpeakerTitle: sem.speakerTitle || sem.speaker_title || "",
      displayEventDate: sem.eventDate || sem.event_date || null,
      displayEventTime: sem.eventTime || sem.event_time || "TBA",
      displayDuration: sem.durationMinutes || sem.duration_minutes || 60,
      displayCategory: sem.topicCategory || sem.topic_category || "General Wellness",
      displayMeetingLink: sem.meetingLink || sem.meeting_link || "",
      displayMaxAttendees: sem.maxAttendees || sem.max_attendees || 100,
      displayIsActive: sem.isActive ?? sem.is_active ?? true,
    }));
  }, [seminars]);

  const filteredSeminars = normalizedSeminars.filter((sem) => {
    const q = searchTerm.toLowerCase();

    const matchesSearch =
      sem.displayTitle.toLowerCase().includes(q) ||
      sem.displayDescription.toLowerCase().includes(q) ||
      sem.displaySpeakerName.toLowerCase().includes(q);

    const matchesCategory =
      selectedCategory === "All Categories" ||
      sem.displayCategory === selectedCategory;

    return matchesSearch && matchesCategory && sem.displayIsActive;
  });

  const upcomingSeminars = filteredSeminars.filter((sem) => {
    if (!sem.displayEventDate) return false;
    return new Date(sem.displayEventDate) >= new Date(new Date().setHours(0, 0, 0, 0));
  });

  const mySeminars = [];
  const seminarsToShow = activeTab === "upcoming" ? upcomingSeminars : mySeminars;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Health Seminars</h1>
        <p className="text-slate-500 mt-1">
          Join informative sessions from healthcare experts
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search seminars..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 bg-white border-slate-200"
          />
        </div>

        <div className="relative w-full sm:w-56">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full h-12 rounded-md border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <Button
          variant={activeTab === "upcoming" ? "default" : "outline"}
          onClick={() => setActiveTab("upcoming")}
          className={activeTab === "upcoming" ? "bg-teal-500 hover:bg-teal-600" : ""}
        >
          Upcoming ({upcomingSeminars.length})
        </Button>

        <Button
          variant={activeTab === "registered" ? "default" : "outline"}
          onClick={() => setActiveTab("registered")}
          className={activeTab === "registered" ? "bg-teal-500 hover:bg-teal-600" : ""}
        >
          My Registrations ({mySeminars.length})
        </Button>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />
          ))}
        </div>
      ) : seminarsToShow.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seminarsToShow.map((seminar, i) => (
            <motion.div
              key={seminar.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <div className="h-40 bg-gradient-to-br from-teal-500 via-cyan-500 to-sky-500 flex items-center justify-center">
                <GraduationCap className="w-16 h-16 text-white/90" />
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-xl font-semibold text-slate-800 leading-snug">
                    {seminar.displayTitle}
                  </h3>
                  <Badge variant="outline" className="shrink-0">
                    {seminar.displayCategory}
                  </Badge>
                </div>

                <p className="text-slate-600 text-sm leading-6 min-h-[72px]">
                  {seminar.displayDescription}
                </p>

                <div className="space-y-3 mt-5 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <User2 className="w-4 h-4 text-teal-600" />
                    <span>
                      {seminar.displaySpeakerName}
                      {seminar.displaySpeakerTitle
                        ? ` • ${seminar.displaySpeakerTitle}`
                        : ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-teal-600" />
                    <span>
                      {seminar.displayEventDate
                        ? new Date(seminar.displayEventDate).toLocaleDateString()
                        : "Date TBA"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-teal-600" />
                    <span>
                      {seminar.displayEventTime} • {seminar.displayDuration} mins
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Max attendees: {seminar.displayMaxAttendees}
                  </span>

                  {seminar.displayMeetingLink ? (
                    <a
                      href={seminar.displayMeetingLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
                        Join / View
                      </Button>
                    </a>
                  ) : (
                    <Button
                      disabled
                      variant="outline"
                    >
                      Details Only
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
          <GraduationCap className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800">
            {activeTab === "upcoming"
              ? "No upcoming seminars"
              : "No registrations yet"}
          </h3>
          <p className="text-slate-500">
            {activeTab === "upcoming"
              ? "Check back later for new health seminars"
              : "Seminar registration tracking is not connected yet"}
          </p>
        </div>
      )}
    </div>
  );
}