import React from 'react';
import { UserCheck } from 'lucide-react';
import { Card } from 'flowbite-react';

const StaffHeader = () => (
  <Card className="mb-6 bg-white dark:bg-gray-800">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
      <UserCheck className="mr-3 text-blue-600 dark:text-blue-400" />
      Staff Atasan
    </h1>
    <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola data staff atasan</p>
  </Card>
);

export default StaffHeader;
