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
  Card,
} from "flowbite-react";
import SubdirectoratService from "../../services/SubdirectoratsService";
import ErrorModal from "./ErrorModal";
import { BarChart } from "@mui/x-charts";

import AuthService from "../../services/AuthService";
import ProfileService from "../../services/ProfileService";
import AssessmentResponseService from "../../services/AssessmentResponseService";
import PageHeader from "../common/PageHeader";

const SubsatkerPage = forwardRef((props, ref) => {
  const [userData, setUserData] = useState([]);
  const [mentor, setMentor] = useState([]);
  const [subDirektorat, setSubDirektorat] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [dataResponse, setdataResponse] = useState([]);

  const bBawahan = props.sw;
  const bAtasan = props.aw;

  const showComp = [];
  const [showGrap, setShowGrap] = useState();
  const [showTable, setShowTable] = useState();
  const [showRec, setShowRec] = useState();

  const all = [];
  var showRow = [];

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
      const data = await SubdirectoratService.getAll();
      setSubDirektorat(data);

      const user = await AuthService.checkUser();
      setUserData(user);

      const dataResponse =
        await AssessmentResponseService.getKompetensiSubsatker(
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
  const GetKualifikasiKomp = (nilai1) => {
    let total = [];
    for (let i = 0; i < nilai1.length; i++) {
      total.push(GetKualifikasi(nilai1[i]));
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

  const GetSum1 = (nilai) => {
    let total = 0;
    nilai.forEach((number) => {
      total = total + number;
    });
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

  let myAnggotaID = [];
  let allsum = [];

  const GetRataRataAnggota = async (nilai) => {
    const showNPeserta = [];
    const showNMentor = [];

    const dataResponse = await AssessmentResponseService.getKompetensi(
      nilai,
      props.assasmentId
    );

    dataResponse.map((sup) => {
      if (showComp.includes(sup.indicator_id.competency_id.name)) {
      } else {
        showComp.push(sup.indicator_id.competency_id.name);
      }
    });

    let myResponse = [];
    let mentorResponse = [];

    if (dataResponse.length > 0) {
      dataResponse.map((sup) => {
        const namaKompt = sup.indicator_id.competency_id.name;

        if (
          sup.subject_profile_id == nilai &&
          sup.assessor_profile_id == nilai
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
          sup.subject_profile_id == nilai &&
          sup.assessor_profile_id != nilai
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

      if (myResponse.length > 0 && mentorResponse.length > 0) {
        mentorResponse.map((sup) => {
          showNMentor.push(GetSum(sup.nilai));
        });

        myResponse.map((sup) => {
          showNPeserta.push(GetSum(sup.nilai));
        });

        merge(GetSumKomp(showNPeserta, showNMentor));
        all.length = 0;
        allsum.forEach((number) => {
          all.push(GetSum1(number));

          if (
            all.length == showComp.length &&
            showGrap == null &&
            showTable == null
          ) {
            setTimeout(function () {
              if(all){
                setShowGrap(graphtml);
                setShowTable(tablehtml);
                setShowRec(rechtml);
              }
            }, 100);
          }
        });

        rowHandle();
      }
    }
  };

  function rowHandle() {
    const rataan = {
      from: "Rata Rata per Kompetensi",
      nilai: all,
      sum: GetSum(all),
      kualifikasi: GetKualifikasi(GetSum(all)),
    };
    const kualifperkomp = {
      from: "Kualifikasi per Kompetensi",
      nilai: GetKualifikasiKomp(all),
      sum: GetKualifikasi(GetSum(all)),
    };
    showRow = [rataan, kualifperkomp];
  }

  const merge = (nilai) => {
    for (let i = 0; i < nilai.length; i++) {
      if (allsum[i] == undefined) {
        allsum[i] = [nilai[i]];
      } else {
        allsum[i].push(nilai[i]);
      }
    }
  };

  if (dataResponse.length > 0) {
    dataResponse.map((sup) => {
      if (
        sup.subject_profile_id.subdirectorat_id == userData.subdirectorat_id
      ) {
        if (myAnggotaID.includes(sup.subject_profile_id.id)) {
        } else {
          myAnggotaID.push(sup.subject_profile_id.id);
          GetRataRataAnggota(sup.subject_profile_id.id);
        }
      }
    });
  }

  const setToSubsatkerName = (id) => {
    const bobObject = subDirektorat.find((obj) => obj.id === id);
    const bobId = bobObject ? bobObject.name : undefined;
    return bobId;
  };

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

  const graphtml = () => {
    let color = [];
    for (let i = 0; i < all.length; i++) {
      if (all[i] < 3.5) {
        color.push("red");
      } else {
        color.push("blue");
      }
    }
    const bobId = (
      <BarChart
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
            data: all,
            label: "Nilai Rata Rata",
          },
        ]}
        height={isMobile ? 250 : 300}
        margin={isMobile ? { left: 30, right: 10, top: 20, bottom: 80 } : undefined}
      />
    );
    return bobId;
  };

  const tablehtml = () => {
    // Mobile Card Component for Table Data
    const MobileCard = ({ data }) => (
      <Card className="mb-4 p-4">
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
      </Card>
    );

    if (isMobile) {
      return (
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">
            Detail Penilaian
          </h2>
          {showRow.map((data, index) => (
            <MobileCard key={index} data={data} />
          ))}
        </div>
      );
    }

    // Desktop Table
    const bobId = (
      <div className="overflow-x-auto">
        <Table>
          <TableHead>
            <TableRow className="bg-gray-50 dark:bg-gray-700">
              <TableHeadCell className="min-w-[150px]"></TableHeadCell>
              {showComp.map((sub, index) => (
                <TableHeadCell key={index} className="text-black min-w-[120px]">
                  <div className="text-xs break-words">{sub}</div>
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
    );
    return bobId;
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
      <div className="space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm sm:text-base">
          Saran Perbaikan
        </h2>
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
                if (sub < 3.5) {
                  claster.push(clasKomp);
                  return (
                    <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                        {getSaran(showComp[index])}
                      </div>
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
          <div className="ml-1 mt-2">
            <p className="font-medium">Saran Penguatan:</p>
            <ul className="ml-2 mt-1 space-y-1">
              <li>• Pelatihan Etika Tugas dan Loyalitas dalam Pengamanan Objek Vital</li>
              <li>• Pelatihan Tanggung Jawab Pribadi dan Keteladanan dalam Tugas</li>
            </ul>
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
          <div className="ml-1 mt-2">
            <p className="font-medium">Saran Penguatan:</p>
            <ul className="ml-2 mt-1 space-y-1">
              <li>• Pelatihan Layanan Prima dan Komunikasi Positif di Titik Pengamanan</li>
              <li>• Pelatihan Interaksi Inklusif dan Toleransi di Lingkungan Obvit</li>
            </ul>
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
          <div className="ml-1 mt-2">
            <p className="font-medium">Saran Penguatan:</p>
            <ul className="ml-2 mt-1 space-y-1">
              <li>• Pelatihan Pengambilan Keputusan Cepat di Lapangan</li>
              <li>• Pelatihan Penyusunan Rencana Tugas Sederhana</li>
            </ul>
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
          <div className="ml-1 mt-2">
            <p className="font-medium">Saran Penguatan:</p>
            <ul className="ml-2 mt-1 space-y-1">
              <li>• Pelatihan Kepemimpinan Lapangan dan Supervisi Efektif</li>
              <li>• Pelatihan Kolaborasi Taktis dalam Situasi Obvit</li>
            </ul>
          </div>
        </div>
      );
    } else if (kompetensi == "Mengelola Perubahan") {
      return (
        <div>
          <strong>Kompetensi Mengelola Perubahan</strong>
          memiliki nilai{" "}
          <strong className="text-red-700">kurang dari 3.5</strong>
          <div className="ml-1 mt-2">
            <p className="font-medium">Saran Penguatan:</p>
            <ul className="ml-2 mt-1 space-y-1">
              <li>• Pelatihan Adaptasi Operasional di Situasi Krisis</li>
              <li>• Pelatihan Perubahan Sosial dan Teknologi di Lingkup Obvit</li>
            </ul>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-5 rounded-lg shadow-lg">
      <div className="mb-4 sm:mb-6">
        <PageHeader
          breadcrumbs={[{ label: "", href: "" }]}
          title="Hasil Penilaian Subsatker"
        />
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Info Card - responsive */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="grid grid-cols-1 gap-3 text-xs sm:text-sm">
            <div>
              <span className="font-medium text-blue-800 dark:text-blue-200">Nama Atasan:</span>
              <span className="ml-2 text-blue-700 dark:text-blue-300">{userData.name}</span>
            </div>
            <div>
              <span className="font-medium text-blue-800 dark:text-blue-200">NRP:</span>
              <span className="ml-2 text-blue-700 dark:text-blue-300">{userData.nrp}</span>
            </div>
            <div>
              <span className="font-medium text-blue-800 dark:text-blue-200">Subsatker:</span>
              <span className="ml-2 text-blue-700 dark:text-blue-300">
                {setToSubsatkerName(userData.subdirectorat_id)}
              </span>
            </div>
          </div>
        </Card>

        {/* Chart - responsive */}
        <div className="w-full overflow-x-auto">
          {showGrap}
        </div>

        {/* Table/Cards - responsive */}
        <div>
          {showTable}
        </div>

        {/* Recommendations - responsive */}
        <div>
          {showRec}
        </div>

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

export default SubsatkerPage;