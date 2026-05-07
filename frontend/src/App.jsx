import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import ProtectedRoute from './auth/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import WellnessCheckin from './pages/athlete/WellnessCheckin'
import TrainingLoad from './pages/athlete/TrainingLoad'
import BodyMap from './pages/athlete/BodyMap'
import AthleteProfile from './pages/athlete/Profile'
import CoachDashboard from './pages/coach/Dashboard'
import AthleteDetail from './pages/coach/AthleteDetail'
import EHR from './pages/medical/EHR'
import Rehab from './pages/medical/Rehab'
import InjuryAnalysis from './pages/medical/InjuryAnalysis'
import InjuryReport from './pages/medical/InjuryReport'
import AdminSettings from './pages/admin/Settings'
import AthleteManager from './pages/admin/AthleteManager'

export default function App() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={
          user?.role === 'athlete' ? <Navigate to="/athlete/profile" /> :
          user?.role === 'coach' ? <Navigate to="/coach/dashboard" /> :
          user?.role === 'medical' ? <Navigate to="/medical/ehr" /> :
          <Navigate to="/admin/athletes" />
        } />

        <Route path="athlete/profile" element={<ProtectedRoute roles={['athlete']}><AthleteProfile /></ProtectedRoute>} />
        <Route path="athlete/wellness" element={<ProtectedRoute roles={['athlete']}><WellnessCheckin /></ProtectedRoute>} />
        <Route path="athlete/training" element={<ProtectedRoute roles={['athlete']}><TrainingLoad /></ProtectedRoute>} />
        <Route path="athlete/injury" element={<ProtectedRoute roles={['athlete']}><BodyMap /></ProtectedRoute>} />

        <Route path="coach/dashboard" element={<ProtectedRoute roles={['coach', 'admin']}><CoachDashboard /></ProtectedRoute>} />
        <Route path="coach/athlete/:id" element={<ProtectedRoute roles={['coach', 'admin']}><AthleteDetail /></ProtectedRoute>} />

        <Route path="medical/ehr" element={<ProtectedRoute roles={['medical', 'admin']}><EHR /></ProtectedRoute>} />
        <Route path="medical/rehab" element={<ProtectedRoute roles={['medical', 'admin']}><Rehab /></ProtectedRoute>} />
        <Route path="medical/injury-report" element={<ProtectedRoute roles={['medical', 'coach', 'admin']}><InjuryReport /></ProtectedRoute>} />
        <Route path="medical/injury-analysis" element={<ProtectedRoute roles={['medical', 'coach', 'admin']}><InjuryAnalysis /></ProtectedRoute>} />

        <Route path="admin/athletes" element={<ProtectedRoute roles={['admin', 'coach']}><AthleteManager /></ProtectedRoute>} />
        <Route path="admin/settings" element={<ProtectedRoute roles={['admin']}><AdminSettings /></ProtectedRoute>} />
      </Route>
    </Routes>
  )
}
