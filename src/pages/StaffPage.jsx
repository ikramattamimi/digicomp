import React from 'react';
import { Card } from 'flowbite-react';
import StaffHeader from '../components/staff/Header.jsx';
import StaffTable from '../components/staff/StaffTable.jsx';
const StaffPage = () => {
  return (
    <div className="page">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {/* <StaffHeader /> */}

        {/* Content */}
        <Card className="mb-6 bg-white dark:bg-gray-800">          
          <StaffTable />
        </Card>
      </div>
    </div>
  );
};

export default StaffPage;
