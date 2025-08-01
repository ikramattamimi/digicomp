import React, { useState, useEffect } from 'react';
import {
  BarChart3, 
  Building, 
  Award, 
  Target, 
  Users,
  ClipboardCheck, 
  RefreshCw,
  TrendingUp,
  ArrowUpRight 
} from 'lucide-react';
import { LoadingSpinner, ErrorAlert } from '../components/common';
import { Card } from 'flowbite-react';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalSubDir: 0,
    totalKompetensi: 0,
    totalIndikator: 0,
    totalStaff: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        totalSubDir: 12,
        totalKompetensi: 45,
        totalIndikator: 89,
        totalStaff: 156
      });
    } catch {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="page">
      <div className="max-w-7xl mx-auto">
        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
        
        {/* Header */}
        <Card className="mb-6 bg-white dark:bg-gray-800">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <BarChart3 className="mr-3 text-blue-600 dark:text-blue-400" />
                Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome to your admin panel</p>
            </div>
            <button
              onClick={loadDashboardData}
              className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatsCard
            title="Sub Direktorat"
            value={stats.totalSubDir}
            icon={Building}
            color="blue"
            growth={12.5}
          />
          <StatsCard
            title="Kompetensi"
            value={stats.totalKompetensi}
            icon={Award}
            color="green"
            growth={8.2}
          />
          <StatsCard
            title="Indikator"
            value={stats.totalIndikator}
            icon={Target}
            color="purple"
            growth={15.3}
          />
          <StatsCard
            title="Total Staff"
            value={stats.totalStaff}
            icon={Users}
            color="orange"
            growth={-2.1}
          />
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, icon: Icon, color, growth }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  const isPositiveGrowth = growth > 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-l-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          
          {growth !== 0 && (
            <div className={`flex items-center mt-2 text-xs ${
              isPositiveGrowth ? 'text-green-600' : 'text-red-600'
            }`}>
              <ArrowUpRight className={`h-3 w-3 mr-1 ${!isPositiveGrowth ? 'rotate-90' : ''}`} />
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