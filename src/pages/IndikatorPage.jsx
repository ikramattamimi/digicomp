import React from 'react';
import { Card } from 'flowbite-react';
import IndicatorHeader from '../components/indicator/IndicatorHeader';

const IndikatorPage = () => {
  return (
    <div className="page">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <IndicatorHeader />

        {/* Content */}
        <Card className="bg-white dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400">
            Halaman Indikator sedang dalam pengembangan.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default IndikatorPage;
