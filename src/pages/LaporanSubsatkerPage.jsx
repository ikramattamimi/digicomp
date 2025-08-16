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
import { Building, Home, Plus, RefreshCw, User } from "lucide-react";
import AuthService from "../services/AuthService.js";
import { useEffect, useState } from "react";

import SubsatkerPage from "../components/laporan/SubsatkerPage.jsx";
import LaporanStaffTable from "../components/laporan/LaporanStaffTable.jsx";
import LaporanAnggotaPage from "../components/laporan/LaporanAnggotaPage.jsx";
import AssessmentResponseService from "../services/AssessmentResponseService.js";
// ...existing code...
const LaporanSubsatkerPage = () => {
  // Ref to access SubDirektoratTable's handlers
  const subDirektoratTableRef = useRef();
  const [show, setShow] = useState();
  const [message, setMessage] = useState("0");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  const [assasmentId, setassasmentId] = useState(5); // nilai dari mentor
  const [subsatkerPage, setSubsatkerPage] = useState(); // nilai dari mentor

  const forceReRender2 = (id) => {
    setMessage("");
    setShow();
  };

  const forceReRender = (id) => {
    setShow(
      <LaporanAnggotaPage
        id={id}
        userData={forceReRender2}
        assasmentId={assasmentId}
      />
    );
    setMessage("hidden");
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

  const handleChange = (id) => {
    setassasmentId(id);

    if (subsatkerPage == null) {
      setSubsatkerPage(<SubsatkerPage assasmentId={id} />);
    } else {
      setSubsatkerPage(<div></div>);
      setTimeout(function () {
        setSubsatkerPage(<SubsatkerPage assasmentId={id} />);
      }, 100);
    }
  };

  const [page, setPage] = useState("hidden");
  let showComp = [];
  const [assa, setassa] = useState([]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        const checkUser = await AuthService.checkUser();
        if (checkUser.position_type == "ADMIN") {
          setPage("show");
        }

        const dataResponse = await AssessmentResponseService.getAssesment();
        
        if (!dataResponse || dataResponse.length === 0) {
          setLoading(false);
          return;
        }

        handleChange(dataResponse[0].assessment_id.id);

        const filteredAssessments = [];
        dataResponse.forEach((sup) => {
          if (
            sup.subject_profile_id.subdirectorat_id == checkUser.subdirectorat_id
          ) {
            if (!showComp.includes(sup.assessment_id.id)) {
              showComp.push(sup.assessment_id.id);
              filteredAssessments.push({
                id: sup.assessment_id.id, 
                nama: sup.assessment_id.name
              });
            }
          }
        });

        setassa(filteredAssessments);
        
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="page">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            breadcrumbs={[
              { label: "Dashboard", href: "/", icon: Home },
              { label: "Laporan", href: "/laporan", icon: Building },
            ]}
            title="Laporan & Hasil"
          />
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Memuat data laporan...</div>
          </div>
        </div>
      </div>
    );
  }

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

        {assa.length > 0 ? (
          <Select
            onChange={(e) => handleChange(e.target.value)}
            className="m-4 w-100"
          >
            {assa.map((sub) => (
              <option key={sub.id} value={sub.id}>{sub.nama}</option>
            ))}
          </Select>
        ) : (
          <div className="m-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-gray-500 text-center">
              Belum ada data laporan tersedia
            </div>
          </div>
        )}

        {/* Content */}
        <div className="grid w-full">
          {/* Left Column - Tabs for Assessment Info & Competencies */}
          <div className="lg:col-span-3">
            <Tabs
              aria-label="Tabs Assessment"
              onActiveTabChange={(tab) => setActiveTab(tab)}
              theme={{
                base: " border border-gray-200 rounded-lg bg-white shadow-sm",
                tablist: {
                  base: "gap-0",
                },
                tabitemcontainer: {
                  base: "px-5 pb-3",
                },
                tabItem: {
                  variant: {
                    default: {
                      base: "rounded-t-lg",
                      active: {
                        on: "bg-blue-800 text-primary-600 dark:bg-gray-800 dark:text-primary-500",
                        off: "text-gray-500 hover:bg-gray-50 hover:text-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300",
                      },
                    },
                  },
                },
              }}
            >
              <TabItem title="Laporan Subsatker" tabIndex={0}>
                {assa.length > 0 ? (
                  subsatkerPage
                ) : (
                  <div className="flex flex-col justify-center items-center h-48 text-gray-500">
                    <Building size={32} className="mb-2" />
                    <div>Belum ada data laporan subsatker</div>
                  </div>
                )}
              </TabItem>
              <TabItem title="Laporan Anggota " tabIndex={1}>
                {assa.length > 0 ? (
                  <>
                    <div className={message}>
                      <PageHeader
                        breadcrumbs={[{ label: "", href: "" }]}
                        title="Daftar Anggota "
                      />
                      <LaporanStaffTable userData={forceReRender} />
                    </div>
                    <div className="">{show}</div>
                  </>
                ) : (
                  <div className="flex flex-col justify-center items-center h-48 text-gray-500">
                    <User size={32} className="mb-2" />
                    <div>Belum ada data laporan anggota</div>
                  </div>
                )}
              </TabItem>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LaporanSubsatkerPage;