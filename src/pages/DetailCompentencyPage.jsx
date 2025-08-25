import React, { useEffect, useRef, useState } from "react";
import { Card } from "flowbite-react";
import StaffHeader from "../components/subDirectorat/Header.jsx";
import IndikatorTable from "../components/indicator/IndikatorTable.jsx";
import { useNavigate, useParams, Link } from "react-router-dom";
import PageHeader from "../components/common/PageHeader.jsx";
import CompetencyService from "../services/CompetencyService.js";
import { Target, Home, Plus, RefreshCw, Award } from "lucide-react";
import {
  Tabs,
  TabItem,
  Select,
  Label,
  TextInput,
  Button,
  Textarea,
} from "flowbite-react";
import AuthService from "../services/AuthService.js";
// ...existing code...
const DetailCompetencyPage = () => {
  const [kompetensi, setKompetensi] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();
  // Ref to access IndikatorTable's handlers
  const indikatorTableRef = useRef();

  useEffect(() => {
    const fetchSubDirectorat = async () => {
      try {
        const data = await CompetencyService.getById(id);
        setKompetensi(data);
        // console.log(data);
      } catch (err) {
        console.error("Failed to fetch kompetensi:", err);
        setErrorMessage(err?.message || "Failed to load kompetensi");
        setShowErrorModal(true);
      }
    };
    fetchSubDirectorat();
  }, []);

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

  const handleModalChange = (updated) => {
    setKompetensi(updated);
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

  const handleSave = async () => {
    try {
      await CompetencyService.update(kompetensi.id, {
        name: kompetensi.name,
        description: kompetensi.description,
        is_active: kompetensi.is_active,
      });
      navigate("/kompetensi/");
    } catch (err) {}
  };

  const handleBack = async () => {
    navigate("/kompetensi/");
  };

  return (
    <div className="page">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/", icon: Home },
            { label: "Kompetensi", href: "/kompetensi", icon: Award },
            { label: "Detail", href: "/kompetensi/detail", icon: Target },
          ]}
          title="Detail Kompetensi"
        />

        {/* Main Form */}
        <form className="my-5 flex flex-row">
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
                <TabItem title="Informasi Kompetensi" tabIndex={0}>
                  <div className="space-y-4">
                    {/* Assessment Name */}
                    <div className="mb-4">
                      <Label htmlFor="name">
                        Nama Kompetensi <span className="text-red-600">*</span>
                      </Label>
                      <TextInput
                        value={kompetensi.name}
                        onChange={(e) =>
                          handleModalChange({
                            ...kompetensi,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <Label htmlFor="description">Deskripsi</Label>
                      <Textarea
                        value={kompetensi.description}
                        onChange={(e) =>
                          handleModalChange({
                            ...kompetensi,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="mb-4">
                      <Label htmlFor="description">Status</Label>
                      <Select
                        id="is_active"
                        className="w-50"
                        value={
                          kompetensi.is_active === false ? "false" : "true"
                        }
                        onChange={(e) =>
                          handleModalChange({
                            ...kompetensi,
                            is_active: e.target.value === "true",
                          })
                        }
                        required
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </Select>
                    </div>
                  </div>
                </TabItem>
                <TabItem title="Sub Dimensi" tabIndex={1}>
                  <PageHeader
                    breadcrumbs={[{ label: "", href: "" }]}
                    title="Daftar Sub Dimensi"
                    customActions={[
                      {
                        type: "button",
                        label: "Refresh",
                        icon: RefreshCw,
                        color: "gray",
                        onClick: handleRefresh,
                      },
                      {
                        type: "button",
                        label: "Tambah Indikator",
                        icon: Plus,
                        color: "blue",
                        onClick: handleAdd,
                      },
                    ]}
                  />
                  <IndikatorTable ref={indikatorTableRef} />
                </TabItem>
              </Tabs>
            </div>
          </div>

          <div className="w-75 mx-4">
            <Card className="bg-white dark:bg-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                Aksi
              </h2>

              <div className="space-y-3">
                <Button
                  color="blue"
                  onClick={handleSave}
                  className="w-full flex items-center justify-center gap-2"
                >
                  Simpan
                </Button>

                <Button
                  type="button"
                  color="gray"
                  onClick={handleBack}
                  className="w-full"
                >
                  Batal
                </Button>
              </div>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
  // import React from "react";
  // import { Card } from "flowbite-react";
  // import IndicatorHeader from "../components/indicator/IndicatorHeader.jsx";
  // import IndikatorTable from "../components/indicator/IndikatorTable.jsx";

  // import AuthService from "../services/AuthService.js";
  // import { useEffect, useState } from "react";

  // const IndicatorPage = () => {

  //   return (
  //     <div className="page">
  //       <div className="max-w-7xl mx-auto">
  //         {/* Header */}
  //         {/* <IndicatorHeader />*/}

  //         {/* Content */}
  //         <Card className="mb-6 bg-white dark:bg-gray-800">
  //           {page == "hidden" ? <div>Not Allowed</div> : <IndikatorTable />}
  //         </Card>
  //       </div>
  //     </div>
  //   );
};
export default DetailCompetencyPage;
