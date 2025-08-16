import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Button,
  TextInput,
  Select,
  Checkbox,
  Tabs,
  TabItem,
} from "flowbite-react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  UserCheck,
  RefreshCw,
} from "lucide-react";
import ProfileService from "../../services/ProfileService";

import AuthService from "../../services/AuthService";

const LaporanStaffTable = forwardRef((props, ref) => {
  const [userData, setUserData] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [filteredSupervisors, setFilteredSupervisors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const user = await AuthService.checkUser();
        setUserData(user);

        const data = await ProfileService.getStaff();
        setSupervisors(data);
        setFilteredSupervisors(data);
      } catch (err) {
        console.error("Failed to fetch supervisors:", err);
        setErrorMessage(err?.message || "Failed to load supervisors");
        setShowErrorModal(true);
      }
    };
    fetchSupervisors();
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = supervisors;

    if (searchTerm) {
      filtered = filtered.filter(
        (sup) =>
          sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sup.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSupervisors(filtered);
  }, [supervisors, searchTerm]);

  return (
    <div className="space-y-5 mt-5">
      {/* Main Form */}
      <form className="my-5 flex flex-row">
        <div className="grid w-full">
          {/* Left Column - Tabs for Assessment Info & Competencies */}
          <div className="lg:col-span-3">
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 rounded-lg mb-4">
              <div className="flex-1">
                <TextInput
                  icon={Search}
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Selected Items Actions */}
            {selectedRows.length > 0 && (
              <div className="flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  {selectedRows.length} item(s) selected
                </span>
                <Button size="xs" color="failure">
                  Delete Selected
                </Button>
              </div>
            )}

            {/* Table */}
            <div className="table-container">
              <Table>
                <TableHead>
                  <TableRow className="bg-gray-50 dark:bg-gray-700">
                    <TableHeadCell>Name</TableHeadCell>
                    <TableHeadCell className="w-full">NRP</TableHeadCell>
                    <TableHeadCell>Actions</TableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody className="divide-y">
                  {filteredSupervisors.map((sup) => {
                    if (
                      sup.subdirectorat_id == props.subsatkerId &&
                      sup.position_type == "BAWAHAN"
                    ) {
                      return (
                        <TableRow
                          key={sup.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <TableCell className="font-medium text-gray-900 dark:text-white">
                            {sup.name}
                          </TableCell>
                          <TableCell>{sup.nrp}</TableCell>

                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="xs"
                                color="blue"
                                onClick={() => props.userData(sup.id)}
                                className="flex items-center gap-1"
                              >
                                <Pencil className="w-3 h-3" />
                                Detail
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    }
                  })}
                </TableBody>
              </Table>

              {filteredSupervisors.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No supervisors found.
                </div>
              )}
            </div>
          </div>
        </div>
      </form>

      <div className="w-full sm:w-48 flex flex-row gap-4 m-5"></div>
    </div>
  );
});

export default LaporanStaffTable;
