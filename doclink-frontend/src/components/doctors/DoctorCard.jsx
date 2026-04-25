// @ts-nocheck
import React from "react";
import { Star, Award, Calendar, Clock } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function DoctorCard({ doctor, onBook }) {
  const displayName =
    doctor.name ||
    doctor.user_email?.split("@")[0] ||
    doctor.user?.email?.split("@")[0] ||
    "Doctor";

  const displaySpecialty =
    doctor.specialty ||
    doctor.specialization ||
    "General Practice";

  const displayBio =
    doctor.bio ||
    "Experienced healthcare professional dedicated to providing quality care.";

  const displayExperience =
    doctor.experienceYears ??
    doctor.experience_years ??
    0;

  const displayConsultations =
    doctor.totalConsultations ??
    doctor.total_consultations ??
    0;

  const displayFee =
    doctor.consultationFee ??
    doctor.consultation_fee ??
    0;

  const displayAvailability =
    doctor.availability ||
    ((doctor.isActive ?? true) ? "Available" : "Unavailable");

  const isAvailable =
    doctor.isActive ?? true;

  const displayRating =
    doctor.rating?.toFixed?.(1) || "5.0";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16 ring-4 ring-teal-50 group-hover:ring-teal-100 transition-all">
          <AvatarImage src={doctor.avatar_url || doctor.avatarUrl} />
          <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white text-xl font-bold">
            {displayName?.[0]?.toUpperCase() || "D"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-slate-800 truncate">
            Dr. {displayName}
          </h3>

          <Badge className="mt-1 bg-teal-50 text-teal-700 border-teal-200">
            {displaySpecialty}
          </Badge>

          <p
            className={`text-xs mt-2 ${
              isAvailable ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {displayAvailability}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-amber-700">{displayRating}</span>
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-600 line-clamp-2">
        {displayBio}
      </p>

      <div className="flex items-center gap-4 mt-4 text-sm text-slate-500 flex-wrap">
        <span className="flex items-center gap-1.5">
          <Award className="w-4 h-4 text-teal-500" />
          {displayExperience}+ years
        </span>

        <span className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-teal-500" />
          {isAvailable ? "Open for booking" : "Currently unavailable"}
        </span>
      </div>

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
        <div>
          <span className="text-xs text-slate-500">Consultation Fee</span>
          <p className="font-bold text-teal-600 text-lg">
            {Number(displayFee) === 0 ? "Free" : `$${Number(displayFee).toFixed(2)}`}
          </p>
        </div>

        <Button
          onClick={() => onBook(doctor)}
          disabled={!isAvailable}
          className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-lg shadow-teal-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAvailable ? "Book Now" : "Unavailable"}
        </Button>
      </div>
    </div>
  );
}