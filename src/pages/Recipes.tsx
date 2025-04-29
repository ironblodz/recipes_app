import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useInView } from "react-intersection-observer";
import toast from "react-hot-toast";

interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
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

export default function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
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
        const q = query(recipesRef, where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);

        const recipesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Recipe[];
        setRecipes(recipesData);
      } catch (error: unknown) {
        console.error("Error loading recipes:", error);
        toast.error("Erro ao carregar receitas");
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, [currentUser]);

  const handleDelete = async (recipeId: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta receita?")) {
      try {
        await deleteDoc(doc(db, "recipes", recipeId));
        setRecipes(recipes.filter((recipe) => recipe.id !== recipeId));
        toast.success("Receita excluída com sucesso!");
      } catch (error: unknown) {
        console.error("Error deleting recipe:", error);
        toast.error("Erro ao excluir receita");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-gray-900 mb-4 md:mb-0"
        >
          Minhas Receitas
        </motion.h1>
        <Link
          to="/new-recipe"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nova Receita
        </Link>
      </div>

      {recipes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16 bg-white rounded-2xl shadow-lg"
        >
          <div className="max-w-md mx-auto">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Nenhuma receita encontrada
            </h3>
            <p className="text-gray-600 mb-8">
              Comece criando sua primeira receita para compartilhar com todos!
            </p>
            <Link
              to="/new-recipe"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Criar minha primeira receita
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
          {recipes.map((recipe) => (
            <motion.div
              key={recipe.id}
              variants={item}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                <Link to={`/recipes/${recipe.id}`} className="block">
                  <div className="relative h-48 overflow-hidden">
                    {recipe.imageUrl ? (
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                        <span className="text-gray-400 text-lg">
                          Sem imagem
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {recipe.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-2">
                      {recipe.description}
                    </p>
                  </div>
                </Link>
                <div className="px-6 pb-6">
                  <button
                    onClick={() => handleDelete(recipe.id)}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 shadow-sm hover:shadow transition-all duration-300"
                  >
                    <TrashIcon className="h-5 w-5 mr-2" />
                    Excluir
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
