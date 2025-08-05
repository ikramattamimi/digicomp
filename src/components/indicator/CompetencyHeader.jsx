import React from 'react';
import { Award } from 'lucide-react';
import { Card } from 'flowbite-react';

const CompetencyHeader = () => (
  <Card className="mb-6 bg-white dark:bg-gray-800">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
      <Award className="mr-3 text-blue-600 dark:text-blue-400" />
      Kompetensi
    </h1>
    <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola data kompetensi pegawai</p>
  </Card>
);

export default CompetencyHeader;
