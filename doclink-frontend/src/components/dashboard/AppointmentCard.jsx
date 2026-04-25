// @ts-nocheck
import React from "react";
import { format } from "date-fns";
import { Calendar, Clock, Video, MessageSquare, User } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const statusColors = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  completed: "bg-blue-100 text-blue-700 border-blue-200",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function AppointmentCard({ appointment, showActions, onAction, userType = "patient" }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 hover:shadow-md transition-all duration-200">
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12 ring-2 ring-teal-50">
          <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white font-semibold">
            {userType === "patient" 
              ? appointment.doctor_name?.[0] 
              : appointment.patient_name?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-800 truncate">
                {userType === "patient" ? `Dr. ${appointment.doctor_name}` : appointment.patient_name}
              </h3>
              <div className="flex items-center gap-3 mt-1.5 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {appointment.appointment_date ? format(new Date(appointment.appointment_date), "MMM d, yyyy") : "N/A"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {appointment.appointment_time}
                </span>
              </div>
            </div>
            <Badge className={`${statusColors[appointment.status]} border`}>
              {appointment.status}
            </Badge>
          </div>
          
          {appointment.symptoms && (
            <p className="mt-3 text-sm text-slate-600 line-clamp-2 bg-slate-50 rounded-lg p-2.5">
              {appointment.symptoms}
            </p>
          )}
          
          <div className="flex items-center gap-2 mt-4">
            <Badge variant="outline" className="text-xs">
              {appointment.consultation_type === "video" ? (
                <><Video className="w-3 h-3 mr-1" /> Video Call</>
              ) : (
                <><MessageSquare className="w-3 h-3 mr-1" /> Chat</>
              )}
            </Badge>
            
            {showActions && appointment.status === "pending" && userType === "doctor" && (
              <div className="flex gap-2 ml-auto">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => onAction(appointment.id, "rejected")}
                >
                  Reject
                </Button>
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                  onClick={() => onAction(appointment.id, "approved")}
                >
                  Approve
                </Button>
              </div>
            )}
            
            {appointment.status === "approved" && appointment.meeting_link && (
              <Button 
                size="sm" 
                className="ml-auto bg-gradient-to-r from-teal-500 to-cyan-500"
                onClick={() => window.open(appointment.meeting_link, "_blank")}
              >
                <Video className="w-4 h-4 mr-1.5" />
                Join Call
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}