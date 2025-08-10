import React from 'react';
import { Card } from 'flowbite-react';
import StaffHeader from '../components/subDirectorat/Header.jsx';
import KompetensiTable from '../components/competency/KompetensiTable.jsx';
// ...existing code...
import AuthService from "../services/AuthService.js";
import { useEffect, useState } from "react";

const CompetencyPage = () => {
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
          {/* <StaffHeader /> */}
  
          {/* Content */}
          <Card className="mb-6 bg-white dark:bg-gray-800">          
            {page == "hidden" ? <div>Not Allowed</div> : <KompetensiTable />}
          </Card>
        </div>
      </div>
    );
};
export default CompetencyPage;
