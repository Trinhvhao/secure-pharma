/**
 * API Docs Page — iframe trỏ vào Swagger UI của backend
 *
 * URL backend lấy từ VITE_API_URL (đã cấu hình trong axiosClient.js).
 * Endpoint Swagger: `${VITE_API_URL}/docs`.
 * Trang này KHÔNG fetch dữ liệu — chỉ render iframe fullscreen.
 */
import { useMemo } from 'react';

export default function ApiDocsPage() {
  // Đọc base URL từ env (Vite inject VITE_*); fallback localhost:5000
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const docsUrl = useMemo(() => `${apiBase.replace(/\/$/, '')}/api/docs`, [apiBase]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50">
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Tài liệu API (Swagger)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Danh sách endpoint backend — phát sinh tự động từ JSDoc trong từng file route.
          </p>
        </div>
        <a
          href={docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
        >
          Mở trong tab mới ↗
        </a>
      </div>
      <iframe
        title="Swagger UI"
        src={docsUrl}
        className="flex-1 w-full border-0"
        // Sandbox đủ chặt để iframe không escape ra ngoài
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
}
