/**
 * App Router Configuration - PHASE 1 (Foundation)
 * NOTE: AuthProvider, ProtectedRoute, LoginPage (Phase 2) đã code sẵn
 *       nhưng chưa wire vào App. Wire vào khi triển khai Phase 2.
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/dashboard/DashboardPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Phase 1: Chỉ có 1 route đơn giản */}
                <Route path="*" element={<DashboardPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
