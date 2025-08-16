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

import SubsatkerPageAdmin from "../components/laporan/SubsatkerPageAdmin.jsx";
import LaporanStaffTableAdmin from "../components/laporan/LaporanStaffTableAdmin.jsx";
import LaporanAnggotaPage from "../components/laporan/LaporanAnggotaPage.jsx";
import AssessmentResponseService from "../services/AssessmentResponseService.js";
import SubdirectoratsService from "../services/SubdirectoratsService.js";
// ...existing code...
const LaporanSubsatkerPageAdmin = () => {
  // Ref to access SubDirektoratTable's handlers
  const subDirektoratTableRef = useRef();
  const [show, setShow] = useState();
  const [message, setMessage] = useState("0");

  const [assasmentId, setassasmentId] = useState(5); // nilai dari mentor
  const [subsatkerPage, setSubsatkerPage] = useState(); // nilai dari mentor

  const [subsatkers, setSubsatkers] = useState([]); // nilai dari mentor
  const [selsubsatker, setselSubsatkers] = useState(); // nilai dari mentor

  const [page, setPage] = useState("hidden");
  let showComp = [];
  const [assa, setassa] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const checkUser = await AuthService.checkUser();
      if (checkUser.position_type == "ADMIN") {
        setPage("show");
      }

      const subsatkerData = await SubdirectoratsService.getAll();
      setSubsatkers(subsatkerData);

      const dataResponse = await AssessmentResponseService.getAssesment();

      dataResponse.map((sup) => {
        if (sup.subject_profile_id.subdirectorat_id == subsatkers[0].id) {
          if (showComp.includes(sup.assessment_id.id)) {
          } else {
            showComp.push(sup.assessment_id.id);
            setassa((prevArray1) => [
              ...prevArray1,
              { id: sup.assessment_id.id, nama: sup.assessment_id.name },
            ]);
            console.log(assa);
          }
        }
      });
    };
    fetchUserData();
  }, []);

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

  const handleChange = (assaid) => {
    setassasmentId(assaid)
    forceReRender2()
    if (subsatkerPage == null && assaid != 0) {
      setSubsatkerPage(
        <SubsatkerPageAdmin assasmentId={assaid} subsatkerId={selsubsatker} />
      );
    } else if (subsatkerPage != null && assaid != 0) {
      setSubsatkerPage(<div></div>);
      setTimeout(function () {
        setSubsatkerPage(
          <SubsatkerPageAdmin assasmentId={assaid} subsatkerId={selsubsatker} />
        );
      }, 100);
    } else{
      setSubsatkerPage(<strong>Pilih penilaian untuk ditampilkan</strong>);
    }
  };

  const handleChangeSubsatker = (subsatid) => {
    setassa([]);
    setselSubsatkers(subsatid);
    fetchSubsatkerAssasment(subsatid);

    handleChange(0);
    setSubsatkerPage(<strong>Pilih penilaian untuk ditampilkan</strong>);
  };

  //fetch assa
  const fetchSubsatkerAssasment = async (subsatkerId) => {
    const dataResponse = await AssessmentResponseService.getAssesment();
    dataResponse.map((sup) => {
      if (sup.subject_profile_id.subdirectorat_id == subsatkerId) {
        if (showComp.includes(sup.assessment_id.id)) {
        } else {
          showComp.push(sup.assessment_id.id);
          setassa((prevArray1) => [
            ...prevArray1,
            { id: sup.assessment_id.id, nama: sup.assessment_id.name },
          ]);
          console.log(assa);
        }
      }
    });
  };

  if (page == "hidden") {
    return (
      <div className={" page"}>
        <div className="max-w-7xl mx-auto">
          <Card className="mb-6 bg-white dark:bg-gray-800">
            <div>Not Allowed</div>
          </Card>
        </div>
      </div>
    );
  } else {
    return (
      <div className={"page " + page}>
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

          <div className="flex flex-row gap-2 mt-4 ml-4">
            <div className="mb-2 block">
              <Label htmlFor="name">Subsatker</Label>
              <Select
                onChange={(e) => handleChangeSubsatker(e.target.value)}
                className="my-1 w-50"
              >
                {subsatkers.map((sub) => (
                  <option value={sub.id}>{sub.name}</option>
                ))}
              </Select>
            </div>

            <div className="mb-2 block">
              <Label htmlFor="name">Penilaian</Label>
              <Select
                onChange={(e) => handleChange(e.target.value)}
                className="my-1 w-100"
              >
                <option value={0}><strong>PILIH PENILAIAN</strong></option>
                {assa.map((sub) => (
                  <option value={sub.id}>{sub.nama}</option>
                ))}
              </Select>
            </div>
          </div>

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
                  // tabpanel: "p-0"
                }}
              >
                <TabItem title="Laporan Subsatker" tabIndex={0}>
                  {subsatkerPage}
                </TabItem>
                <TabItem title="Laporan Anggota " tabIndex={1}>
                  <div className={message}>
                    <PageHeader
                      breadcrumbs={[{ label: "", href: "" }]}
                      title="Daftar Anggota "
                    />
                    <LaporanStaffTableAdmin
                      userData={forceReRender}
                      subsatkerId={selsubsatker}
                    />
                  </div>

                  <div className="">{show}</div>
                </TabItem>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    );
  }
};
export default LaporanSubsatkerPageAdmin;
