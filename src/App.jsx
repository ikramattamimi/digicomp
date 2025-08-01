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
import NotFoundPage from "./pages/NotFoundPage.jsx";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="sub-directorate" element={<SubDirectoratePage />} />
          <Route path="competency" element={<CompetencyPage />} />
          <Route path="indicator" element={<IndicatorPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="assessment" element={<AssessmentPage />} />
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