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

const SubsatkerPageAdmin = forwardRef((props, ref) => {
  const [userData, setUserData] = useState([]);
  const [mentor, setMentor] = useState([]);
  const [subDirektorat, setSubDirektorat] = useState([]);

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [dataResponse, setdataResponse] = useState([]); // nilai dari mentor

  const bBawahan = props.sw;
  const bAtasan = props.aw;

  const showComp = [];
  const [showGrap, setShowGrap] = useState(); // nilai dari mentor
  const [showTable, setShowTable] = useState(); // nilai dari mentor
  const [showRec, setShowRec] = useState(); // nilai dari mentor

  const all = [];
  var showRow = [];

  let m = [];

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
      //console.log(dataResponse);

      const mentorID = await AssessmentResponseService.getMentorIdasAdmin(
        props.assasmentId
      );
      console.log(mentorID);

      const getMentorData = async (id) => {
        const dataMentor = await ProfileService.getMyAccount(id);
        setMentor(dataMentor);
        console.log(dataMentor);
      };

      mentorID.map((sup) => {
        if (
          sup.assessor_profile_id.subdirectorat_id == props.subsatkerId &&
          sup.assessor_profile_id.id != sup.subject_profile_id
        ) {
          if (m.includes(sup.assessor_profile_id.id)) {
          } else {
            m.push(sup.assessor_profile_id.id);
            console.log(sup.assessor_profile_id.id);

            getMentorData(sup.assessor_profile_id.id);
          }
        }
      });
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
      return "Cukup‎ ";
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
    //console.log(dataResponse);

    dataResponse.map((sup) => {
      if (showComp.includes(sup.indicator_id.competency_id.name)) {
      } else {
        showComp.push(sup.indicator_id.competency_id.name);
        //console.log(showComp);
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
          //console.log(myResponse);
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
          //console.log(mentorResponse);
        }
      });

      if (myResponse.length > 0 && mentorResponse.length > 0) {
        mentorResponse.map((sup) => {
          showNMentor.push(GetSum(sup.nilai));
          //console.log(showNMentor);
        });

        myResponse.map((sup) => {
          showNPeserta.push(GetSum(sup.nilai));
          //console.log(showNPeserta);
        });

        merge(GetSumKomp(showNPeserta, showNMentor));
        all.length = 0;
        allsum.forEach((number) => {
          //console.log(GetSum1(number));
          all.push(GetSum1(number));

          if (
            all.length == showComp.length &&
            showGrap == null &&
            showTable == null
          ) {
            setTimeout(function () {
              if (all) {
                setShowGrap(graphtml);
                setShowTable(tablehtml);
                setShowRec(rechtml);
              }
            }, 100);
          }
        });

        rowHandle();

        //console.log(allsum);
        //console.log(all);
      }
    }
  };

  function rowHandle() {
    //RATA- RATA
    const rataan = {
      from: "Rata Rata per Kompetensi",
      nilai: all,
      sum: GetSum(all),
      kualifikasi: GetKualifikasi(GetSum(all)),
    };
    //ADD KUALIFIKASI DARI NILAI MENTOR & PESERTA
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
      if (sup.subject_profile_id.subdirectorat_id == props.subsatkerId) {
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
      return "";
    }
  };

  const graphtml = () => {
    let color = [];
    for (let i = 0; i < all.length; i++) {
      if (all[i] < 3.5) {
        color.push("red");
        console.log(color);
      } else {
        color.push("blue");
        console.log(color);
      }
    }
    const bobId = (
      <BarChart
        xAxis={[
          {
            data: showComp,
            colorMap: {
              type: "ordinal",
              colors: color, // Colors for values <0, 0-50, 50-100, and >100 respectively
            },
          },
        ]}
        series={[
          {
            data: all,
            label: "Nilai Rata Rata",
          },
        ]}
        height={300}
      />
    );

    return bobId;
  };

  const tablehtml = () => {
    const bobId = (
      <Table>
        <TableHead>
          <TableRow className="bg-gray-50 dark:bg-gray-700">
            <TableHeadCell></TableHeadCell>
            {showComp.map((sub) => (
              <TableHeadCell>{sub}</TableHeadCell>
            ))}
            <TableHeadCell>Rata-Rata</TableHeadCell>
            <TableHeadCell>Kualifikasi</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody className="divide-y">
          {showRow.map((sup) => (
            <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <TableCell className="font-medium text-gray-900 dark:text-white">
                {sup.from}
              </TableCell>
              {sup.nilai.map((sub) => (
                <TableCell className={getColorbyValue(sub)}>
                  <strong>{sub}</strong>
                </TableCell>
              ))}

              <TableCell className={getColorbyValue(sup.sum)}>
                <strong>{sup.sum}</strong>
              </TableCell>
              <TableCell className={getColorbyValue(sup.kualifikasi)}>
                <strong>{sup.kualifikasi}</strong>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
    return bobId;
  };

  const rechtml = () => {
    const kompetensiData = {
      1: { name: "Integritas", clas: 1 },
      2: { name: "Komitmen Terhadap Organisasi", clas: 1 },
      3: { name: "Orientasi Pada Pelayanan", clas: 2 },
      4: { name: "Komunikasi Dan Perekat Bangsa", clas: 2 },
      5: { name: "Pengambilan Keputusan", clas: 3 },
      6: { name: "Perencanaan Dan Pengorganisasian", clas: 3 },
      7: { name: "Kepemimpinan", clas: 4 },
      8: { name: "Kerja Sama", clas: 4 },
      9: { name: "Pengawasan", clas: 4 },
      10: { name: "Mengelola Perubahan", clas: 5 },
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
                claster.push(clasKomp);
                if (sub < 3.5) {
                  return (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-m text-blue-700 dark:text-blue-300">
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
      kompetensi == "Komunikasi Dan Perekat Bangsa"
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

  return (
    <div className="bg-white p-5 rounded-lg shadow-lg">
      <PageHeader
        breadcrumbs={[{ label: "", href: "" }]}
        title="Hasil Penilaian Subsatker "
      />
      <div className="space-y-5 ">
        <div className="flex flex-row w-full gap-4 ">
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg w-full">
            <p className="text-m dark:text-blue-300">
              <strong>Nama Atasan :</strong> {mentor.name}
            </p>
            <p className="text-m dark:text-blue-300">
              <strong>NRP :</strong> {mentor.nrp}
            </p>
            <p className="text-m dark:text-blue-300">
              <strong>Subsatker : </strong>
              {setToSubsatkerName(mentor.subdirectorat_id)}
            </p>
          </div>
        </div>
        {showGrap}
        {/* Table */}
        <div className="table-container">{showTable}</div>

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

export default SubsatkerPageAdmin;
