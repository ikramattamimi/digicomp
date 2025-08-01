import React from 'react';
import { Card } from 'flowbite-react';
import DirectorateHeader from '../components/directorate/DirectorateHeader';

const SubDirektoratPage = () => {
  return (
    <div className="page">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <DirectorateHeader />

        {/* Content */}
        <Card className="bg-white dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400">
            Halaman Sub Direktorat sedang dalam pengembangan.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default SubDirektoratPage;
