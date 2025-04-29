import { motion } from "framer-motion";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-pink-50 to-purple-50 py-6 mt-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-gray-600 text-sm">
            Feito com ❤️ pelo namorado mais fofo do mundo
          </p>
          <p className="text-gray-500 text-xs mt-1">by João Peres</p>
        </div>
      </div>
    </motion.footer>
  );
}
