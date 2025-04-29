import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  XMarkIcon,
  PhotoIcon,
  BeakerIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

const measurementUnits = [
  { value: "g", label: "Gramas (g)" },
  { value: "kg", label: "Quilogramas (kg)" },
  { value: "ml", label: "Mililitros (ml)" },
  { value: "l", label: "Litros (l)" },
  { value: "xic", label: "Xícara" },
  { value: "colh_sopa", label: "Colher de Sopa" },
  { value: "colh_cha", label: "Colher de Chá" },
  { value: "unid", label: "Unidade(s)" },
  { value: "qb", label: "Quanto Baste" },
];

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

export default function NewRecipe() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", quantity: "", unit: "g" },
  ]);
  const [instructions, setInstructions] = useState([""]);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "", unit: "g" }]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (
    index: number,
    field: keyof Ingredient,
    value: string
  ) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const handleAddInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const handleRemoveInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Validar se todos os ingredientes têm nome e quantidade
    const hasInvalidIngredients = ingredients.some(
      (ing) => !ing.name.trim() || (!ing.quantity.trim() && ing.unit !== "qb")
    );

    if (hasInvalidIngredients) {
      toast.error("Por favor, preencha todos os campos dos ingredientes");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "recipes"), {
        title,
        description,
        ingredients: ingredients.map((ing) => ({
          ...ing,
          name: ing.name.trim(),
          quantity: ing.quantity.trim(),
        })),
        instructions: instructions.filter((i) => i.trim() !== ""),
        imageUrl,
        userId: currentUser.uid,
        createdAt: new Date(),
      });
      toast.success("Receita criada com sucesso!");
      navigate("/recipes");
    } catch (error: unknown) {
      console.error("Error creating recipe:", error);
      toast.error("Erro ao criar receita");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold text-gray-900 mb-8"
        >
          Nova Receita
        </motion.h1>

        <motion.form
          variants={container}
          initial="hidden"
          animate="show"
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          <motion.div variants={item}>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Título
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
              placeholder="Digite o título da receita"
            />
          </motion.div>

          <motion.div variants={item}>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Descrição
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
              placeholder="Digite a descrição da receita"
            />
          </motion.div>

          <motion.div variants={item}>
            <label
              htmlFor="imageUrl"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              URL da Imagem (opcional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PhotoIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="url"
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>
          </motion.div>

          <motion.div variants={item} className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">
                Ingredientes
              </label>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow transition-all duration-300"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Adicionar Ingrediente
              </button>
            </div>
            <AnimatePresence>
              {ingredients.map((ingredient, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start space-x-4"
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      value={ingredient.name}
                      onChange={(e) =>
                        handleIngredientChange(index, "name", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                      placeholder="Nome do ingrediente"
                    />
                  </div>
                  <div className="w-32">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <BeakerIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={ingredient.quantity}
                        onChange={(e) =>
                          handleIngredientChange(
                            index,
                            "quantity",
                            e.target.value
                          )
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                        placeholder="Qtd."
                        disabled={ingredient.unit === "qb"}
                      />
                    </div>
                  </div>
                  <div className="w-40">
                    <select
                      value={ingredient.unit}
                      onChange={(e) =>
                        handleIngredientChange(index, "unit", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                    >
                      {measurementUnits.map((unit) => (
                        <option key={unit.value} value={unit.value}>
                          {unit.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(index)}
                    className="p-2 text-red-600 hover:text-red-700 transition-colors duration-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={item} className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">
                Modo de Preparo
              </label>
              <button
                type="button"
                onClick={handleAddInstruction}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow transition-all duration-300"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Adicionar Passo
              </button>
            </div>
            <AnimatePresence>
              {instructions.map((instruction, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start space-x-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-medium">
                    {index + 1}
                  </div>
                  <textarea
                    value={instruction}
                    onChange={(e) =>
                      handleInstructionChange(index, e.target.value)
                    }
                    rows={2}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                    placeholder={`Passo ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveInstruction(index)}
                    className="p-2 text-red-600 hover:text-red-700 transition-colors duration-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={item} className="flex justify-end">
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-6 py-3 text-base font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform translate-x-0 -skew-x-12 group-hover:translate-x-full group-hover:skew-x-12 bg-gradient-to-r from-purple-600 to-indigo-600"></span>
              <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform -translate-x-full skew-x-12 group-hover:translate-x-0 group-hover:skew-x-12 bg-gradient-to-r from-indigo-600 to-purple-600"></span>
              <span className="relative flex items-center justify-center">
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <PlusIcon className="h-5 w-5 mr-2" />
                )}
                {loading ? "Salvando..." : "Salvar Receita"}
              </span>
            </motion.button>
          </motion.div>
        </motion.form>
      </div>
    </motion.div>
  );
}
