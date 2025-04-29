import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import { PhotoIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

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
  "Dia a Dia",
  "Aniversário",
  "Dia dos Namorados",
  "Data Especial",
  "Surpresa",
  "Outra",
];

const difficulties = ["Fácil", "Médio", "Difícil"];

const preparationTimes = [
  "Rápido (até 30 min)",
  "Médio (30-60 min)",
  "Demorado (mais de 60 min)",
];

interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string;
  userId: string;
  occasion: string;
  difficulty: string;
  preparationTime: string;
  secretMessage?: string;
  rating?: number;
  memories?: string[];
}

export default function EditRecipe() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState([""]);
  const [instructions, setInstructions] = useState([""]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [occasion, setOccasion] = useState("Dia a Dia");
  const [difficulty, setDifficulty] = useState("");
  const [preparationTime, setPreparationTime] = useState("");
  const [secretMessage, setSecretMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [memories, setMemories] = useState([""]);
  const [loading, setLoading] = useState(false);
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchRecipe() {
      if (!id) return;

      const recipeRef = doc(db, "recipes", id);
      const recipeSnap = await getDoc(recipeRef);

      if (recipeSnap.exists()) {
        const recipeData = {
          id: recipeSnap.id,
          ...recipeSnap.data(),
        } as Recipe;
        setRecipe(recipeData);
        setTitle(recipeData.title);
        setDescription(recipeData.description);
        setIngredients(recipeData.ingredients);
        setInstructions(recipeData.instructions);
        setImagePreview(recipeData.imageUrl || "");
        setOccasion(recipeData.occasion);
        setDifficulty(recipeData.difficulty);
        setPreparationTime(recipeData.preparationTime);
        setSecretMessage(recipeData.secretMessage || "");
        setRating(recipeData.rating || 0);
        setMemories(recipeData.memories || [""]);
      }
    }

    fetchRecipe();
  }, [id]);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleAddInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const handleRemoveInstruction = (index: number) => {
    const newInstructions = instructions.filter((_, i) => i !== index);
    setInstructions(newInstructions);
  };

  const handleAddMemory = () => {
    setMemories([...memories, ""]);
  };

  const handleRemoveMemory = (index: number) => {
    const newMemories = memories.filter((_, i) => i !== index);
    setMemories(newMemories);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("A imagem deve ter menos de 10MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !id || !recipe) return;

    setLoading(true);
    try {
      let imageUrl = recipe.imageUrl;

      if (imageFile) {
        // Delete old image if it exists
        if (recipe.imageUrl) {
          try {
            const oldImageRef = ref(storage, recipe.imageUrl);
            await deleteObject(oldImageRef);
          } catch (error) {
            console.error("Error deleting old image:", error);
          }
        }

        // Upload new image
        const storageRef = ref(
          storage,
          `recipes/${currentUser.uid}/${Date.now()}_${imageFile.name}`
        );
        const metadata = {
          contentType: imageFile.type,
          customMetadata: {
            uploadedBy: currentUser.uid,
          },
        };

        try {
          const snapshot = await uploadBytes(storageRef, imageFile, metadata);
          imageUrl = await getDownloadURL(snapshot.ref);
        } catch (error) {
          console.error("Error uploading image:", error);
          toast.error("Erro ao fazer upload da imagem");
          setLoading(false);
          return;
        }
      }

      const recipeData = {
        title,
        description,
        ingredients: ingredients.filter(Boolean),
        instructions: instructions.filter(Boolean),
        imageUrl,
        occasion,
        difficulty,
        preparationTime,
        secretMessage,
        rating,
        memories: memories.filter(Boolean),
        userId: currentUser.uid,
      };

      await updateDoc(doc(db, "recipes", id), recipeData);
      toast.success("Receita atualizada com sucesso!");
      navigate(`/recipes/${id}`);
    } catch (error) {
      console.error("Error updating recipe:", error);
      toast.error("Erro ao atualizar receita");
    } finally {
      setLoading(false);
    }
  };

  if (!recipe) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <motion.div variants={item}>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Editar Receita
          </h1>
          <p className="text-gray-600">Atualize os detalhes da sua receita</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <motion.div variants={item} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Título da Receita
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:ring-pink-500"
                placeholder="Nome da receita"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Descrição
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:ring-pink-500"
                placeholder="Conte um pouco sobre esta receita..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label
                  htmlFor="occasion"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tipo de Receita
                </label>
                <select
                  id="occasion"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:ring-pink-500"
                >
                  {occasions.map((occ) => (
                    <option key={occ} value={occ}>
                      {occ}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="difficulty"
                  className="block text-sm font-medium text-gray-700"
                >
                  Dificuldade
                </label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:ring-pink-500"
                >
                  <option value="">Selecione a dificuldade</option>
                  {difficulties.map((diff) => (
                    <option key={diff} value={diff}>
                      {diff}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="preparationTime"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tempo de Preparo
                </label>
                <select
                  id="preparationTime"
                  value={preparationTime}
                  onChange={(e) => setPreparationTime(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:ring-pink-500"
                >
                  <option value="">Selecione o tempo</option>
                  {preparationTimes.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {occasion !== "Dia a Dia" && (
              <div>
                <label
                  htmlFor="secretMessage"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mensagem Especial
                </label>
                <input
                  type="text"
                  id="secretMessage"
                  value={secretMessage}
                  onChange={(e) => setSecretMessage(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:ring-pink-500"
                  placeholder="Deixe uma mensagem especial..."
                />
              </div>
            )}

            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700"
              >
                Imagem da Receita
              </label>
              <div className="mt-1 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-10">
                <div className="text-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mx-auto h-32 w-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview("");
                          setImageFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <PhotoIcon
                      className="mx-auto h-12 w-12 text-gray-400"
                      aria-hidden="true"
                    />
                  )}
                  <div className="mt-4 flex text-sm leading-6 text-gray-600">
                    <label
                      htmlFor="image"
                      className="relative cursor-pointer rounded-md bg-white font-semibold text-pink-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-pink-600 focus-within:ring-offset-2 hover:text-pink-500"
                    >
                      <span>Upload a file</span>
                      <input
                        ref={fileInputRef}
                        id="image"
                        name="image"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs leading-5 text-gray-600">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Ingredientes
                </label>
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="text-sm text-pink-600 hover:text-pink-700"
                >
                  + Adicionar Ingrediente
                </button>
              </div>
              <div className="mt-2 space-y-2">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => {
                        const newIngredients = [...ingredients];
                        newIngredients[index] = e.target.value;
                        setIngredients(newIngredients);
                      }}
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:ring-pink-500"
                      placeholder={`Ingrediente ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Modo de Preparo
                </label>
                <button
                  type="button"
                  onClick={handleAddInstruction}
                  className="text-sm text-pink-600 hover:text-pink-700"
                >
                  + Adicionar Passo
                </button>
              </div>
              <div className="mt-2 space-y-2">
                {instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={instruction}
                      onChange={(e) => {
                        const newInstructions = [...instructions];
                        newInstructions[index] = e.target.value;
                        setInstructions(newInstructions);
                      }}
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:ring-pink-500"
                      placeholder={`Passo ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveInstruction(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {occasion !== "Dia a Dia" && (
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Memórias Especiais
                  </label>
                  <button
                    type="button"
                    onClick={handleAddMemory}
                    className="text-sm text-pink-600 hover:text-pink-700"
                  >
                    + Adicionar Memória
                  </button>
                </div>
                <div className="mt-2 space-y-2">
                  {memories.map((memory, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={memory}
                        onChange={(e) => {
                          const newMemories = [...memories];
                          newMemories[index] = e.target.value;
                          setMemories(newMemories);
                        }}
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:ring-pink-500"
                        placeholder={`Memória ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveMemory(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Avaliação
              </label>
              <div className="mt-2 flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-2xl"
                  >
                    {star <= rating ? "★" : "☆"}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/recipes/${id}`)}
              className="px-6 py-3 text-base font-medium rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors duration-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 text-base font-medium rounded-lg text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "A guardar..." : "Guardar Alterações"}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
