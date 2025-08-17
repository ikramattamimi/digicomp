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
} from "flowbite-react";
import SubdirectoratService from "../../services/SubdirectoratsService";
import SubDirektoratModal from "./SubDirektoratModal";
import ErrorModal from "./ErrorModal";
import { BarChart } from "@mui/x-charts";
import AuthService from "../../services/AuthService";
import { ASSESSMENT_WEIGHTS } from "../../constants/assessmentConstants";

const SubsatkerPage = forwardRef((props, ref) => {
  const [userData, setUserData] = useState([]);
  const [subDirektorat, setSubDirektorat] = useState([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [kompetensi, setKompetensi] = useState([]); // KOMPETENSI YANG DI NILAI
  const [nilai, setNilai] = useState([]); // NILAI YANG AKAN DITAMPILKAN ROW (PESERTA, MENTOR, RATA-RATA, KUALIFIKASI)

  const [nPeserta, setnPeserta] = useState([8, 6, 3]); // nilai dari peserta
  const [nMentor, setnMentor] = useState([9, 8, 5]); // nilai dari mentor

  const bBawahan = ASSESSMENT_WEIGHTS.SELF; // Bobot bawahan
  const bAtasan = ASSESSMENT_WEIGHTS.SUPERVISOR; // Bobot atasan

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const data = await SubdirectoratService.getAll();
        setSubDirektorat(data);

        const user = await AuthService.checkUser();
        setUserData(user);
      } catch (err) {
        console.error("Failed to fetch supervisors:", err);
        setErrorMessage(err?.message || "Failed to load supervisors");
        setShowErrorModal(true);
      }
    };
    fetchSupervisors();
    // SET KOMPETENSI YANG AKAN DITAMPILKAN
    setKompetensi(["Integeritas", "Kerjasama", "Mengelola Perubahan"]);

    //ADD DATA RATA RATA DARI NILAI MENTOR & PESERTA
    const rataan = {
      from: "Rata Rata per Kompetensi",
      nilai: GetSumKomp(nPeserta, nMentor),
      sum: GetSum(GetSumKomp(nPeserta, nMentor)),
      kualifikasi: GetKualifikasi(GetSum(GetSumKomp(nPeserta, nMentor))),
    };

    //ADD KUALIFIKASI DARI NILAI MENTOR & PESERTA
    const kualifperkomp = {
      from: "Kualifikasi per Kompetensi",
      nilai: GetKualifikasiKomp(nPeserta, nMentor),
      sum: GetKualifikasi(GetSum(GetSumKomp(nPeserta, nMentor))),
    };

    setNilai([rataan, kualifperkomp]);
  }, []);

  // Fungsi get sum per kompetensi
  const GetSumKomp = (nilai1, nilai2) => {
    let total = [];
    for (let i = 0; i < nilai1.length; i++) {
      const nil = nilai1[i] * bBawahan + nilai2[i] * bAtasan;
      total.push(nil);
    }
    return total;
  };

  // Fungsi get kualif per kompetensi
  const GetKualifikasiKomp = (nilai1, nilai2) => {
    let total = [];
    for (let i = 0; i < nilai1.length; i++) {
      const nil = nilai1[i] * bBawahan + nilai2[i] * bAtasan;
      total.push(GetKualifikasi(nil));
    }
    return total;
  };

  // Fungsi get sum
  const GetSum = (nilai) => {
    let total = 0;
    for (let i = 0; i < nilai.length; i++) {
      total = total + nilai[i];
      console.log(total);
    }
    const sumNilai = total / nilai.length;

    return sumNilai;
  };

  // Fungsi get kualif
  const GetKualifikasi = (nilai) => {
    if (nilai >= 0 && nilai < 3) {
      return "Sangat Kurang";
    } else if (nilai >= 3 && nilai < 5) {
      return "Kurang";
    } else if (nilai >= 5 && nilai < 7) {
      return "Cukup";
    } else if (nilai >= 7 && nilai < 9) {
      return "Baik";
    } else if (nilai >= 9 && nilai <= 10) {
      return "Istimewa";
    }
  };

  // Fungsi refresh supervisor
  const handleRefresh = async () => {
    try {
      const data = await SubdirectoratService.getAll();
      setSubDirektorat(data);
      setErrorMessage("");
      setShowErrorModal(false);
    } catch (err) {
      setErrorMessage(err?.message || "Failed to load subdirektorat");
      setShowErrorModal(true);
    }
  };

  // Expose handlers to parent via ref
  useImperativeHandle(ref, () => ({
    handleAdd,
    handleRefresh,
  }));

  const setToSubsatkerName = (id) => {

    const bobObject = subDirektorat.find((obj) => obj.id === id);
    const bobId = bobObject ? bobObject.name : undefined;

    return bobId;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-row w-full">
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg w-full">
          <p className="text-m dark:text-blue-300">
            <strong>Nama Atasan :</strong> {userData.name}
          </p>
          <p className="text-m dark:text-blue-300">
            <strong>NRP :</strong> {userData.nrp}
          </p>
          <p className="text-m dark:text-blue-300">
            <strong>Subsatker :</strong> {setToSubsatkerName(userData.subdirectorat_id)}
          </p>
        </div>
      </div>
      <BarChart
        xAxis={[{ data: kompetensi }]}
        series={[
          { data: GetSumKomp(nPeserta, nMentor), label: "Nilai Rata Rata" },
        ]}
        height={300}
      />
      {/* Table */}
      <div className="table-container">
        <Table>
          <TableHead>
            <TableRow className="bg-gray-50 dark:bg-gray-700">
              <TableHeadCell></TableHeadCell>
              {kompetensi.map((sub) => (
                <TableHeadCell>{sub}</TableHeadCell>
              ))}
              <TableHeadCell>Rata-Rata</TableHeadCell>
              <TableHeadCell>Kualifikasi</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            {nilai.map((sup) => (
              <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <TableCell className="font-medium text-gray-900 dark:text-white">
                  {sup.from}
                </TableCell>

                {sup.nilai.map((sub) => {
                  if (
                    sub < 7 ||
                    sub == "Cukup" ||
                    sub == "Kurang" ||
                    sub == "Sangat Kurang"
                  ) {
                    return (
                      <TableCell className="text-red-600">
                        <strong>{sub}</strong>
                      </TableCell>
                    );
                  }
                  return <TableCell>{sub}</TableCell>;
                })}

                <TableCell>
                  {sup.sum < 7 ? (
                    <strong className="text-red-600">{sup.sum}</strong>
                  ) : (
                    <text>{sup.sum}</text>
                  )}
                </TableCell>
                <TableCell>
                  {sup.sum < 7 ? (
                    <strong className="text-red-600">{sup.kualifikasi}</strong>
                  ) : (
                    <text>{sup.kualifikasi}</text>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-m text-blue-700 dark:text-blue-300">
          <strong>Catatan:</strong> Mengelola Perubahan memiliki nilai cukup dan
          harus diperbaiki Lorem Ipsum is simply dummy text of the printing and
          typesetting industry. Lorem Ipsum has been the industry's standard
          dummy text ever since the 1500s, when an unknown printer took a galley
          of type and scrambled it to make a type specimen book. It has survived
          not only five centuries, but also the leap into electronic
          typesetting, remaining essentially unchanged.
        </p>
      </div>

      {/* Modal for Add/Edit */}
      <ErrorModal
        show={showErrorModal}
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
      />
    </div>
  );
});

export default SubsatkerPage;
