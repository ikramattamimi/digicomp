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

  const [assasmentId, setassasmentId] = useState(5); // nilai dari mentor
  const [subsatkerPage, setSubsatkerPage] = useState(); // nilai dari mentor

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

  // Handler to trigger refresh in SubDirektoratTable
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
      console.log(assdetail);
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
      handleChange(dataResponse[0].assessment_id.id);

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
            //console.log(assa);
          }
        }
      });
    };
    fetchUserData();
  }, []);

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

          <Select
            onChange={(e) => handleChange(e.target.value)}
            className="m-4 w-100"
          >
            <option value={-1}>PILIH PENILAIAN</option>
            {assa.map((sub, index) => (
              <option value={index}>{sub.nama}</option>
            ))}
          </Select>

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
                    <LaporanStaffTable userData={forceReRender} />
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
export default LaporanSubsatkerPage;
