// @ts-nocheck
import React from "react";
import { format } from "date-fns";
import { Calendar, Clock, Users, Video, CheckCircle } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

const categoryColors = {
  "Heart Health": "bg-red-100 text-red-700",
  "Mental Wellness": "bg-purple-100 text-purple-700",
  "Nutrition": "bg-green-100 text-green-700",
  "Diabetes Management": "bg-blue-100 text-blue-700",
  "Women's Health": "bg-pink-100 text-pink-700",
  "Child Care": "bg-orange-100 text-orange-700",
  "Senior Care": "bg-amber-100 text-amber-700",
  "Fitness": "bg-teal-100 text-teal-700",
  "General Wellness": "bg-cyan-100 text-cyan-700",
};

export default function SeminarCard({ seminar, onRegister, isRegistered, userEmail }) {
  const registered = isRegistered || seminar.registered_emails?.includes(userEmail);
  const spotsLeft = seminar.max_attendees ? seminar.max_attendees - (seminar.registered_emails?.length || 0) : null;
  
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative h-40 bg-gradient-to-br from-teal-500 to-cyan-600 overflow-hidden">
        {seminar.image_url && (
          <img 
            src={seminar.image_url} 
            alt={seminar.title}
            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Badge className={`absolute top-4 left-4 ${categoryColors[seminar.topic_category] || "bg-slate-100 text-slate-700"}`}>
          {seminar.topic_category}
        </Badge>
      </div>
      
      <div className="p-5">
        <h3 className="font-bold text-lg text-slate-800 line-clamp-2">{seminar.title}</h3>
        <p className="mt-2 text-sm text-slate-500">By {seminar.speaker_name || "Healthcare Expert"}</p>
        {seminar.speaker_title && (
          <p className="text-xs text-slate-400">{seminar.speaker_title}</p>
        )}
        
        <p className="mt-3 text-sm text-slate-600 line-clamp-2">{seminar.description}</p>
        
        <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-slate-500">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-teal-500" />
            {seminar.event_date ? format(new Date(seminar.event_date), "MMM d, yyyy") : "TBD"}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-teal-500" />
            {seminar.event_time}
          </span>
          {spotsLeft !== null && (
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-teal-500" />
              {spotsLeft} spots left
            </span>
          )}
        </div>
        
        <div className="mt-5">
          {registered ? (
            <Button disabled className="w-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              <CheckCircle className="w-4 h-4 mr-2" />
              Registered
            </Button>
          ) : (
            <Button 
              onClick={() => onRegister(seminar)}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
            >
              <Video className="w-4 h-4 mr-2" />
              Register Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}