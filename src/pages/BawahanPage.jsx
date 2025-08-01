import React from 'react';
import { Card } from 'flowbite-react';
import BawahanHeader from '../components/staff/BawahanHeader';

const BawahanPage = () => {
  return (
    <div className="page">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <BawahanHeader />

        {/* Content */}
        <Card className="bg-white dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400">
            Halaman Staff Bawahan sedang dalam pengembangan.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default BawahanPage;
