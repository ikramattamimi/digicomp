import React from 'react';
import { Target } from 'lucide-react';
import { Card } from 'flowbite-react';

const IndicatorHeader = () => (
  <Card className="mb-6 bg-white dark:bg-gray-800">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
      <Target className="mr-3 text-blue-600 dark:text-blue-400" />
      Indikator
    </h1>
    <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola indikator penilaian</p>
  </Card>
);

export default IndicatorHeader;
