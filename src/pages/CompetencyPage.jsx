import React, { useEffect, useState } from "react";
import { Card } from "flowbite-react";
import StaffHeader from "../components/subDirectorat/Header.jsx";
import KompetensiTable from "../components/competency/KompetensiTable.jsx";
import PageHeader from "../components/common/PageHeader.jsx";
import { Award, Home, Plus, RefreshCw } from "lucide-react";
// ...existing code...

import { useRef } from "react";
import AuthService from "../services/AuthService.js";

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

  const [page, setPage] = useState("hidden");
    useEffect(() => {
      const fetchUserData = async () => {
        const checkUser = await AuthService.checkUser();
        if (checkUser.position_type == "ADMIN") {
          setPage("show");
        }
      };
      fetchUserData();
    }, []);

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
// import React from 'react';
// import { Card } from 'flowbite-react';
// import StaffHeader from '../components/subDirectorat/Header.jsx';
// import KompetensiTable from '../components/competency/KompetensiTable.jsx';
// // ...existing code...
// import AuthService from "../services/AuthService.js";
// import { useEffect, useState } from "react";

// const CompetencyPage = () => {
//   const [page, setPage] = useState("hidden");
//     useEffect(() => {
//       const fetchUserData = async () => {
//         const checkUser = await AuthService.checkUser();
//         if (checkUser.position_type == "ADMIN") {
//           setPage("show");
//         }
//       };
//       fetchUserData();
//     }, []);
  
//   return (
//       <div className="page">
//         <div className="max-w-7xl mx-auto">
//           {/* Header */}
//           {/* <StaffHeader /> */}
  
//           {/* Content */}
//           <Card className="mb-6 bg-white dark:bg-gray-800">          
//             {page == "hidden" ? <div>Not Allowed</div> : <KompetensiTable />}
//           </Card>
//         </div>
//       </div>
//     );
};
export default CompetencyPage;
