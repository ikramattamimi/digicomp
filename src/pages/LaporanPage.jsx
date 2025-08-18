import React, { useRef } from "react";
import { Card, Select, Button } from "flowbite-react";

import PageHeader from "../components/common/PageHeader.jsx";
import { Building, Home, Plus, RefreshCw, ChevronDown } from "lucide-react";
import AuthService from "../services/AuthService.js";
import { useEffect, useState } from "react";

import AssessmentResponseService from "../services/AssessmentResponseService.js";
import BawahanPage from "../components/laporan/BawahanPage.jsx";

const LaporanPage = () => {
  const [subsatkerPage, setSubsatkerPage] = useState(); // nilai dari mentor
  const [selectedAssessment, setSelectedAssessment] = useState("");

  const handleChange = (index) => {
    const assdetail = assassement[index];
    setSelectedAssessment(assdetail?.nama || "");

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
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        {/* Mobile-responsive Header */}
        <div className="mb-4 sm:mb-6">
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
        </div>

        {/* Mobile-responsive Assessment Selector */}
        <Card className="mb-4 sm:mb-6 bg-white dark:bg-gray-800 shadow-sm">
          <div className="space-y-3">
            {/* Mobile: Label above select */}
            <div className="block sm:hidden">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pilih Penilaian
              </label>
            </div>
            
            {/* Desktop: Inline label */}
            <div className="hidden sm:block">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Pilih Penilaian untuk Ditampilkan
              </h3>
            </div>

            {/* Assessment selector - responsive */}
            <div className="space-y-2">
              <Select
                onChange={(e) => handleChange(e.target.value)}
                className="w-full"
                value={selectedAssessment ? assassement.findIndex(a => a.nama === selectedAssessment) : -1}
              >
                <option value={-1} className="text-gray-500">
                  -- PILIH PENILAIAN --
                </option>
                {assassement.map((sub, index) => (
                  <option key={sub.id} value={index} className="py-2">
                    {sub.nama}
                  </option>
                ))}
              </Select>

              {/* Mobile: Show selected assessment info */}
              {selectedAssessment && (
                <div className="block sm:hidden mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                    Penilaian Terpilih:
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    {selectedAssessment}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Assessment count info - responsive */}
        {assassement.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">{assassement.length}</span> penilaian tersedia
              </div>
              
              {/* Mobile: Refresh button */}
              <div className="block sm:hidden">
                <Button
                  size="sm"
                  color="gray"
                  onClick={handleRefresh}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Data
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Content Container - responsive */}
        <div className="w-full">
          {subsatkerPage ? (
            // Content with mobile wrapper
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              {subsatkerPage}
            </div>
          ) : (
            // Empty state - responsive
            <Card className="bg-white dark:bg-gray-800">
              <div className="text-center py-8 sm:py-12">
                <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4">
                  <Building className="w-full h-full" />
                </div>
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2">
                  Pilih Penilaian
                </h3>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto px-4">
                  Silakan pilih penilaian dari dropdown di atas untuk melihat laporan dan hasil
                </p>
                
                {assassement.length === 0 && (
                  <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Belum ada penilaian yang tersedia untuk ditampilkan
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Mobile: Bottom spacing */}
        <div className="h-4 sm:h-6"></div>
      </div>
    </div>
  );
};

export default LaporanPage;