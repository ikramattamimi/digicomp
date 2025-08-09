import React, { useRef } from 'react';
import { Card } from 'flowbite-react';
import StaffHeader from '../components/subDirectorat/Header.jsx';
import SubDirektoratTable from '../components/subDirectorat/SubDirektoratTable.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import { Building, Home, Plus, RefreshCw } from 'lucide-react';

// ...existing code...
const SubDirectoratePage = () => {
  // Ref to access SubDirektoratTable's handlers
  const subDirektoratTableRef = useRef();

  // Handler to trigger add modal in SubDirektoratTable
  const handleAdd = () => {
    if (subDirektoratTableRef.current && subDirektoratTableRef.current.handleAdd) {
      subDirektoratTableRef.current.handleAdd();
    }
  };

  // Handler to trigger refresh in SubDirektoratTable
  const handleRefresh = () => {
    if (subDirektoratTableRef.current && subDirektoratTableRef.current.handleRefresh) {
      subDirektoratTableRef.current.handleRefresh();
    }
  };

  return (
      <div className="page">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <PageHeader
            breadcrumbs={[
              { label: "Dashboard", href: "/", icon: Home },
              { label: "Sub Direktorat", href: "/subdirektorat", icon: Building }
            ]}
            title="Sub Direktorat"
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
                label: 'Tambah Sub Direktorat',
                icon: Plus,
                color: 'blue',
                onClick: handleAdd,
              },
            ]}
          />
  
          {/* Content */}
          <SubDirektoratTable ref={subDirektoratTableRef} />
        </div>
      </div>
    );
};
export default SubDirectoratePage;
