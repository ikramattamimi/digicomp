import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

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

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="sub-direktorat" element={<SubDirectoratePage />} />
          <Route path="kompetensi" element={<CompetencyPage />} />
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
        <Route path="*" element={<NotFoundPage />} />
      </>
    )
  );

  return (
      <RouterProvider router={router} />
  );
}

export default App;