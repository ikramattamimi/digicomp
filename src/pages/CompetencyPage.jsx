import React from "react";
import { Card } from "flowbite-react";
import StaffHeader from "../components/subDirectorat/Header.jsx";
import KompetensiTable from "../components/competency/KompetensiTable.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import { Award, Home, Plus, RefreshCw } from "lucide-react";
// ...existing code...

import { useRef } from "react";

const CompetencyPage = () => {
  // Ref to access KompetensiTable's handlers
  const kompetensiTableRef = useRef();

  // Handler to trigger add modal in KompetensiTable
  const handleAdd = () => {
    if (kompetensiTableRef.current && kompetensiTableRef.current.handleAdd) {
      kompetensiTableRef.current.handleAdd();
    }
  };

  // Handler to trigger refresh in KompetensiTable
  const handleRefresh = () => {
    if (kompetensiTableRef.current && kompetensiTableRef.current.handleRefresh) {
      kompetensiTableRef.current.handleRefresh();
    }
  };

  return (
    <div className="page">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/", icon: Home },
            { label: "Kompetensi", href: "/kompetensi", icon: Award }
          ]}
          title="Kompetensi"
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
              label: 'Tambah Kompetensi',
              icon: Plus,
              color: 'blue',
              onClick: handleAdd,
            },
          ]}
        />

        {/* Content */}
        <KompetensiTable ref={kompetensiTableRef} />
        
      </div>
    </div>
  );
};
export default CompetencyPage;
