/**
 * Sidebar - Menu navigation
 */
import { Link } from 'react-router-dom';
import { Pill } from 'lucide-react';
import { MENU_ITEMS } from '../../utils/constants';

function Sidebar({ isOpen, userRole, currentPath }) {
    // Filter menu items by user role
    const visibleMenu = MENU_ITEMS.filter(item => 
        !item.roles || item.roles.includes(userRole)
    );

    return (
        <aside
            className={`${
                isOpen ? 'w-64' : 'w-0'
            } transition-all duration-300 bg-white shadow-lg flex flex-col overflow-hidden`}
        >
            {/* Logo */}
            <div className="p-4 border-b border-gray-200 flex items-center space-x-2">
                <div className="bg-primary-600 text-white p-2 rounded-lg">
                    <Pill className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-gray-800">SecurePharma</h1>
                    <p className="text-xs text-gray-500">Quản lý dược phẩm</p>
                </div>
            </div>

            {/* Menu */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {visibleMenu.map((item) => {
                    const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
                    return (
                        <Link
                            key={item.key}
                            to={item.path}
                            className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                                isActive
                                    ? 'bg-primary-50 text-primary-700 font-medium'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <span className="text-sm">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
                <p>Phiên bản 1.0.0</p>
                <p className="mt-1">© 2026 SecurePharma</p>
            </div>
        </aside>
    );
}

export default Sidebar;
