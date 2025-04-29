import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import {
  BookOpenIcon,
  PlusIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

const navItems = [
  { name: "Receitas", path: "/recipes", icon: BookOpenIcon },
  { name: "Nova Receita", path: "/new-recipe", icon: PlusIcon },
];

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-lg sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-indigo-600">
                Receitas da Joana
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-300 ${
                      isActive
                        ? "text-indigo-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    onMouseEnter={() => setIsHovered(item.path)}
                    onMouseLeave={() => setIsHovered(null)}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {item.name}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                        initial={false}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                    {isHovered === item.path && !isActive && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        exit={{ scaleX: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {currentUser ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {currentUser.email}
                  </span>
                </div>
                <motion.button
                  onClick={handleLogout}
                  className="group relative px-4 py-2 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform translate-x-0 -skew-x-12 group-hover:translate-x-full group-hover:skew-x-12 bg-gradient-to-r from-purple-600 to-indigo-600"></span>
                  <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform -translate-x-full skew-x-12 group-hover:translate-x-0 group-hover:skew-x-12 bg-gradient-to-r from-indigo-600 to-purple-600"></span>
                  <span className="relative flex items-center justify-center">
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                    Sair
                  </span>
                </motion.button>
              </motion.div>
            ) : (
              <Link
                to="/login"
                className="group relative px-4 py-2 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform translate-x-0 -skew-x-12 group-hover:translate-x-full group-hover:skew-x-12 bg-gradient-to-r from-purple-600 to-indigo-600"></span>
                <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform -translate-x-full skew-x-12 group-hover:translate-x-0 group-hover:skew-x-12 bg-gradient-to-r from-indigo-600 to-purple-600"></span>
                <span className="relative flex items-center justify-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Entrar
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
