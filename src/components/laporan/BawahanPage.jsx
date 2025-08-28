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
import ErrorModal from "./ErrorModal";
import { BarChart } from "@mui/x-charts";

import AuthService from "../../services/AuthService";
import ProfileService from "../../services/ProfileService";
import AssessmentResponseService from "../../services/AssessmentResponseService";
import PageHeader from "../common/PageHeader";

const BawahanPage = forwardRef((props, ref) => {
  const [userData, setUserData] = useState([]);
  const [mentor, setMentor] = useState([]);
  const [subDirektorat, setSubDirektorat] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [dataResponse, setdataResponse] = useState([]); // nilai dari mentor

  const bBawahan = props.sw;
  const bAtasan = props.aw;

  const showComp = [];
  const showNPeserta = [];
  const showNMentor = [];

  const [showRec, setShowRec] = useState(); // nilai dari mentor
  const [showGrap, setShowGrap] = useState(); // nilai dari mentor

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  setTimeout(function () {
    if (props.cntId.length < 100) {
      props.cntId.push(0);
      setShowRec(rechtml);
      setShowGrap(graphtml);
    }
  }, 100);

  const getColorbyValue = (value) => {
    if (
      value < 3.5 ||
      value == "Belum Memadai" ||
      value == "Perlu Penguatan" ||
      value == "Cukup‎"
    ) {
      return "text-red-600 bg-red-300";
    } else {
      return "text-black";
    }
  };

  const rechtml = () => {
    const kompetensiData = {
      1: { name: "Integritas", clas: 1 },
      2: { name: "Komitmen Terhadap Organisasi", clas: 1 },
      3: { name: "Orientasi Pada Pelayanan", clas: 2 },
      4: { name: "Komunikasi", clas: 2 },
      5: { name: "Perekat Bangsa", clas: 2 },
      6: { name: "Pengambilan Keputusan", clas: 3 },
      7: { name: "Perencanaan Dan Pengorganisasian", clas: 3 },
      8: { name: "Kepemimpinan", clas: 4 },
      9: { name: "Kerja Sama", clas: 4 },
      10: { name: "Pengawasan", clas: 4 },
      11: { name: "Mengelola Perubahan", clas: 5 },
    };

    const bobId = (
      <div>
        {showRow.map((sup) => {
          let claster = [];
          return sup.nilai.map((sub, index) => {
            const editorUser = Object.entries(kompetensiData).find(
              ([key, value]) => value.name === showComp[index]
            );

            if (editorUser) {
              const clasKomp = editorUser[1].clas;

              if (claster.includes(clasKomp)) {
              } else {
                if (
                  sub == "Belum Memadai" ||
                  sub == "Perlu Penguatan" ||
                  sub == "Cukup‎"
                ) {
                  claster.push(clasKomp);
                  return (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm md:text-m text-blue-700 dark:text-blue-300">
                        {getSaran(showComp[index])}
                      </p>
                    </div>
                  );
                }
              }
            }
          });
        })}
      </div>
    );
    return bobId;
  };

  const graphtml = () => {
    let color = [];
    for (let i = 0; i < GetSumKomp(showNPeserta, showNMentor).length; i++) {
      if (GetSumKomp(showNPeserta, showNMentor)[i] < 3.5) {
        color.push("red");
      } else {
        color.push("blue");
      }
    }
    const bobId = (
      <BarChart
        skipAnimation={true}
        xAxis={[
          {
            data: showComp,
            colorMap: {
              type: "ordinal",
              colors: color,
            },
          },
        ]}
        series={[
          {
            data: GetSumKomp(showNPeserta, showNMentor),
            label: "Nilai Rata Rata",
          },
        ]}
        height={isMobile ? 200 : 300}
        margin={isMobile ? { left: 40, right: 10, top: 20, bottom: 60 } : undefined}
      />
    );

    return bobId;
  };

  const getSaran = (kompetensi) => {
    if (
      kompetensi == "Integritas" ||
      kompetensi == "Komitmen terhadap Organisasi"
    ) {
      return (
        <div>
          <strong>Kompetensi Integritas / Komitmen terhadap Organisasi</strong>{" "}
          memiliki nilai{" "}
          <strong className="text-red-700">kurang dari 3.5</strong>
          <div className="ml-1">
            <p>Saran Penguatan</p>
            <p className="ml-2">
              <div>
                • Pelatihan Etika Tugas dan Loyalitas dalam Pengamanan Objek
                Vital
              </div>
              <div>
                • Pelatihan Tanggung Jawab Pribadi dan Keteladanan dalam Tugas
              </div>
            </p>
          </div>
        </div>
      );
    } else if (
      kompetensi == "Orientasi Pada Pelayanan" ||
      kompetensi == "Komunikasi" ||
      kompetensi == "Perekat Bangsa"
    ) {
      return (
        <div>
          <strong>
            Kompetensi Orientasi Pada Pelayanan / Komunikasi Dan Perekat Bangsa
          </strong>{" "}
          memiliki nilai{" "}
          <strong className="text-red-700">kurang dari 3.5</strong>
          <div className="ml-1">
            <p>Saran Penguatan</p>
            <p className="ml-2">
              <div>
                • Pelatihan Layanan Prima dan Komunikasi Positif di Titik
                Pengamanan
              </div>
              <div>
                • Pelatihan Interaksi Inklusif dan Toleransi di Lingkungan Obvit
              </div>
            </p>
          </div>
        </div>
      );
    } else if (
      kompetensi == "Pengambilan Keputusan" ||
      kompetensi == "Perencanaan Dan Pengorganisasian"
    ) {
      return (
        <div>
          <strong>
            Kompetensi Pengambilan Keputusan / Perencanaan Dan Pengorganisasian
          </strong>
          memiliki nilai{" "}
          <strong className="text-red-700">kurang dari 3.5</strong>
          <div className="ml-1">
            <p>Saran Penguatan</p>
            <p className="ml-2">
              <div>• Pelatihan Pengambilan Keputusan Cepat di Lapangan</div>
              <div>• Pelatihan Penyusunan Rencana Tugas Sederhana</div>
            </p>
          </div>
        </div>
      );
    } else if (
      kompetensi == "Kepemimpinan" ||
      kompetensi == "Kerja Sama" ||
      kompetensi == "Pengawasan"
    ) {
      return (
        <div>
          <strong>Kompetensi Kepemimpinan / Kerja Sama / Pengawasan</strong>
          memiliki nilai{" "}
          <strong className="text-red-700">kurang dari 3.5</strong>
          <div className="ml-1">
            <p>Saran Penguatan</p>
            <p className="ml-2">
              <div>• Pelatihan Kepemimpinan Lapangan dan Supervisi Efektif</div>
              <div>• Pelatihan Kolaborasi Taktis dalam Situasi Obvit</div>
            </p>
          </div>
        </div>
      );
    } else if (kompetensi == "Mengelola Perubahan") {
      return (
        <div>
          <strong>Kompetensi Mengelola Perubahan</strong>
          memiliki nilai{" "}
          <strong className="text-red-700">kurang dari 3.5</strong>
          <div className="ml-1">
            <p>Saran Penguatan</p>
            <p className="ml-2">
              <div>• Pelatihan Adaptasi Operasional di Situasi Krisis</div>
              <div>
                • Pelatihan Perubahan Sosial dan Teknologi di Lingkup Obvit
              </div>
            </p>
          </div>
        </div>
      );
    }
  };

  var showRow = [];

  useEffect(() => {
    const fetchSupervisors = async () => {
      const data = await SubdirectoratService.getAll();
      setSubDirektorat(data);

      const user = await AuthService.checkUser();
      setUserData(user);

      const dataResponse = await AssessmentResponseService.getKompetensi(
        user.id,
        props.assasmentId
      );
      setdataResponse(dataResponse);

      const mentorID = await AssessmentResponseService.getMentorId(
        user.id,
        props.assasmentId
      );
      const dataMentor = await ProfileService.getMyAccount(
        mentorID[0].assessor_profile_id
      );
      setMentor(dataMentor);
    };
    fetchSupervisors();
  }, []);

  // Fungsi get sum per kompetensi
  const GetSumKomp = (nilai1, nilai2) => {
    let total = [];
    for (let i = 0; i < nilai1.length; i++) {
      const nil = nilai1[i] * bBawahan + nilai2[i] * bAtasan;
      total.push(parseFloat(nil.toFixed(2)));
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
    }
    const sumNilai = total / nilai.length;
    return parseFloat(sumNilai.toFixed(2));
  };

  // Fungsi get kualif
  const GetKualifikasi = (nilai) => {
    if (nilai >= 0 && nilai < 2) {
      return "Belum Memadai";
    } else if (nilai >= 2 && nilai < 3) {
      return "Perlu Penguatan";
    } else if (nilai >= 3 && nilai < 3.5) {
      return "Cukup‎";
    } else if (nilai >= 3.5 && nilai < 4) {
      return "Cukup";
    } else if (nilai >= 4 && nilai < 5) {
      return "Baik";
    } else if (nilai >= 5) {
      return "Baik Sekali";
    }
  };

  const setToSubsatkerName = (id) => {
    const bobObject = subDirektorat.find((obj) => obj.id === id);
    const bobId = bobObject ? bobObject.name : undefined;

    return bobId;
  };

  let myResponse = [];
  let mentorResponse = [];

  dataResponse.map((sup) => {
    if (showComp.includes(sup.indicator_id.competency_id.name)) {
    } else {
      showComp.push(sup.indicator_id.competency_id.name);
    }
  });

  if (dataResponse.length > 0) {
    dataResponse.map((sup) => {
      const namaKompt = sup.indicator_id.competency_id.name;

      if (
        sup.subject_profile_id == userData.id &&
        sup.assessor_profile_id == userData.id
      ) {
        const indexByName = showComp.indexOf(namaKompt);

        if (myResponse[indexByName] == null) {
          myResponse[indexByName] = {
            nama: namaKompt,
            nilai: [sup.response_value],
          };
        } else {
          myResponse[indexByName].nilai.push(sup.response_value);
        }
      } else if (
        sup.subject_profile_id == userData.id &&
        sup.assessor_profile_id != userData.id
      ) {
        const indexByName = showComp.indexOf(namaKompt);

        if (mentorResponse[indexByName] == null) {
          mentorResponse[indexByName] = {
            nama: namaKompt,
            nilai: [sup.response_value],
          };
        } else {
          mentorResponse[indexByName].nilai.push(sup.response_value);
        }
      }
    });
  }

  if (myResponse.length > 0 && mentorResponse.length > 0) {
    mentorResponse.map((sup) => {
      showNMentor.push(GetSum(sup.nilai));
    });

    myResponse.map((sup) => {
      showNPeserta.push(GetSum(sup.nilai));
    });
  }

  if (showNMentor.length > 0 && showNPeserta.length > 0) {
    //ADD DATA DARI NILAI PESETA
    const peserta = {
      from: "Bawahan",
      nilai: showNPeserta,
      sum: GetSum(showNPeserta),
      kualifikasi: GetKualifikasi(GetSum(showNPeserta)),
    };
    //ADD DATA DARI NILAI MENTOR
    const mentor = {
      from: "Atasan",
      nilai: showNMentor,
      sum: GetSum(showNMentor),
      kualifikasi: GetKualifikasi(GetSum(showNMentor)),
    };
    //RATA- RATA
    const rataan = {
      from: "Rata Rata per Kompetensi",
      nilai: GetSumKomp(showNPeserta, showNMentor),
      sum: GetSum(GetSumKomp(showNPeserta, showNMentor)),
      kualifikasi: GetKualifikasi(
        GetSum(GetSumKomp(showNPeserta, showNMentor))
      ),
    };
    //ADD KUALIFIKASI DARI NILAI MENTOR & PESERTA
    const kualifperkomp = {
      from: "Kualifikasi per Kompetensi",
      nilai: GetKualifikasiKomp(showNPeserta, showNMentor),
      sum: GetKualifikasi(GetSum(GetSumKomp(showNPeserta, showNMentor))),
    };

    showRow = [peserta, mentor, rataan, kualifperkomp];
  }

  // Mobile Card Component for Table Data
  const MobileCard = ({ data }) => (
    <div className="bg-white border rounded-lg shadow-sm mb-4 p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
        {data.from}
      </h3>
      <div className="space-y-2">
        {data.nilai.map((nilai, index) => (
          <div key={index} className="flex justify-between items-center py-1 border-b last:border-b-0">
            <span className="text-xs text-gray-600 dark:text-gray-400 flex-1 mr-2">
              {showComp[index]}
            </span>
            <span className={`font-medium text-xs px-2 py-1 rounded ${getColorbyValue(nilai)}`}>
              {nilai}
            </span>
          </div>
        ))}
        <div className="flex justify-between items-center pt-2 mt-2 border-t font-semibold">
          <span className="text-xs">Rata-Rata:</span>
          <span className={`text-xs px-2 py-1 rounded ${getColorbyValue(data.sum)}`}>
            {data.sum}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs">Kualifikasi:</span>
          <span className={`text-xs px-2 py-1 rounded ${getColorbyValue(data.kualifikasi)}`}>
            {data.kualifikasi}
          </span>
        </div>
      </div>
    </div>
  );

  // Mobile Card Component for Table Data - Grouped by Competency
  const MobileCompetencyCard = ({ competencyIndex }) => {
    const competencyName = showComp[competencyIndex];
    
    return (
      <div className="bg-white border rounded-lg shadow-sm mb-4 p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm border-b pb-2">
          {competencyName}
        </h3>
        <div className="space-y-2">
          {showRow.map((row, rowIndex) => {
            const nilai = row.nilai[competencyIndex];
            return (
              <div key={rowIndex} className="flex justify-between items-center py-1">
                <span className="text-xs text-gray-600 dark:text-gray-400 flex-1 mr-2">
                  {row.from}
                </span>
                <span className={`font-medium text-xs px-2 py-1 rounded ${getColorbyValue(nilai)}`}>
                  {nilai}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Summary Card for Mobile
  const MobileSummaryCard = () => (
    <div className="bg-blue-50 dark:bg-blue-900/20 border rounded-lg shadow-sm mb-4 p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm border-b pb-2">
        Ringkasan Penilaian
      </h3>
      <div className="space-y-2">
        {showRow.map((row, rowIndex) => (
          <div key={rowIndex} className="space-y-1">
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-gray-600 dark:text-gray-400 flex-1 mr-2">
                {row.from} - Rata-rata
              </span>
              <span className={`font-medium text-xs px-2 py-1 rounded ${getColorbyValue(row.sum)}`}>
                {row.sum}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b last:border-b-0 pb-2">
              <span className="text-xs text-gray-600 dark:text-gray-400 flex-1 mr-2">
                {row.from} - Kualifikasi
              </span>
              <span className={`font-medium text-xs px-2 py-1 rounded ${getColorbyValue(row.kualifikasi)}`}>
                {row.kualifikasi}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white p-3 md:p-5 rounded-lg shadow-lg">
      <PageHeader
        breadcrumbs={[{ label: "", href: "" }]}
        title="Hasil Penilaian Individu "
      />
      <div className="space-y-5">
        {/* Info Cards */}
        <div className="flex flex-col md:flex-row w-full gap-4">
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg w-full">
            <p className="text-xs md:text-sm dark:text-blue-300">
              <strong>Nama Bawahan :</strong> {userData.name}
            </p>
            <p className="text-xs md:text-sm dark:text-blue-300">
              <strong>NRP :</strong> {userData.nrp}
            </p>
            <p className="text-xs md:text-sm dark:text-blue-300">
              <strong>Subsatker :</strong>{" "}
              {setToSubsatkerName(userData.subdirectorat_id)}
            </p>
          </div>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg w-full">
            <p className="text-xs md:text-sm dark:text-blue-300">
              <strong>Nama Atasan :</strong> {mentor.name}
            </p>
            <p className="text-xs md:text-sm dark:text-blue-300">
              <strong>NRP :</strong> {mentor.nrp}
            </p>
            <p className="text-xs md:text-sm dark:text-blue-300">
              <strong>Subsatker :</strong>{" "}
              {setToSubsatkerName(mentor.subdirectorat_id)}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="w-full overflow-x-auto">
          {showGrap}
        </div>

        {/* Table/Cards */}
        {isMobile ? (
          // Mobile View - Cards grouped by competency
          <div className="space-y-4">
            {/* Summary Card First */}
            {/* <MobileSummaryCard /> */}
            
            {/* Individual Competency Cards */}
            <div className="border-t pt-4">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">
                Detail per Kompetensi
              </h2>
              {showComp.map((competency, index) => (
                <MobileCompetencyCard key={index} competencyIndex={index} />
              ))}
            </div>
          </div>
        ) : (
          // Desktop View - Table
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow className="bg-gray-50 dark:bg-gray-700">
                  <TableHeadCell className="min-w-[150px]"></TableHeadCell>
                  {showComp.map((sub, index) => (
                    <TableHeadCell key={index} className="min-w-[120px]">
                      <div className="text-black text-xs break-words">{sub}</div>
                    </TableHeadCell>
                  ))}
                  <TableHeadCell className="text-black min-w-[100px]">Rata-Rata</TableHeadCell>
                  <TableHeadCell className="text-black min-w-[120px]">Kualifikasi</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody className="divide-y">
                {showRow.map((sup, index) => (
                  <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <TableCell className="font-medium text-black dark:text-white text-sm">
                      <strong>{sup.from}</strong>
                    </TableCell>
                    {sup.nilai.map((sub, subIndex) => (
                      <TableCell key={subIndex} className={`text-sm ${getColorbyValue(sub)}`}>
                        <strong>{sub}</strong>
                      </TableCell>
                    ))}
                    <TableCell className={`text-sm ${getColorbyValue(sup.sum)}`}>
                      <strong>{sup.sum}</strong>
                    </TableCell>
                    <TableCell className={`text-sm ${getColorbyValue(sup.kualifikasi)}`}>
                      <strong>{sup.kualifikasi}</strong>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Recommendations */}
        <div>{showRec}</div>

        {/* Modal for Add/Edit */}
        <ErrorModal
          show={showErrorModal}
          message={errorMessage}
          onClose={() => setShowErrorModal(false)}
        />
      </div>
    </div>
  );
});

export default BawahanPage;