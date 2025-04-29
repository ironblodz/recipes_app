import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  HomeIcon,
  BookOpenIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  SparklesIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const hoverAnimation = {
  scale: 1.05,
  transition: { type: "spring", stiffness: 400, damping: 10 },
};

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="relative">
        {/* Glassmorphism background */}
        <motion.div
          className="absolute inset-0 bg-white/80 backdrop-blur-lg shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Decorative gradient elements */}
        <motion.div
          className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full filter blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 rounded-full filter blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.8, 0.5, 0.8],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Brand */}
          <motion.div
            variants={item}
            initial="hidden"
            animate="show"
            className="flex items-center space-x-3"
          >
            <Link to="/" className="relative group">
              <motion.div
                whileHover={hoverAnimation}
                className="flex items-center space-x-2"
              >
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center"
                >
                  <HeartIcon className="h-6 w-6 text-white" />
                </motion.div>
                <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                  Receitas da Joana
                </span>
              </motion.div>
            </Link>
          </motion.div>

          {/* Navigation Links */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="hidden md:flex items-center space-x-6"
          >
            <motion.div variants={item}>
              <Link
                to="/"
                className={`relative group px-4 py-2 rounded-xl transition-all duration-300 ${
                  location.pathname === "/"
                    ? "text-pink-600"
                    : "text-gray-600 hover:text-pink-500"
                }`}
              >
                <motion.span
                  whileHover={hoverAnimation}
                  className="flex items-center space-x-2 relative z-10"
                >
                  <HomeIcon className="h-5 w-5" />
                  <span className="text-base font-medium">Home</span>
                </motion.span>
                {location.pathname === "/" && (
                  <motion.div
                    layoutId="activeNavItem"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            </motion.div>

            <motion.div variants={item}>
              <Link
                to="/recipes"
                className={`relative group px-4 py-2 rounded-xl transition-all duration-300 ${
                  location.pathname === "/recipes"
                    ? "text-pink-600"
                    : "text-gray-600 hover:text-pink-500"
                }`}
              >
                <motion.span
                  whileHover={hoverAnimation}
                  className="flex items-center space-x-2 relative z-10"
                >
                  <BookOpenIcon className="h-5 w-5" />
                  <span className="text-base font-medium">Receitas</span>
                </motion.span>
                {location.pathname === "/recipes" && (
                  <motion.div
                    layoutId="activeNavItem"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            </motion.div>

            {currentUser ? (
              <>
                <motion.div variants={item}>
                  <Link
                    to="/profile"
                    className={`relative group px-4 py-2 rounded-xl transition-all duration-300 ${
                      location.pathname === "/profile"
                        ? "text-pink-600"
                        : "text-gray-600 hover:text-pink-500"
                    }`}
                  >
                    <motion.span
                      whileHover={hoverAnimation}
                      className="flex items-center space-x-2 relative z-10"
                    >
                      <UserIcon className="h-5 w-5" />
                      <span className="text-base font-medium">Perfil</span>
                    </motion.span>
                    {location.pathname === "/profile" && (
                      <motion.div
                        layoutId="activeNavItem"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                  </Link>
                </motion.div>

                <motion.div variants={item}>
                  <motion.button
                    whileHover={hoverAnimation}
                    onClick={handleLogout}
                    className="relative group px-4 py-2 rounded-xl text-gray-600 hover:text-pink-500 transition-all duration-300"
                  >
                    <span className="flex items-center space-x-2 relative z-10">
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                      <span className="text-base font-medium">Sair</span>
                    </span>
                  </motion.button>
                </motion.div>
              </>
            ) : (
              <motion.div variants={item}>
                <Link
                  to="/login"
                  className="relative group px-4 py-2 rounded-xl text-gray-600 hover:text-pink-500 transition-all duration-300"
                >
                  <motion.span
                    whileHover={hoverAnimation}
                    className="flex items-center space-x-2 relative z-10"
                  >
                    <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                    <span className="text-base font-medium">Entrar</span>
                  </motion.span>
                </Link>
              </motion.div>
            )}
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.div variants={item} className="md:hidden">
            <motion.button
              whileHover={hoverAnimation}
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-gray-600 hover:text-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-300"
            >
              <SparklesIcon className="h-6 w-6" />
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white/90 backdrop-blur-lg shadow-xl"
          >
            <div className="px-3 py-2 space-y-1">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block relative px-3 py-2 rounded-lg text-base font-medium ${
                  location.pathname === "/"
                    ? "text-pink-600"
                    : "text-gray-600 hover:text-pink-500"
                }`}
              >
                <motion.span
                  whileHover={hoverAnimation}
                  className="flex items-center space-x-2 relative z-10"
                >
                  <HomeIcon className="h-5 w-5" />
                  <span>Home</span>
                </motion.span>
                {location.pathname === "/" && (
                  <motion.div
                    layoutId="activeNavItemMobile"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-pink-500"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
              <Link
                to="/recipes"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block relative px-3 py-2 rounded-lg text-base font-medium ${
                  location.pathname === "/recipes"
                    ? "text-pink-600"
                    : "text-gray-600 hover:text-pink-500"
                }`}
              >
                <motion.span
                  whileHover={hoverAnimation}
                  className="flex items-center space-x-2 relative z-10"
                >
                  <BookOpenIcon className="h-5 w-5" />
                  <span>Receitas</span>
                </motion.span>
                {location.pathname === "/recipes" && (
                  <motion.div
                    layoutId="activeNavItemMobile"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-pink-500"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
              {currentUser ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block relative px-3 py-2 rounded-lg text-base font-medium ${
                      location.pathname === "/profile"
                        ? "text-pink-600"
                        : "text-gray-600 hover:text-pink-500"
                    }`}
                  >
                    <motion.span
                      whileHover={hoverAnimation}
                      className="flex items-center space-x-2 relative z-10"
                    >
                      <UserIcon className="h-5 w-5" />
                      <span>Perfil</span>
                    </motion.span>
                    {location.pathname === "/profile" && (
                      <motion.div
                        layoutId="activeNavItemMobile"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-pink-500"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                  </Link>
                  <motion.button
                    whileHover={hoverAnimation}
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-gray-600 hover:text-pink-500"
                  >
                    <span className="flex items-center space-x-2">
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                      <span>Sair</span>
                    </span>
                  </motion.button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block relative px-3 py-2 rounded-lg text-base font-medium text-gray-600 hover:text-pink-500"
                >
                  <motion.span
                    whileHover={hoverAnimation}
                    className="flex items-center space-x-2 relative z-10"
                  >
                    <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                    <span>Entrar</span>
                  </motion.span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
