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
  Card,
} from "flowbite-react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  UserCheck,
  RefreshCw,
  Users,
} from "lucide-react";
import ProfileService from "../../services/ProfileService";
import AuthService from "../../services/AuthService";

const LaporanStaffTable = forwardRef((props, ref) => {
  const [userData, setUserData] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [filteredSupervisors, setFilteredSupervisors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Fungsi refresh supervisor
  const handleRefresh = async () => {
    try {
      const data = await ProfileService.getStaff();
      setSupervisors(data);
      setFilteredSupervisors(data);
      setErrorMessage("");
      setShowErrorModal(false);
    } catch (err) {
      setErrorMessage(err?.message || "Failed to load supervisors");
      setShowErrorModal(true);
    }
  };

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

  // Mobile Card Component
  const MobileCard = ({ sup }) => (
    <Card className="mb-3 p-4">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 dark:text-white text-sm">
              {sup.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              NRP: {sup.nrp}
            </p>
          </div>
          <Button
            size="xs"
            color="blue"
            onClick={() => props.userData(sup.id)}
            className="flex items-center gap-1"
          >
            <Pencil className="w-3 h-3" />
            <span className="hidden sm:inline">Detail</span>
          </Button>
        </div>
      </div>
    </Card>
  );

  // Filter staff by subdirectorat and position
  const filteredStaff = filteredSupervisors.filter(
    (sup) =>
      sup.subdirectorat_id == userData.subdirectorat_id &&
      sup.position_type == "BAWAHAN"
  );

  return (
    <div className="space-y-4 sm:space-y-5 mt-3 sm:mt-5">
      {/* Search Bar - responsive */}
      <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:hidden">
              Cari Anggota
            </label>
            <TextInput
              icon={Search}
              placeholder="Cari berdasarkan nama atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          {/* Mobile: Refresh button */}
          <div className="flex sm:hidden">
            <Button
              size="sm"
              color="gray"
              onClick={handleRefresh}
              className="w-full flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {filteredStaff.length > 0 ? (
              <>
                Menampilkan <span className="font-medium">{filteredStaff.length}</span> anggota
                {searchTerm && (
                  <span className="ml-1">untuk pencarian "{searchTerm}"</span>
                )}
              </>
            ) : (
              <span className="text-gray-500">Tidak ada anggota ditemukan</span>
            )}
          </div>
          
          {/* Desktop: Refresh button */}
          <div className="hidden sm:flex">
            <Button
              size="xs"
              color="gray"
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Content - Mobile Cards or Desktop Table */}
      {isMobile ? (
        // Mobile Card View
        <div className="space-y-3">
          {filteredStaff.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center text-gray-500 dark:text-gray-400 py-8">
                <Users className="w-8 h-8 mb-2 opacity-50" />
                <p>Tidak ada anggota ditemukan</p>
                {searchTerm && (
                  <p className="text-sm text-center mt-1">
                    Coba ubah kriteria pencarian
                  </p>
                )}
              </div>
            </Card>
          ) : (
            filteredStaff.map((sup) => (
              <MobileCard key={sup.id} sup={sup} />
            ))
          )}
        </div>
      ) : (
        // Desktop Table View
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Selected Items Actions */}
          {selectedRows.length > 0 && (
            <div className="flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {selectedRows.length} item(s) dipilih
              </span>
              <Button size="xs" color="red">
                Hapus Yang Dipilih
              </Button>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow className="bg-gray-50 dark:bg-gray-700">
                  <TableHeadCell className="w-full">Nama</TableHeadCell>
                  <TableHeadCell>NRP</TableHeadCell>
                  <TableHeadCell className="w-24">Aksi</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody className="divide-y">
                {filteredStaff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                        <Users className="w-8 h-8 mb-2 opacity-50" />
                        <p>Tidak ada anggota ditemukan</p>
                        {searchTerm && (
                          <p className="text-sm mt-1">
                            Coba ubah kriteria pencarian
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff.map((sup) => (
                    <TableRow
                      key={sup.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <TableCell className="font-medium text-gray-900 dark:text-white">
                        {sup.name}
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {sup.nrp}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="xs"
                          color="blue"
                          onClick={() => props.userData(sup.id)}
                          className="flex items-center gap-1"
                        >
                          <Pencil className="w-3 h-3" />
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Mobile: Bottom spacing */}
      <div className="h-4 sm:h-0"></div>
    </div>
  );
});

export default LaporanStaffTable;