import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Building,
  Award,
  Target,
  Users,
  ClipboardCheck,
  RefreshCw,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { LoadingSpinner, ErrorAlert } from "../components/common";
import { Card } from "flowbite-react";

import myImage from "../assets/bg.png";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalSubDir: 0,
    totalKompetensi: 0,
    totalIndikator: 0,
    totalStaff: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStats({
        totalSubDir: 12,
        totalKompetensi: 45,
        totalIndikator: 89,
        totalStaff: 156,
      });
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <img className=" w-lvw h-fit opacity-100" src={myImage}></img>
    </div>
  );
};

const StatsCard = ({ title, value, icon: Icon, color, growth }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  const isPositiveGrowth = growth > 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-l-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>

          {growth !== 0 && (
            <div
              className={`flex items-center mt-2 text-xs ${
                isPositiveGrowth ? "text-green-600" : "text-red-600"
              }`}
            >
              <ArrowUpRight
                className={`h-3 w-3 mr-1 ${
                  !isPositiveGrowth ? "rotate-90" : ""
                }`}
              />
              <span>{Math.abs(growth).toFixed(1)}% vs last month</span>
            </div>
          )}
        </div>

        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
