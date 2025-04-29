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
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { useInView } from "react-intersection-observer";
import toast from "react-hot-toast";
import Footer from "../components/Footer";

interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  createdAt: Date;
  occasion: string;
  difficulty: string;
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

const occasions = ["Todas", "Doces", "Salgados"];

export default function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOccasion, setSelectedOccasion] = useState("Todas");
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
    <div className="min-h-screen flex flex-col">
      <div className="w-full px-4 py-6 flex-grow mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-6 mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold text-gray-900"
            >
              As Nossas Receitas
            </motion.h1>

            <Link to="/new-recipe" className="w-full">
              <button className="flex items-center justify-center w-full px-4 py-3 text-base font-medium rounded-lg text-white bg-pink-600 hover:bg-pink-700">
                <PlusIcon className="h-5 w-5 mr-2" />
                Nova Receita
              </button>
            </Link>

            <div className="flex flex-col gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar receitas..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <select
                value={selectedOccasion}
                onChange={(e) => setSelectedOccasion(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                {occasions.map((occasion) => (
                  <option key={occasion} value={occasion}>
                    {occasion}
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
              className="relative text-center py-12 bg-white rounded-2xl shadow-sm"
            >
              <div className="max-w-md mx-auto px-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {searchQuery || selectedOccasion !== "Todas"
                    ? "Nenhuma receita encontrada"
                    : "Ainda não tem receitas"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || selectedOccasion !== "Todas"
                    ? "Tente ajustar a sua pesquisa"
                    : "Comece por criar a sua primeira receita!"}
                </p>
                <Link
                  to="/new-recipe"
                  className="block w-full text-center px-4 py-3 text-base font-medium rounded-lg text-white bg-pink-600 hover:bg-pink-700"
                >
                  <div className="flex items-center justify-center">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Criar a primeira receita
                  </div>
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              ref={ref}
              variants={container}
              initial="hidden"
              animate={inView ? "show" : "hidden"}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
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
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <Link to={`/recipes/${recipe.id}`} className="block">
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
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
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
                        <div className="space-y-2">
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
                                    showMemories === recipe.id
                                      ? null
                                      : recipe.id
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
                        className="flex items-center justify-center w-full py-2 text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-5 w-5 mr-2" />
                        Excluir
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
