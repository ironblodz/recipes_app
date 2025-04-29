import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion, useScroll, useTransform } from "framer-motion";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { useRef } from "react";
import { Toaster } from "react-hot-toast";

const compliments = [
  "A mais linda ❤️",
  "Minha princesa 👑",
  "Meu amor 💕",
  "Minha vida 🌟",
  "Minha estrela ⭐",
  "Minha rainha 👸",
  "Minha joia 💎",
  "Minha luz ✨",
];

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const floatingAnimation2 = {
  initial: { y: 0 },
  animate: {
    y: [0, 10, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
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

  return (
    <div ref={containerRef} className="h-screen overflow-hidden">
      <Toaster position="top-right" />

      {/* Hero Section with Parallax */}
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 bg-gradient-to-b from-pink-100 via-purple-100 to-indigo-100"
      >
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        <motion.div
          variants={floatingAnimation}
          initial="initial"
          animate="animate"
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        />
        <motion.div
          variants={floatingAnimation2}
          initial="initial"
          animate="animate"
          className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-r from-indigo-200 to-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70"
        />
      </motion.div>

      {/* Content */}
      <div className="relative h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Joana's Image Section + Compliments */}
            <div
              className="relative mx-auto flex items-center justify-center"
              style={{ width: 440, height: 440 }}
            >
              {/* Compliments around the image */}
              {compliments.map((compliment, index) => {
                let complimentsRadius = 180;
                // Distribuição simétrica: 4 à direita, 4 à esquerda
                // Ângulos: -90, -45, 0, 45 (direita); 90, 135, 180, 225 (esquerda)
                const angleSteps = [-90, -45, 0, 45, 90, 135, 180, 225];
                const angle = angleSteps[index % compliments.length];
                // Aumenta o raio para os elogios mais embaixo
                if (angle > 100 && angle < 260) {
                  complimentsRadius = 270;
                }
                const x = Math.cos((angle * Math.PI) / 180) * complimentsRadius;
                const y = Math.sin((angle * Math.PI) / 180) * complimentsRadius;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: x,
                      y: y,
                    }}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.2,
                      type: "spring",
                      stiffness: 100,
                      damping: 10,
                    }}
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      transform: `translate(-50%, -50%)`,
                      pointerEvents: "none",
                      zIndex: 1,
                    }}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg whitespace-nowrap"
                  >
                    {compliment}
                  </motion.div>
                );
              })}
              {/* Central image */}
              <div
                className="absolute left-1/2 top-1/2"
                style={{ transform: "translate(-50%, -50%)", zIndex: 2 }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="w-64 h-64 rounded-full overflow-visible border-4 border-white shadow-2xl bg-white"
                >
                  <img
                    src="/joana.jpg"
                    alt="Joana"
                    className="w-full h-full object-cover rounded-full"
                  />
                </motion.div>
              </div>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="text-6xl md:text-8xl font-bold text-gray-900 mb-6"
            >
              Receitas da Joana
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto"
            >
              A tua aplicação privada de receitas favoritas ❤️
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {!currentUser ? (
                <Link
                  to="/login"
                  className="group relative px-8 py-4 text-lg font-medium rounded-xl text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform translate-x-0 -skew-x-12 group-hover:translate-x-full group-hover:skew-x-12 bg-gradient-to-r from-purple-500 to-pink-500"></span>
                  <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform -translate-x-full skew-x-12 group-hover:translate-x-0 group-hover:skew-x-12 bg-gradient-to-r from-pink-500 to-purple-500"></span>
                  <span className="relative flex items-center justify-center">
                    <BookOpenIcon className="h-6 w-6 mr-3" />
                    Entrar para ver suas receitas
                  </span>
                </Link>
              ) : (
                <Link
                  to="/recipes"
                  className="group relative px-8 py-4 text-lg font-medium rounded-xl text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform translate-x-0 -skew-x-12 group-hover:translate-x-full group-hover:skew-x-12 bg-gradient-to-r from-purple-500 to-pink-500"></span>
                  <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform -translate-x-full skew-x-12 group-hover:translate-x-0 group-hover:skew-x-12 bg-gradient-to-r from-pink-500 to-purple-500"></span>
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
    </div>
  );
}
