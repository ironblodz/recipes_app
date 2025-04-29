import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  BookOpenIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useRef } from "react";
import { useInView } from "react-intersection-observer";
import { Toaster } from "react-hot-toast";

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [0, -20, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const floatingAnimation2 = {
  initial: { y: 0 },
  animate: {
    y: [0, 20, 0],
    transition: {
      duration: 5,
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
      staggerChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  const { currentUser } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div ref={containerRef} className="min-h-screen overflow-hidden">
      <Toaster position="top-right" />

      {/* Hero Section with Parallax */}
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900"
      >
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        <motion.div
          variants={floatingAnimation}
          initial="initial"
          animate="animate"
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        />
        <motion.div
          variants={floatingAnimation2}
          initial="initial"
          animate="animate"
          className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        />
      </motion.div>

      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-6xl md:text-8xl font-bold text-white mb-6"
            >
              Receitas da Joana
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto"
            >
              A tua aplicação privada de receitas favoritas ❤️
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {!currentUser ? (
                <Link
                  to="/login"
                  className="group relative px-8 py-4 text-lg font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform translate-x-0 -skew-x-12 group-hover:translate-x-full group-hover:skew-x-12 bg-gradient-to-r from-purple-600 to-indigo-600"></span>
                  <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform -translate-x-full skew-x-12 group-hover:translate-x-0 group-hover:skew-x-12 bg-gradient-to-r from-indigo-600 to-purple-600"></span>
                  <span className="relative flex items-center justify-center">
                    <BookOpenIcon className="h-6 w-6 mr-3" />
                    Entrar para ver suas receitas
                  </span>
                </Link>
              ) : (
                <Link
                  to="/recipes"
                  className="group relative px-8 py-4 text-lg font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform translate-x-0 -skew-x-12 group-hover:translate-x-full group-hover:skew-x-12 bg-gradient-to-r from-purple-600 to-indigo-600"></span>
                  <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform -translate-x-full skew-x-12 group-hover:translate-x-0 group-hover:skew-x-12 bg-gradient-to-r from-indigo-600 to-purple-600"></span>
                  <span className="relative flex items-center justify-center">
                    <BookOpenIcon className="h-6 w-6 mr-3" />
                    Ver minhas receitas
                  </span>
                </Link>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div ref={ref} className="relative bg-white py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={container}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
          >
            <motion.div
              variants={item}
              whileHover={{ scale: 1.05 }}
              className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center mb-6">
                <BookOpenIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Organize suas receitas
              </h3>
              <p className="text-gray-600">
                Mantenha todas as suas receitas favoritas organizadas em um só
                lugar.
              </p>
            </motion.div>

            <motion.div
              variants={item}
              whileHover={{ scale: 1.05 }}
              className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-6">
                <SparklesIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Acesso rápido
              </h3>
              <p className="text-gray-600">
                Encontre suas receitas rapidamente com nossa interface
                intuitiva.
              </p>
            </motion.div>

            <motion.div
              variants={item}
              whileHover={{ scale: 1.05 }}
              className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <ArrowRightIcon className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Compartilhe facilmente
              </h3>
              <p className="text-gray-600">
                Compartilhe suas receitas com amigos e familiares.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
