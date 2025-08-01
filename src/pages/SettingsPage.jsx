
import React from 'react';
import { Settings, User, Bell, Shield } from 'lucide-react';
import { Card } from 'flowbite-react';
import SettingsHeader from '../components/settings/SettingsHeader';

const SettingsPage = () => {
  return (
    <div className="page">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <SettingsHeader />

        {/* Settings Cards */}
        <div className="grid gap-6">
          <Card className="bg-white dark:bg-gray-800">
            <SettingsCard
              title="Profile Settings"
              description="Update your personal information and preferences"
              icon={User}
            />
          </Card>
          <Card className="bg-white dark:bg-gray-800">
            <SettingsCard
              title="Notifications"
              description="Configure your notification preferences"
              icon={Bell}
            />
          </Card>
          <Card className="bg-white dark:bg-gray-800">
            <SettingsCard
              title="Security"
              description="Manage your password and security settings"
              icon={Shield}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

const SettingsCard = ({ title, description, icon: Icon }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center">
        <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg mr-4">
          <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{description}</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Configure
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;