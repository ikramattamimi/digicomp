import React, { useRef } from "react";
import { Card, Select } from "flowbite-react";
import StaffHeader from "../components/subDirectorat/Header.jsx";

import {
  Tabs,
  TabItem,
  Label,
  TextInput,
  Button,
  Textarea,
} from "flowbite-react";

import PageHeader from "../components/common/PageHeader.jsx";
import { Building, Home, Plus, RefreshCw, User, ChevronDown } from "lucide-react";
import AuthService from "../services/AuthService.js";
import { useEffect, useState } from "react";

import SubsatkerPage from "../components/laporan/SubsatkerPage.jsx";
import LaporanStaffTable from "../components/laporan/LaporanStaffTable.jsx";
import LaporanAnggotaPage from "../components/laporan/LaporanAnggotaPage.jsx";
import AssessmentResponseService from "../services/AssessmentResponseService.js";

const LaporanSubsatkerPage = () => {
  const subDirektoratTableRef = useRef();
  const [show, setShow] = useState();
  const [message, setMessage] = useState("0");
  const [activeTab, setActiveTab] = useState(0);
  const [selectedAssessment, setSelectedAssessment] = useState("");

  const [assasmentId, setassasmentId] = useState(5);
  const [subsatkerPage, setSubsatkerPage] = useState();

  const closePage = (id) => {
    setMessage("");
    setShow();
  };

  const forceReRender = (id) => {
    const myArray = [];
    setShow(
      <LaporanAnggotaPage
        id={id}
        userData={closePage}
        assasmentId={assasmentId.id}
        sw={assasmentId.self_weight}
        aw={assasmentId.supervisor_weight}
        cntId={myArray}
      />
    );
    setMessage("hidden");
  };

  const handleRefresh = () => {
    if (
      subDirektoratTableRef.current &&
      subDirektoratTableRef.current.handleRefresh
    ) {
      subDirektoratTableRef.current.handleRefresh();
    }
  };

  const handleChange = (index) => {
    closePage();
    const assdetail = assa[index];

    if (assdetail) {
      setassasmentId(assdetail);
      setSelectedAssessment(assdetail.nama);
    }

    if (subsatkerPage == null && assdetail) {
      const myArray = [];
      setSubsatkerPage(
        <SubsatkerPage
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
          <SubsatkerPage
            assasmentId={assdetail.id}
            sw={assdetail.self_weight}
            aw={assdetail.supervisor_weight}
            cntId={myArray}
          />
        );
      }, 100);
    } else {
      setSubsatkerPage(<strong>Pilih penilaian untuk ditampilkan</strong>);
    }
  };

  const [page, setPage] = useState("hidden");
  let showComp = [];
  const [assa, setassa] = useState([]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      const checkUser = await AuthService.checkUser();
      if (checkUser.position_type == "ATASAN") {
        setPage("show");
      }

      const dataResponse = await AssessmentResponseService.getAssesment();
      handleChange(dataResponse[0]?.assessment_id?.id || 0);

      dataResponse.map((sup) => {
        if (
          sup.subject_profile_id.subdirectorat_id == checkUser.subdirectorat_id
        ) {
          if (showComp.includes(sup.assessment_id.id)) {
          } else {
            showComp.push(sup.assessment_id.id);
            setassa((prevArray1) => [
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

  if (page == "hidden") {
    return (
      <div className="page">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="mb-6 bg-white dark:bg-gray-800">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Akses Tidak Diizinkan
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Anda tidak memiliki permission untuk mengakses halaman ini.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="page overflow-x-auto">
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
                value={selectedAssessment ? assa.findIndex(a => a.nama === selectedAssessment) : -1}
              >
                <option value={-1} className="text-gray-500">
                  -- PILIH PENILAIAN --
                </option>
                {assa.map((sub, index) => (
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
        {assa.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">{assa.length}</span> penilaian tersedia
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
        <div className="w-fit">
          {/* Tabs - mobile responsive */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <Tabs
              aria-label="Tabs Assessment"
              onActiveTabChange={(tab) => setActiveTab(tab)}
              theme={{
                base: "flex flex-col",
                tablist: {
                  base: "flex border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-t-lg",
                  styles: {
                    default: "flex-wrap sm:flex-nowrap",
                  },
                },
                tabitemcontainer: {
                  base: "px-3 sm:px-5 pb-3 sm:pb-4",
                },
                tabItem: {
                  base: "flex items-center justify-center px-3 py-2 sm:px-4 sm:py-3 text-sm font-medium text-center rounded-t-lg border-b-2 border-transparent",
                  variant: {
                    default: {
                      base: "rounded-t-lg min-w-0 flex-1 sm:flex-initial",
                      active: {
                        on: "bg-white dark:bg-gray-800 text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500",
                        off: "text-gray-500 hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300",
                      },
                    },
                  },
                },
              }}
            >
              <TabItem title="Laporan Subsatker" tabIndex={0}>
                <div className="p-3 sm:p-4">
                  {subsatkerPage ? (
                    <div className="overflow-hidden">
                      {subsatkerPage}
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12">
                      <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-4">
                        <Building className="w-full h-full" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2">
                        Pilih Penilaian
                      </h3>
                      <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto px-4">
                        Silakan pilih penilaian dari dropdown di atas untuk melihat laporan subsatker
                      </p>
                    </div>
                  )}
                </div>
              </TabItem>
              
              <TabItem title="Laporan Anggota" tabIndex={1}>
                <div className="p-3 sm:p-4">
                  <div className={message}>
                    <PageHeader
                      breadcrumbs={[{ label: "", href: "" }]}
                      title="Daftar Anggota"
                    />
                    <LaporanStaffTable userData={forceReRender} />
                  </div>
                  
                  <div className="mt-4">
                    {show}
                  </div>
                </div>
              </TabItem>
            </Tabs>
          </div>
        </div>

        {/* Mobile: Bottom spacing */}
        <div className="h-4 sm:h-6"></div>
      </div>
    </div>
  );
};

export default LaporanSubsatkerPage;