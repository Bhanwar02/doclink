// @ts-nocheck
import React from "react";
import { motion } from "framer-motion";

export default function StatsCard({ title, value, icon: Icon, trend, color = "teal" }) {
  const colorClasses = {
    teal: "from-teal-500 to-cyan-500 shadow-teal-500/25",
    blue: "from-blue-500 to-indigo-500 shadow-blue-500/25",
    purple: "from-purple-500 to-pink-500 shadow-purple-500/25",
    orange: "from-orange-500 to-amber-500 shadow-orange-500/25",
    green: "from-emerald-500 to-teal-500 shadow-emerald-500/25",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-800">{value}</p>
          {trend && (
            <p className={`text-sm font-medium ${trend > 0 ? "text-emerald-600" : "text-red-500"}`}>
              {trend > 0 ? "+" : ""}{trend}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className={`absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-full`} />
    </motion.div>
  );
}