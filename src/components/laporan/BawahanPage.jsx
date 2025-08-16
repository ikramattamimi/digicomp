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

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [dataResponse, setdataResponse] = useState([]); // nilai dari mentor

  const bBawahan = 0.3;
  const bAtasan = 0.7;

  const showComp = [];
  const showNPeserta = [];
  const showNMentor = [];

  const [showRec, setShowRec] = useState(); // nilai dari mentor

  setTimeout(function () {
    if (props.cntId.length < 100) {
      props.cntId.push(0);
      setShowRec(rechtml);
    }
  }, 100);

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
                if (
                  sub == "Cukup" ||
                  sub == "Kurang" ||
                  sub == "Sangat Kurang"
                ) {
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
          memiliki nilai <strong className="text-red-700">kurang dari 7</strong>
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
          memiliki nilai <strong className="text-red-700">kurang dari 7</strong>
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
          memiliki nilai <strong className="text-red-700">kurang dari 7</strong>
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
          memiliki nilai <strong className="text-red-700">kurang dari 7</strong>
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
          memiliki nilai <strong className="text-red-700">kurang dari 7</strong>
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
      //console.log(showComp);
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
        //console.log(myResponse);
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
        //console.log(mentorResponse);
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
      from: "Peserta",
      nilai: showNPeserta,
      sum: GetSum(showNPeserta),
      kualifikasi: GetKualifikasi(GetSum(showNPeserta)),
    };
    //ADD DATA DARI NILAI MENTOR
    const mentor = {
      from: "Mentor",
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

  return (
    <div className="bg-white p-5 rounded-lg shadow-lg">
      <PageHeader
        breadcrumbs={[{ label: "", href: "" }]}
        title="Hasil Penilaian Individu "
      />
      <div className="space-y-5 ">
        <div className="flex flex-row w-full gap-4 ">
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg w-full">
            <p className="text-m dark:text-blue-300">
              <strong>Nama Peserta :</strong> {userData.name}
            </p>
            <p className="text-m dark:text-blue-300">
              <strong>NRP :</strong> {userData.nrp}
            </p>
            <p className="text-m dark:text-blue-300">
              <strong>Subsatker :</strong>{" "}
              {setToSubsatkerName(userData.subdirectorat_id)}
            </p>
          </div>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg w-full">
            <p className="text-m dark:text-blue-300">
              <strong>Nama Mentor :</strong> {mentor.name}
            </p>
            <p className="text-m dark:text-blue-300">
              <strong>NRP :</strong> {mentor.nrp}
            </p>
            <p className="text-m dark:text-blue-300">
              <strong>Subsatker :</strong>{" "}
              {setToSubsatkerName(mentor.subdirectorat_id)}
            </p>
          </div>
        </div>
        <BarChart
          xAxis={[{ data: showComp }]}
          series={[
            {
              data: GetSumKomp(showNPeserta, showNMentor),
              label: "Nilai Rata Rata",
            },
          ]}
          height={300}
        />
        {/* Table */}
        <div className="table-container">
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
                      <strong className="text-red-600">
                        {sup.kualifikasi}
                      </strong>
                    ) : (
                      <text>{sup.kualifikasi}</text>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

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
