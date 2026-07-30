import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { getClinicSlug } from './lib/clinic'
import { ClinicSwitcherPage } from './pages/ClinicSwitcherPage'
import { PatientReportPage } from './pages/PatientReportPage'
import { PatientsPage } from './pages/PatientsPage'
import { TemplateEditorPage } from './pages/TemplateEditorPage'
import { TemplatesPage } from './pages/TemplatesPage'

/** All routes except the clinic switcher require a picked clinic. */
function RequireClinic() {
  if (!getClinicSlug()) return <Navigate to="/" replace />
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<ClinicSwitcherPage />} />
      <Route element={<RequireClinic />}>
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/patients/:id/report" element={<PatientReportPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/templates/:id" element={<TemplateEditorPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
