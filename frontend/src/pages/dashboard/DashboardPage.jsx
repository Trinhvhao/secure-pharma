/**
 * Dashboard Page - Phase 1 Foundation
 * Trang đơn giản để test backend connection
 */
import { useState } from 'react';
import { Activity, Database, Server, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../../services/api';

function DashboardPage() {
    const [apiStatus, setApiStatus] = useState(null); // null | 'loading' | 'success' | 'error'
    const [apiResponse, setApiResponse] = useState(null);
    const [error, setError] = useState(null);

    /**
     * Test connection to backend /api/health
     */
    const testApiConnection = async () => {
        setApiStatus('loading');
        setError(null);
        setApiResponse(null);
        
        try {
            const response = await api.get('/health');
            setApiStatus('success');
            setApiResponse(response.data.data);
        } catch (err) {
            setApiStatus('error');
            setError(err.response?.data?.error?.message || err.message || 'Lỗi kết nối');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="bg-primary-600 text-white p-3 rounded-xl">
                            <Activity className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                SecurePharma
                            </h1>
                            <p className="text-gray-600">
                                Hệ thống quản lý cửa hàng dược phẩm
                            </p>
                        </div>
                    </div>

                    {/* Phase info */}
                    <div className="mt-4 inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        <span>Phase 1 - Project Foundation</span>
                    </div>
                </div>

                {/* Test API Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                        Kiểm tra kết nối Backend
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Click nút bên dưới để gọi <code className="bg-gray-100 px-2 py-1 rounded text-sm">GET /api/health</code>
                    </p>

                    <button
                        onClick={testApiConnection}
                        disabled={apiStatus === 'loading'}
                        className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                        {apiStatus === 'loading' ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Đang kiểm tra...</span>
                            </>
                        ) : (
                            <>
                                <Activity className="w-5 h-5" />
                                <span>Test API Connection</span>
                            </>
                        )}
                    </button>

                    {/* Result */}
                    {apiStatus === 'success' && (
                        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-semibold text-green-800">
                                        Kết nối thành công!
                                    </p>
                                    <div className="mt-2 space-y-1 text-sm text-green-700">
                                        <p>Status: <strong>{apiResponse?.status}</strong></p>
                                        <p>Timestamp: <strong>{apiResponse?.timestamp}</strong></p>
                                        <p>Uptime: <strong>{Math.floor(apiResponse?.uptime || 0)}s</strong></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {apiStatus === 'error' && (
                        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-semibold text-red-800">
                                        Kết nối thất bại!
                                    </p>
                                    <p className="mt-2 text-sm text-red-700">
                                        {error}
                                    </p>
                                    <p className="mt-2 text-xs text-red-600">
                                        Kiểm tra: Backend đã chạy chưa? (port 8080)
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Backend */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center justify-between mb-3">
                            <Server className="w-8 h-8 text-blue-600" />
                            <span className="text-xs text-gray-500">Port 8080</span>
                        </div>
                        <h3 className="font-semibold text-gray-800">Backend API</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Node.js + Express
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                            Health check: /api/health
                        </p>
                    </div>

                    {/* Database */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center justify-between mb-3">
                            <Database className="w-8 h-8 text-purple-600" />
                            <span className="text-xs text-gray-500">SQL Server</span>
                        </div>
                        <h3 className="font-semibold text-gray-800">Database</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            12 bảng đã tạo
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                            SecurePharmaDB
                        </p>
                    </div>

                    {/* Frontend */}
                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex items-center justify-between mb-3">
                            <Activity className="w-8 h-8 text-green-600" />
                            <span className="text-xs text-gray-500">Port 5173</span>
                        </div>
                        <h3 className="font-semibold text-gray-800">Frontend</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            React + Vite
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                            Tailwind CSS
                        </p>
                    </div>
                </div>

                {/* Phase 1 Done Criteria */}
                <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="font-semibold text-gray-800 mb-3">
                        ✅ Phase 1 - Done Criteria
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>Backend có endpoint /api/health hoạt động</span>
                        </li>
                        <li className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>Frontend gọi được /api/health từ axios</span>
                        </li>
                        <li className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>Database SQL Server có 12 bảng + seed data</span>
                        </li>
                        <li className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>CORS, Helmet, XSS middleware đã config</span>
                        </li>
                    </ul>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm font-semibold text-gray-700">
                            🚀 Phase tiếp theo: Phase 2 - Authentication & RBAC
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-500 mt-8">
                    © 2026 SecurePharma. Đồ án An toàn thông tin.
                </p>
            </div>
        </div>
    );
}

export default DashboardPage;
