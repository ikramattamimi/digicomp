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
      console.log(showComp);
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
        console.log(myResponse);
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
        console.log(mentorResponse);
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

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-m text-blue-700 dark:text-blue-300">
            <strong>Catatan:</strong> Mengelola Perubahan memiliki nilai cukup
            dan harus diperbaiki Lorem Ipsum is simply dummy text of the
            printing and typesetting industry. Lorem Ipsum has been the
            industry's standard dummy text ever since the 1500s, when an unknown
            printer took a galley of type and scrambled it to make a type
            specimen book. It has survived not only five centuries, but also the
            leap into electronic typesetting, remaining essentially unchanged.
          </p>
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

export default BawahanPage;
