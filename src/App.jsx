import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import { Spinner } from "flowbite-react";

import AdminLayout from "./components/layouts/AdminLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import SubDirectoratePage from "./pages/SubDirectoratePage.jsx";
import CompetencyPage from "./pages/CompetencyPage.jsx";
import IndicatorPage from "./pages/IndicatorPage.jsx";
import StaffPage from "./pages/StaffPage.jsx";
import AssessmentPage from "./pages/AssessmentPage.jsx";
import AssessmentCreatePage from "./pages/AssessmentCreatePage.jsx";
import AssessmentEditPage from "./pages/AssessmentEditPage.jsx";
import AssessmentDetailPage from "./pages/AssessmentDetailPage.jsx";
import AssessmentParticipantPage from "./pages/AssessmentParticipantPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import AccountPage from "./pages/AccountPage.jsx";
import SelfAssessmentFormPage from "./pages/SelfAssessmentFormPage.jsx";
import SupervisorAssessmentFormPage from "./pages/SupervisorAssessmentFormPage.jsx";
import DetailCompetencyPage from "./pages/DetailCompentencyPage.jsx";
import { useEffect, useState } from "react";
import AuthService from "./services/AuthService.js";
import { UserContext } from "./contexts/UserContext.js";
import LoginPage from "./components/layouts/LoginPage.jsx";
import SupervisorAssessmentDetailPage from "./pages/staff/SupervisorAssessmentDetailPage.jsx";

function App() {
  const [authenticatedUser, setAuthenticatedUser] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const loggedUser = await AuthService.checkUser();
        console.log("Authenticated User:", loggedUser);
        setAuthenticatedUser(loggedUser || {});
      } catch (error) {
        console.error("Auth check failed:", error);
        setAuthenticatedUser({});
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  let router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </>
    )
  );

  if (authenticatedUser.position_type === "ADMIN") {
    router = createBrowserRouter(
      createRoutesFromElements(
        <>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="sub-direktorat" element={<SubDirectoratePage />} />
            <Route path="kompetensi" element={<CompetencyPage />} />
            <Route path="kompetensi/detail/:id" element={<DetailCompetencyPage />} />
            <Route path="indikator" element={<IndicatorPage />} />
            <Route path="staff" element={<StaffPage />} />
          
            {/* Assessment Routes */}
            {/* <Route path="assessment" element={<AssessmentPage />} /> */}
            <Route path="penilaian" element={<AssessmentPage />} />
            <Route path="penilaian/create" element={<AssessmentCreatePage />} />
            <Route path="penilaian/:id" element={<AssessmentDetailPage />} />
            <Route path="penilaian/:id/edit" element={<AssessmentEditPage />} />
            <Route path="penilaian/:assessmentId/participants" element={<AssessmentParticipantPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="akun" element={<AccountPage />} />
            <Route path="assessment" element={<AssessmentPage />} />
            {/* New: Assessment forms */}
            <Route path="penilaian/:id/self" element={<SelfAssessmentFormPage />} />
            <Route path="penilaian/:id/supervisor/:subjectId" element={<SupervisorAssessmentFormPage />} />

          </Route>
          <Route path="login" element={<LoginPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </>
      )
    );
  } else if (authenticatedUser.position_type === "ATASAN" || authenticatedUser.position_type === "BAWAHAN") {
    router = createBrowserRouter(
      createRoutesFromElements(
        <>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="penilaian" element={<AssessmentPage />} />
            <Route path="penilaian/:id" element={authenticatedUser.position_type === "BAWAHAN" ? <SelfAssessmentFormPage /> : <SupervisorAssessmentDetailPage />} />
            <Route path="penilaian/:id/self" element={<SelfAssessmentFormPage />} />
            <Route path="penilaian/:id/:subjectId" element={<SupervisorAssessmentFormPage />} />
            <Route path="akun" element={<AccountPage />} />
          </Route>
          <Route path="login" element={<LoginPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </>
      )
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="xl" />
          <div className="mt-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Memuat Aplikasi
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Mohon tunggu sebentar...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={ authenticatedUser }>
      <RouterProvider router={router} />
    </UserContext.Provider>
  );
}

export default App;