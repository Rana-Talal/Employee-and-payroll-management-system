import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  ChevronDownIcon,
  UserCircleIcon,
  UserPlusIcon,
  UsersIcon,
  ArrowLeftOnRectangleIcon,
  HomeIcon,
} from "@heroicons/react/20/solid";
import { useAuth } from "../components/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Dropdown() {
  const { username, role, logout } = useAuth();
  const navigate = useNavigate();

  const canCreateUser = ["superadmin", "admin", "hr"];
  const canViewUsers = ["superadmin"];

  const initial = username ? username.charAt(0).toUpperCase() : "A";

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <Menu as="div" className="relative inline-block text-right">
      <div>
        <Menu.Button className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white font-bold text-sm">
            {initial}
          </div>
          {username || "Admin"}
          <ChevronDownIcon className="w-5 h-5 text-gray-400" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 z-10 mt-2 w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none text-right">
          <div className="py-1">

            {/* الرئيسية */}
            <Menu.Item>
              {({ active }) => (
                <Link
                  to="/main"
                  className={`flex justify-between items-center px-4 py-2 text-sm ${
                    active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                  }`}
                >
                  الرئيسية
                  <HomeIcon className="w-4 h-4 text-gray-400" />
                </Link>
              )}
            </Menu.Item>

            {/* الملف الشخصي */}
            <Menu.Item>
              {({ active }) => (
                <Link
                  to="/profile"
                  className={`flex justify-between items-center px-4 py-2 text-sm ${
                    active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                  }`}
                >
                  الملف الشخصي
                  <UserCircleIcon className="w-4 h-4 text-gray-400" />
                </Link>
              )}
            </Menu.Item>

            {/* إنشاء حساب جديد (فقط: superadmin, admin, hr) */}
            {role && canCreateUser.includes(role.toLowerCase()) && (
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to="/register"
                    className={`flex justify-between items-center px-4 py-2 text-sm ${
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                    }`}
                  >
                    انشاء حساب جديد
                    <UserPlusIcon className="w-4 h-4 text-gray-400" />
                  </Link>
                )}
              </Menu.Item>
            )}

            {/* جميع المستخدمين (فقط: superadmin) */}
            {role && canViewUsers.includes(role.toLowerCase()) && (
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to="/users"
                    className={`flex justify-between items-center px-4 py-2 text-sm ${
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                    }`}
                  >
                    جميع المستخدمين
                    <UsersIcon className="w-4 h-4 text-gray-400" />
                  </Link>
                )}
              </Menu.Item>
            )}

            {/* تسجيل خروج */}
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleLogout}
                  className={`w-full text-left flex justify-between items-center px-4 py-2 text-sm text-gray-700 ${
                    active ? "bg-gray-100 text-gray-900" : ""
                  }`}
                >
                  تسجيل خروج
                  <ArrowLeftOnRectangleIcon className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </Menu.Item>

          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}