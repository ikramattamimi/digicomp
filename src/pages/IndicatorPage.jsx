import React from 'react';
import { Card } from 'flowbite-react';
import StaffHeader from '../components/subDirectorat/Header.jsx';
import IndikatorTable from '../components/indicator/IndikatorTable.jsx';
// ...existing code...
const IndicatorPage = () => {
  return (
      <div className="page">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          {/* <StaffHeader /> */}
  
          {/* Content */}
          <Card className="mb-6 bg-white dark:bg-gray-800">          
            <IndikatorTable />
          </Card>
        </div>
      </div>
    );
};
export default IndicatorPage;
