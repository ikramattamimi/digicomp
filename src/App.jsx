import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import AdminLayout from "./components/layouts/AdminLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import SubDirektoratPage from "./pages/SubDirektoratPage.jsx";
import KompetensiPage from "./pages/KompetensiPage.jsx";
import IndikatorPage from "./pages/IndikatorPage.jsx";
import AtasanPage from "./pages/AtasanPage.jsx";
import BawahanPage from "./pages/BawahanPage.jsx";
import PenilaianPage from "./pages/PenilaianPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="sub-direktorat" element={<SubDirektoratPage />} />
          <Route path="kompetensi" element={<KompetensiPage />} />
          <Route path="indikator" element={<IndikatorPage />} />
          <Route path="staff/atasan" element={<AtasanPage />} />
          <Route path="staff/bawahan" element={<BawahanPage />} />
          <Route path="penilaian" element={<PenilaianPage />} />
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