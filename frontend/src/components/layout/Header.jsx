/**
 * Header - Top bar with user info
 */
import { useState, useRef, useEffect } from 'react';
import { Menu, LogOut, User } from 'lucide-react';
import { ROLE_LABELS } from '../../utils/constants';

function Header({ user, onToggleSidebar, onLogout }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            {/* Left: Toggle sidebar */}
            <button
                onClick={onToggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                aria-label="Toggle sidebar"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Right: User info */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-800">
                            {user?.employee?.tenNV || user?.username}
                        </p>
                        <p className="text-xs text-gray-500">
                            {ROLE_LABELS[user?.role] || user?.role}
                        </p>
                    </div>
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center">
                        <User className="w-4 h-4" />
                    </div>
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-800">{user?.username}</p>
                            <p className="text-xs text-gray-500">{ROLE_LABELS[user?.role]}</p>
                        </div>
                        <button
                            onClick={onLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;
