import React from 'react';
import { Card } from 'flowbite-react';
import StaffHeader from '../components/staff/Header.jsx';

const AtasanPage = () => {
  return (
    <div className="page">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <StaffHeader />

        {/* Content */}
        <Card className="bg-white dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400">
            Halaman Staff Atasan sedang dalam pengembangan.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default AtasanPage;
