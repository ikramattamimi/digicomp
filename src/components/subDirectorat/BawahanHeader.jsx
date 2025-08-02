import React from 'react';
import { UserMinus } from 'lucide-react';
import { Card } from 'flowbite-react';

const BawahanHeader = () => (
  <Card className="mb-6 bg-white dark:bg-gray-800">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
      <UserMinus className="mr-3 text-blue-600 dark:text-blue-400" />
      Staff Bawahan
    </h1>
    <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola data staff bawahan</p>
  </Card>
);

export default BawahanHeader;
