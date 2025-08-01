import React from 'react';
import { Card } from 'flowbite-react';
import AssessmentHeader from '../components/assessment/AssessmentHeader';

const PenilaianPage = () => {
  return (
    <div className="page">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <AssessmentHeader />

        {/* Content */}
        <Card className="bg-white dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400">
            Halaman Penilaian sedang dalam pengembangan.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default PenilaianPage;
