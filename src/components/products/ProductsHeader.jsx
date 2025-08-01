import React from 'react';
import { Package } from 'lucide-react';
import { Card } from 'flowbite-react';

const ProductsHeader = () => (
  <Card className="mb-6 bg-white dark:bg-gray-800">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
      <Package className="mr-3 text-blue-600 dark:text-blue-400" />
      Products
    </h1>
    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your product inventory</p>
  </Card>
);

export default ProductsHeader;
