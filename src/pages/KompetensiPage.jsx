import React from 'react';
import { Card } from 'flowbite-react';
import CompetencyHeader from '../components/competency/CompetencyHeader';

const KompetensiPage = () => {
  return (
    <div className="page">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <CompetencyHeader />

        {/* Content */}
        <Card className="bg-white dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400">
            Halaman Kompetensi sedang dalam pengembangan.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default KompetensiPage;
