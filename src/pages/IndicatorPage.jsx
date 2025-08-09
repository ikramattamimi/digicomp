import React, { useRef } from 'react';
import { Card } from 'flowbite-react';
import StaffHeader from '../components/subDirectorat/Header.jsx';
import IndikatorTable from '../components/indicator/IndikatorTable.jsx';
import PageHeader from '../components/common/PageHeader.jsx';
import { Target, Home, Plus, RefreshCw } from 'lucide-react';
// ...existing code...
const IndicatorPage = () => {
  // Ref to access IndikatorTable's handlers
  const indikatorTableRef = useRef();

  // Handler to trigger add modal in IndikatorTable
  const handleAdd = () => {
    if (indikatorTableRef.current && indikatorTableRef.current.handleAdd) {
      indikatorTableRef.current.handleAdd();
    }
  };

  // Handler to trigger refresh in IndikatorTable
  const handleRefresh = () => {
    if (indikatorTableRef.current && indikatorTableRef.current.handleRefresh) {
      indikatorTableRef.current.handleRefresh();
    }
  };

  return (
      <div className="page">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <PageHeader
            breadcrumbs={[
              { label: "Dashboard", href: "/", icon: Home },
              { label: "Indikator", href: "/indikator", icon: Target }
            ]}
            title="Indikator"
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
                label: 'Tambah Indikator',
                icon: Plus,
                color: 'blue',
                onClick: handleAdd,
              },
            ]}
          />
  
          {/* Content */}
          <IndikatorTable ref={indikatorTableRef} />
        </div>
      </div>
    );
};
export default IndicatorPage;
