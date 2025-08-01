import React, { useState } from 'react';
import { Package, Plus, Search, Filter } from 'lucide-react';
import { Button, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, TextInput, Card } from 'flowbite-react';
import ProductsHeader from '../components/products/ProductsHeader';

const ProductsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products] = useState([
    { id: 1, name: 'Product 1', category: 'Electronics', price: 100000, stock: 50 },
    { id: 2, name: 'Product 2', category: 'Clothing', price: 250000, stock: 25 },
    { id: 3, name: 'Product 3', category: 'Books', price: 75000, stock: 100 },
  ]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <ProductsHeader />

        {/* Search & Filter */}
        <Card className="mb-6 bg-white dark:bg-gray-800">
          <div className="flex gap-4">
            <div className="flex-1">
              <TextInput
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={Search}
              />
            </div>
            <Button color="gray" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        
        <Card className="bg-white dark:bg-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <Table hoverable>
              <TableHead>
                <TableRow>
                  <TableHeadCell>Product</TableHeadCell>
                  <TableHeadCell>Category</TableHeadCell>
                  <TableHeadCell>Price</TableHeadCell>
                  <TableHeadCell>Stock</TableHeadCell>
                  <TableHeadCell>Actions</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody className="divide-y">
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                    <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>Rp {product.price.toLocaleString('id-ID')}</TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.stock > 30 ? 'bg-green-100 text-green-800' :
                        product.stock > 10 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="xs" color="info">Edit</Button>
                        <Button size="xs" color="failure">Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;