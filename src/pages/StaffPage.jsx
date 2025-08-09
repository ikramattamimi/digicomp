import React, { useRef } from 'react';
import { Card } from 'flowbite-react';
import StaffHeader from '../components/staff/Header.jsx';
import StaffTable from '../components/staff/StaffTable.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import { Users, Home, Plus, RefreshCw } from 'lucide-react';

const StaffPage = () => {
  // Ref to access StaffTable's handlers
  const staffTableRef = useRef();

  // Handler to trigger add modal in StaffTable
  const handleAdd = () => {
    if (staffTableRef.current && staffTableRef.current.handleAdd) {
      staffTableRef.current.handleAdd();
    }
  };

  // Handler to trigger refresh in StaffTable
  const handleRefresh = () => {
    if (staffTableRef.current && staffTableRef.current.handleRefresh) {
      staffTableRef.current.handleRefresh();
    }
  };

  return (
    <div className="page">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/", icon: Home },
            { label: "Staff", href: "/staff", icon: Users }
          ]}
          title="Staff"
          customActions={[
            {
              type: 'button',
              label: 'Refresh',
              icon: RefreshCw,
              color: 'gray',
              onClick: handleRefresh,
            },
            {
              type: 'button',
              label: 'Tambah Staff',
              icon: Plus,
              color: 'blue',
              onClick: handleAdd,
            },
          ]}
        />

        {/* Content */}
        <StaffTable ref={staffTableRef} />
      </div>
    </div>
  );
};

export default StaffPage;
