import React, { useRef } from "react";
import { Card, Select } from "flowbite-react";

import PageHeader from "../components/common/PageHeader.jsx";
import { Building, Home, Plus, RefreshCw } from "lucide-react";
import AuthService from "../services/AuthService.js";
import { useEffect, useState } from "react";

import AssessmentResponseService from "../services/AssessmentResponseService.js";
import BawahanPage from "../components/laporan/BawahanPage.jsx";

const LaporanPage = () => {
  const [subsatkerPage, setSubsatkerPage] = useState(); // nilai dari mentor

  const handleChange = (index) => {
    const assdetail = assassement[index];

    if (subsatkerPage == null && assdetail) {
      console.log(assdetail.self_weight);
      const myArray = [];
      setSubsatkerPage(
        <BawahanPage
          assasmentId={assdetail.id}
          sw={assdetail.self_weight}
          aw={assdetail.supervisor_weight}
          cntId={myArray}
        />
      );
    } else if (subsatkerPage != null && assdetail) {
      setSubsatkerPage(<div></div>);
      setTimeout(function () {
        const myArray = [];
        setSubsatkerPage(
          <BawahanPage
            assasmentId={assdetail.id}
            sw={assdetail.self_weight}
            aw={assdetail.supervisor_weight}
            cntId={myArray}
          />
        );
      }, 100);
    }
  };

  // Handler to trigger refresh in SubDirektoratTable
  const handleRefresh = () => {
    if (
      subDirektoratTableRef.current &&
      subDirektoratTableRef.current.handleRefresh
    ) {
      subDirektoratTableRef.current.handleRefresh();
    }
  };

  const [page, setPage] = useState("hidden");
  let showComp = [];
  const [assassement, setAssassement] = useState([]);
  useEffect(() => {
    const fetchUserData = async () => {
      const checkUser = await AuthService.checkUser();
      if (checkUser.position_type == "ADMIN") {
        setPage("show");
      }

      const dataResponse = await AssessmentResponseService.getAssesment();
      handleChange(0);

      dataResponse.map((sup) => {
        if (
          sup.subject_profile_id.subdirectorat_id == checkUser.subdirectorat_id
        ) {
          if (showComp.includes(sup.assessment_id.id)) {
          } else {
            showComp.push(sup.assessment_id.id);
            setAssassement((prevArray1) => [
              ...prevArray1,
              {
                id: sup.assessment_id.id,
                nama: sup.assessment_id.name,
                self_weight: sup.assessment_id.self_weight,
                supervisor_weight: sup.assessment_id.supervisor_weight,
              },
            ]);
          }
        }
      });
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
            { label: "Laporan", href: "/laporan", icon: Building },
          ]}
          title="Laporan & Hasil"
          customActions={[
            {
              type: "button",
              label: "Refresh",
              icon: RefreshCw,
              color: "gray",
              onClick: handleRefresh,
            },
          ]}
        />

        <Select
          onChange={(e) => handleChange(e.target.value)}
          className="m-4 w-100"
        >
          <option value={-1}>PILIH PENILAIAN</option>
          {assassement.map((sub, index) => (
            <option value={index}>{sub.nama}</option>
          ))}
        </Select>

        {/* Content */}
        {subsatkerPage}
      </div>
    </div>
  );
};
export default LaporanPage;
