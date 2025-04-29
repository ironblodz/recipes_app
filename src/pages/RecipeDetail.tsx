import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import {
  PencilIcon,
  TrashIcon,
  HeartIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: Array<{
    name: string;
    quantity: string;
    unit: string;
  }>;
  instructions: Array<{
    step: string;
    subStep: string;
  }>;
  imageUrl?: string;
  userId: string;
  occasion: string;
  difficulty: string;
  preparationTime: string;
  secretMessage?: string;
  rating?: number;
  memories?: string[];
}

export default function RecipeDetail() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRecipe() {
      if (!id) return;

      const recipeRef = doc(db, "recipes", id);
      const recipeSnap = await getDoc(recipeRef);

      if (recipeSnap.exists()) {
        setRecipe({ id: recipeSnap.id, ...recipeSnap.data() } as Recipe);
      }
      setLoading(false);
    }

    fetchRecipe();
  }, [id]);

  async function handleDelete() {
    if (!id || !recipe) return;

    if (window.confirm("Tem a certeza que pretende eliminar esta receita?")) {
      try {
        await deleteDoc(doc(db, "recipes", id));
        toast.success("Receita eliminada com sucesso!");
        navigate("/recipes");
      } catch (error) {
        console.error("Error deleting recipe:", error);
        toast.error("Erro ao eliminar receita");
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16 bg-white rounded-2xl shadow-lg max-w-2xl mx-auto"
      >
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Receita não encontrada
        </h2>
        <p className="text-gray-600 mb-8">
          A receita que está a procurar não existe ou foi removida.
        </p>
        <button
          onClick={() => navigate("/recipes")}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Voltar para as receitas
        </button>
      </motion.div>
    );
  }

  const isOwner = currentUser?.uid === recipe.userId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {recipe.imageUrl && (
          <div className="relative h-96 overflow-hidden">
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1"
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {recipe.title}
              </h1>
              <div className="flex flex-wrap gap-2 mt-2">
                {recipe.occasion !== "Dia a Dia" && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-800">
                    {recipe.occasion}
                  </span>
                )}
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  {recipe.difficulty}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {recipe.preparationTime}
                </span>
              </div>
            </motion.div>
            {isOwner && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex space-x-4 mt-4 md:mt-0"
              >
                <button
                  onClick={() => navigate(`/recipes/${id}/edit`)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-sm hover:shadow transition-all duration-300"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  Editar
                </button>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 shadow-sm hover:shadow transition-all duration-300"
                >
                  <TrashIcon className="h-5 w-5 mr-2" />
                  Eliminar
                </button>
              </motion.div>
            )}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-gray-600 mb-8"
          >
            {recipe.description}
          </motion.p>

          {recipe.occasion !== "Dia a Dia" && recipe.secretMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-8 p-4 bg-pink-50 rounded-xl"
            >
              <div className="flex items-center text-pink-600">
                <HeartIcon className="h-5 w-5 mr-2" />
                <span className="font-medium">Mensagem Especial</span>
              </div>
              <p className="mt-2 text-pink-800">{recipe.secretMessage}</p>
            </motion.div>
          )}

          {recipe.rating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mb-8"
            >
              <div className="flex items-center text-yellow-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-2xl">
                    {i < (recipe.rating || 0) ? "★" : "☆"}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gray-50 rounded-xl p-6"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Ingredientes
              </h2>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-pink-100 text-pink-600 mr-3 mt-1">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">
                      {ingredient.quantity} {ingredient.unit} de{" "}
                      {ingredient.name}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gray-50 rounded-xl p-6"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Modo de Preparo
              </h2>
              <div className="space-y-6">
                {["Bolo", "Cobertura", "Caldas", "Montagem", "Outros"].map(
                  (subStep) => {
                    const subStepInstructions = recipe.instructions.filter(
                      (instruction) => instruction.subStep === subStep
                    );

                    if (subStepInstructions.length === 0) return null;

                    return (
                      <div key={subStep} className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-800">
                          {subStep}
                        </h3>
                        <ol className="space-y-4">
                          {subStepInstructions.map((instruction, index) => (
                            <li key={index} className="flex items-start">
                              <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-3 mt-1">
                                {index + 1}
                              </span>
                              <span className="text-gray-700">
                                {instruction.step}
                              </span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    );
                  }
                )}
              </div>
            </motion.div>
          </div>

          {recipe.occasion !== "Dia a Dia" &&
            recipe.memories &&
            recipe.memories.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-8 bg-pink-50 rounded-xl p-6"
              >
                <div className="flex items-center text-pink-600 mb-4">
                  <PhotoIcon className="h-5 w-5 mr-2" />
                  <h2 className="text-2xl font-semibold">Memórias Especiais</h2>
                </div>
                <div className="space-y-4">
                  {recipe.memories.map((memory, index) => (
                    <p key={index} className="text-pink-800">
                      {memory}
                    </p>
                  ))}
                </div>
              </motion.div>
            )}
        </div>
      </div>
    </motion.div>
  );
}
