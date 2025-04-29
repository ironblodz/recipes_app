import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  HomeIcon,
  BookOpenIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  SparklesIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { useState, useRef } from "react";

const floatingAnimation = {
  initial: { y: 0, scale: 1 },
  animate: {
    y: [0, -15, 0],
    scale: [1, 1.1, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const floatingAnimation2 = {
  initial: { y: 0, scale: 1 },
  animate: {
    y: [0, 15, 0],
    scale: [1, 1.1, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const heartAnimation = {
  initial: { scale: 1, rotate: 0 },
  animate: {
    scale: [1, 1.2, 1],
    rotate: [0, 10, -10, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

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

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.8]);
  const scale = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <motion.nav
      ref={containerRef}
      style={{ opacity, scale }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="relative">
        {/* Background with gradient and blur */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-white/90 to-white/80 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Floating elements */}
        <motion.div
          variants={floatingAnimation}
          initial="initial"
          animate="animate"
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        />
        <motion.div
          variants={floatingAnimation2}
          initial="initial"
          animate="animate"
          className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-r from-indigo-200 to-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <motion.div
            variants={item}
            initial="hidden"
            animate="show"
            className="flex items-center space-x-3"
          >
            <Link to="/" className="relative group flex items-center space-x-2">
              <motion.div
                variants={heartAnimation}
                initial="initial"
                animate="animate"
                className="absolute -top-3 -left-3 w-10 h-10 bg-white rounded-full p-2 shadow-lg"
              >
                <HeartIcon className="h-6 w-6 text-pink-500" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                Receitas da Joana
              </span>
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
                    ? "text-white"
                    : "text-gray-600 hover:text-pink-500"
                }`}
              >
                <span className="flex items-center space-x-2 relative z-10">
                  <HomeIcon className="h-5 w-5" />
                  <span className="text-base">Home</span>
                </span>
                {location.pathname === "/" ? (
                  <motion.div
                    layoutId="activeNavItem"
                    className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl shadow-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                ) : (
                  <span className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                )}
              </Link>
            </motion.div>

            <motion.div variants={item}>
              <Link
                to="/recipes"
                className={`relative group px-4 py-2 rounded-xl transition-all duration-300 ${
                  location.pathname === "/recipes"
                    ? "text-white"
                    : "text-gray-600 hover:text-pink-500"
                }`}
              >
                <span className="flex items-center space-x-2 relative z-10">
                  <BookOpenIcon className="h-5 w-5" />
                  <span className="text-base">Receitas</span>
                </span>
                {location.pathname === "/recipes" ? (
                  <motion.div
                    layoutId="activeNavItem"
                    className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl shadow-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                ) : (
                  <span className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
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
                        ? "text-white"
                        : "text-gray-600 hover:text-pink-500"
                    }`}
                  >
                    <span className="flex items-center space-x-2 relative z-10">
                      <UserIcon className="h-5 w-5" />
                      <span className="text-base">Perfil</span>
                    </span>
                    {location.pathname === "/profile" ? (
                      <motion.div
                        layoutId="activeNavItem"
                        className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl shadow-lg"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    ) : (
                      <span className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                    )}
                  </Link>
                </motion.div>

                <motion.div variants={item}>
                  <button
                    onClick={handleLogout}
                    className="relative group px-4 py-2 rounded-xl text-gray-600 hover:text-pink-500 transition-all duration-300"
                  >
                    <span className="flex items-center space-x-2 relative z-10">
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                      <span className="text-base">Sair</span>
                    </span>
                    <span className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                  </button>
                </motion.div>
              </>
            ) : (
              <motion.div variants={item}>
                <Link
                  to="/login"
                  className="relative group px-4 py-2 rounded-xl text-gray-600 hover:text-pink-500 transition-all duration-300"
                >
                  <span className="flex items-center space-x-2 relative z-10">
                    <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                    <span className="text-base">Entrar</span>
                  </span>
                  <span className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                </Link>
              </motion.div>
            )}
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.div variants={item} className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-gray-600 hover:text-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-300"
            >
              <SparklesIcon className="h-6 w-6" />
            </button>
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
            className="md:hidden bg-white/90 backdrop-blur-md shadow-xl"
          >
            <div className="px-3 py-2 space-y-1">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block relative px-3 py-2 rounded-lg text-base font-medium ${
                  location.pathname === "/"
                    ? "text-white"
                    : "text-gray-600 hover:text-pink-500"
                }`}
              >
                <span className="flex items-center space-x-2 relative z-10">
                  <HomeIcon className="h-5 w-5" />
                  <span>Home</span>
                </span>
                {location.pathname === "/" && (
                  <motion.div
                    layoutId="activeNavItemMobile"
                    className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg shadow-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
              <Link
                to="/recipes"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block relative px-3 py-2 rounded-lg text-base font-medium ${
                  location.pathname === "/recipes"
                    ? "text-white"
                    : "text-gray-600 hover:text-pink-500"
                }`}
              >
                <span className="flex items-center space-x-2 relative z-10">
                  <BookOpenIcon className="h-5 w-5" />
                  <span>Receitas</span>
                </span>
                {location.pathname === "/recipes" && (
                  <motion.div
                    layoutId="activeNavItemMobile"
                    className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg shadow-lg"
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
                        ? "text-white"
                        : "text-gray-600 hover:text-pink-500"
                    }`}
                  >
                    <span className="flex items-center space-x-2 relative z-10">
                      <UserIcon className="h-5 w-5" />
                      <span>Perfil</span>
                    </span>
                    {location.pathname === "/profile" && (
                      <motion.div
                        layoutId="activeNavItemMobile"
                        className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg shadow-lg"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                  </Link>
                  <button
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
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block relative px-3 py-2 rounded-lg text-base font-medium text-gray-600 hover:text-pink-500"
                >
                  <span className="flex items-center space-x-2 relative z-10">
                    <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                    <span>Entrar</span>
                  </span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
