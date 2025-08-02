import React from 'react';
import { Card } from 'flowbite-react';
import StaffHeader from '../components/subDirectorat/Header.jsx';
import KompetensiTable from '../components/competency/KompetensiTable.jsx';
// ...existing code...
const CompetencyPage = () => {
  return (
      <div className="page">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          {/* <StaffHeader /> */}
  
          {/* Content */}
          <Card className="mb-6 bg-white dark:bg-gray-800">          
            <KompetensiTable />
          </Card>
        </div>
      </div>
    );
};
export default CompetencyPage;
