import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  ClockIcon,
  StarIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { useInView } from "react-intersection-observer";
import toast from "react-hot-toast";

interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  createdAt: Date;
  occasion: string;
  difficulty: string;
  preparationTime: string;
  secretMessage?: string;
  rating?: number;
  memories?: string[];
}

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

const occasions = [
  "Todas",
  "Dia a Dia",
  "Aniversário",
  "Dia dos Namorados",
  "Data Especial",
  "Surpresa",
  "Outra",
];

const difficulties = ["Todas", "Fácil", "Médio", "Difícil"];

const preparationTimes = [
  "Todos",
  "Rápido (até 30 min)",
  "Médio (30-60 min)",
  "Demorado (mais de 60 min)",
];

export default function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOccasion, setSelectedOccasion] = useState("Todas");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Todas");
  const [selectedTime, setSelectedTime] = useState("Todos");
  const [showMemories, setShowMemories] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    async function fetchRecipes() {
      if (!currentUser) return;

      try {
        const recipesRef = collection(db, "recipes");
        const q = query(
          recipesRef,
          where("userId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);

        const recipesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Recipe[];
        setRecipes(recipesData);
      } catch (error: unknown) {
        console.error("Error loading recipes:", error);
        if (
          error instanceof Error &&
          "code" in error &&
          error.code === "failed-precondition"
        ) {
          toast.error(
            "O índice está a ser construído. Por favor, aguarde alguns minutos e tente novamente."
          );
        } else {
          toast.error(
            "Erro ao carregar receitas. Por favor, tente novamente mais tarde."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, [currentUser]);

  const handleDelete = async (recipeId: string) => {
    if (window.confirm("Tem a certeza que pretende eliminar esta receita?")) {
      try {
        await deleteDoc(doc(db, "recipes", recipeId));
        setRecipes(recipes.filter((recipe) => recipe.id !== recipeId));
        toast.success("Receita eliminada com sucesso!");
      } catch (error: unknown) {
        console.error("Error deleting recipe:", error);
        toast.error("Erro ao eliminar receita");
      }
    }
  };

  const filteredRecipes = recipes
    .filter((recipe) =>
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(
      (recipe) =>
        selectedOccasion === "Todas" || recipe.occasion === selectedOccasion
    )
    .filter(
      (recipe) =>
        selectedDifficulty === "Todas" ||
        recipe.difficulty === selectedDifficulty
    )
    .filter(
      (recipe) =>
        selectedTime === "Todos" || recipe.preparationTime === selectedTime
    );

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-600"></div>
        <p className="text-gray-600">A carregar as suas receitas...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-gray-900"
        >
          As Nossas Receitas
        </motion.h1>
        <Link
          to="/new-recipe"
          className="group relative inline-flex px-6 py-3 text-base font-medium rounded-lg text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
        >
          <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform translate-x-0 -skew-x-12 group-hover:translate-x-full group-hover:skew-x-12 bg-gradient-to-r from-purple-600 to-pink-600 z-0"></span>
          <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform -translate-x-full skew-x-12 group-hover:translate-x-0 group-hover:skew-x-12 bg-gradient-to-r from-pink-600 to-purple-600 z-0"></span>
          <span className="relative flex items-center justify-center z-10">
            <PlusIcon className="h-5 w-5 mr-2" />
            Nova Receita
          </span>
        </Link>
      </div>

      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar receitas..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
            />
          </div>
          <select
            value={selectedOccasion}
            onChange={(e) => setSelectedOccasion(e.target.value)}
            className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            {occasions.map((occasion) => (
              <option key={occasion} value={occasion}>
                {occasion}
              </option>
            ))}
          </select>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            {difficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
            ))}
          </select>
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            {preparationTimes.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredRecipes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16 bg-white rounded-2xl shadow-lg"
        >
          <div className="max-w-md mx-auto">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              {searchQuery ||
              selectedOccasion !== "Todas" ||
              selectedDifficulty !== "Todas" ||
              selectedTime !== "Todos"
                ? "Nenhuma receita encontrada"
                : "Ainda não tem receitas"}
            </h3>
            <p className="text-gray-600 mb-8">
              {searchQuery ||
              selectedOccasion !== "Todas" ||
              selectedDifficulty !== "Todas" ||
              selectedTime !== "Todos"
                ? "Tente ajustar a sua pesquisa"
                : "Comece por criar a sua primeira receita!"}
            </p>
            <Link
              to="/new-recipe"
              className="group relative inline-flex px-6 py-3 text-base font-medium rounded-lg text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform translate-x-0 -skew-x-12 group-hover:translate-x-full group-hover:skew-x-12 bg-gradient-to-r from-purple-600 to-pink-600 z-0"></span>
              <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform -translate-x-full skew-x-12 group-hover:translate-x-0 group-hover:skew-x-12 bg-gradient-to-r from-pink-600 to-purple-600 z-0"></span>
              <span className="relative flex items-center justify-center z-10">
                <PlusIcon className="h-5 w-5 mr-2" />
                Criar a primeira receita
              </span>
            </Link>
          </div>
        </motion.div>
      ) : (
        <motion.div
          ref={ref}
          variants={container}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence>
            {filteredRecipes.map((recipe) => (
              <motion.div
                key={recipe.id}
                variants={item}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  <Link to={`/recipes/${recipe.id}`} className="block flex-1">
                    <div className="relative h-48 overflow-hidden">
                      {recipe.imageUrl ? (
                        <motion.img
                          src={recipe.imageUrl}
                          alt={recipe.title}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                          <span className="text-gray-400 text-lg">
                            Sem imagem
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {recipe.title}
                        </h3>
                        {recipe.occasion !== "Dia a Dia" && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                            {recipe.occasion}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 line-clamp-2 mb-4">
                        {recipe.description}
                      </p>
                      <div className="mt-auto space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {recipe.preparationTime}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <StarIcon className="h-4 w-4 mr-1" />
                          {recipe.difficulty}
                        </div>
                        {recipe.rating && (
                          <div className="flex items-center text-sm text-yellow-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i}>
                                {i < (recipe.rating || 0) ? "★" : "☆"}
                              </span>
                            ))}
                          </div>
                        )}
                        {recipe.occasion !== "Dia a Dia" &&
                          recipe.secretMessage && (
                            <div className="flex items-center text-sm text-pink-600">
                              <HeartIcon className="h-4 w-4 mr-1" />
                              <span className="line-clamp-1">
                                {recipe.secretMessage}
                              </span>
                            </div>
                          )}
                        {recipe.occasion !== "Dia a Dia" &&
                          recipe.memories &&
                          recipe.memories.length > 0 && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setShowMemories(
                                  showMemories === recipe.id ? null : recipe.id
                                );
                              }}
                              className="flex items-center text-sm text-purple-600 hover:text-purple-700"
                            >
                              <PhotoIcon className="h-4 w-4 mr-1" />
                              {recipe.memories.length} memória
                              {recipe.memories.length !== 1 ? "s" : ""}
                            </button>
                          )}
                      </div>
                    </div>
                  </Link>
                  <div className="p-4 border-t border-gray-100">
                    <button
                      onClick={() => handleDelete(recipe.id)}
                      className="flex items-center justify-center w-full py-2 text-red-600 hover:text-red-700 transition-colors duration-300"
                    >
                      <TrashIcon className="h-5 w-5 mr-2" />
                      Excluir
                    </button>
                  </div>
                </div>
                {showMemories === recipe.id && recipe.memories && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 bg-pink-50 rounded-lg p-4"
                  >
                    <h4 className="text-sm font-medium text-pink-800 mb-2">
                      Memórias Especiais
                    </h4>
                    <div className="space-y-2">
                      {recipe.memories.map((memory, index) => (
                        <p key={index} className="text-sm text-pink-600">
                          {memory}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
