import React from 'react';
import { Card } from 'flowbite-react';
import StaffHeader from '../components/subDirectorat/Header.jsx';
import SubDirektoratTable from '../components/subDirectorat/subDirektoratTable.jsx';

// ...existing code...
const SubDirectoratePage = () => {
  return (
      <div className="page">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          {/* <StaffHeader /> */}
  
          {/* Content */}
          <Card className="mb-6 bg-white dark:bg-gray-800">          
            <SubDirektoratTable />
          </Card>
        </div>
      </div>
    );
};
export default SubDirectoratePage;
