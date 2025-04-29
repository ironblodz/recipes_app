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
import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

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

const occasions = ["Doces", "Salgados"];

const preparationSubSteps = [
  "Bolo",
  "Cobertura",
  "Caldas",
  "Montagem",
  "Outros",
];

interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: Array<{
    name: string;
    quantity: string;
  }>;
  instructions: Array<{
    step: string;
    subStep: string;
  }>;
  imageUrl?: string;
  userId: string;
  occasion: string;
  memories?: Array<{
    imageUrls: string[];
  }>;
}

export default function EditRecipe() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState<
    Array<{ name: string; quantity: string }>
  >([{ name: "", quantity: "" }]);
  const [instructions, setInstructions] = useState<
    Array<{ step: string; subStep: string }>
  >([{ step: "", subStep: "Bolo" }]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [occasion, setOccasion] = useState("Doces");
  const [memories, setMemories] = useState<Array<{ imageUrls: string[] }>>([
    { imageUrls: [] },
  ]);
  const [memoryImages, setMemoryImages] = useState<Array<File[]>>([[]]);
  const [memoryImagePreviews, setMemoryImagePreviews] = useState<
    Array<string[]>
  >([[]]);
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
        setMemories(recipeData.memories || [{ imageUrls: [] }]);
        setMemoryImages(Array(recipeData.memories?.length || 1).fill([]));
        setMemoryImagePreviews(
          recipeData.memories?.map((memory) => memory.imageUrls) || [[]]
        );
      }
    }

    fetchRecipe();
  }, [id]);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "" }]);
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleIngredientChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = {
      ...newIngredients[index],
      [field]: value,
    };
    setIngredients(newIngredients);
  };

  const handleAddInstruction = () => {
    setInstructions([...instructions, { step: "", subStep: "Bolo" }]);
  };

  const handleRemoveInstruction = (index: number) => {
    const newInstructions = instructions.filter((_, i) => i !== index);
    setInstructions(newInstructions);
  };

  const handleInstructionChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const newInstructions = [...instructions];
    newInstructions[index] = {
      ...newInstructions[index],
      [field]: value,
    };
    setInstructions(newInstructions);
  };

  const handleAddMemory = () => {
    setMemories([...memories, { imageUrls: [] }]);
    setMemoryImages([...memoryImages, []]);
    setMemoryImagePreviews([...memoryImagePreviews, []]);
  };

  const handleRemoveMemory = (index: number) => {
    const newMemories = memories.filter((_, i) => i !== index);
    const newMemoryImages = memoryImages.filter((_, i) => i !== index);
    const newMemoryImagePreviews = memoryImagePreviews.filter(
      (_, i) => i !== index
    );
    setMemories(newMemories);
    setMemoryImages(newMemoryImages);
    setMemoryImagePreviews(newMemoryImagePreviews);
  };

  const handleMemoryImageChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const validFiles = files.filter((file) => {
        if (file.size > 10 * 1024 * 1024) {
          toast.error("A imagem deve ter menos de 10MB");
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        const newMemoryImages = [...memoryImages];
        newMemoryImages[index] = [
          ...(newMemoryImages[index] || []),
          ...validFiles,
        ];
        setMemoryImages(newMemoryImages);

        validFiles.forEach((file) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setMemoryImagePreviews((prevPreviews) => {
              const newPreviews = [...prevPreviews];
              if (!newPreviews[index]) {
                newPreviews[index] = [];
              }
              newPreviews[index] = [
                ...newPreviews[index],
                reader.result as string,
              ];
              return newPreviews;
            });
          };
          reader.readAsDataURL(file);
        });
      }
    }
  };

  const handleRemoveMemoryImage = (memoryIndex: number, imageIndex: number) => {
    const newMemoryImages = [...memoryImages];
    newMemoryImages[memoryIndex] = newMemoryImages[memoryIndex].filter(
      (_, i) => i !== imageIndex
    );
    setMemoryImages(newMemoryImages);

    const newMemoryImagePreviews = [...memoryImagePreviews];
    newMemoryImagePreviews[memoryIndex] = newMemoryImagePreviews[
      memoryIndex
    ].filter((_, i) => i !== imageIndex);
    setMemoryImagePreviews(newMemoryImagePreviews);

    setMemories((prevMemories) => {
      const newMemories = [...prevMemories];
      if (newMemories[memoryIndex]) {
        newMemories[memoryIndex] = {
          ...newMemories[memoryIndex],
          imageUrls: newMemories[memoryIndex].imageUrls.filter(
            (_, i) => i !== imageIndex
          ),
        };
      }
      return newMemories;
    });
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
      const memoryImageUrls: string[][] = [];

      // Upload new recipe image if changed
      if (imageFile) {
        if (recipe.imageUrl) {
          try {
            const oldImageRef = ref(storage, recipe.imageUrl);
            await deleteObject(oldImageRef);
          } catch (error) {
            console.error("Error deleting old image:", error);
          }
        }

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

      // Upload memory images
      for (let i = 0; i < memoryImages.length; i++) {
        const memoryImageUrlsForMemory: string[] = [];
        for (const memoryImage of memoryImages[i]) {
          const storageRef = ref(
            storage,
            `recipes/${currentUser.uid}/memories/${Date.now()}_${
              memoryImage.name
            }`
          );
          const metadata = {
            contentType: memoryImage.type,
            customMetadata: {
              uploadedBy: currentUser.uid,
            },
          };

          try {
            const snapshot = await uploadBytes(
              storageRef,
              memoryImage,
              metadata
            );
            const url = await getDownloadURL(snapshot.ref);
            memoryImageUrlsForMemory.push(url);
          } catch (error) {
            console.error("Error uploading memory image:", error);
            toast.error("Erro ao fazer upload da imagem da memória");
            setLoading(false);
            return;
          }
        }
        memoryImageUrls.push(memoryImageUrlsForMemory);
      }

      const recipeData = {
        title,
        description,
        ingredients: ingredients.filter(Boolean),
        instructions: instructions.map((instruction) => ({
          step: instruction.step,
          subStep: instruction.subStep,
        })),
        imageUrl,
        occasion,
        memories: memoryImageUrls.map((urls, index) => ({
          imageUrls: [...urls, ...(memories[index]?.imageUrls || [])],
        })),
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
    <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
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
            </div>

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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingredientes
              </label>
              <div className="space-y-4">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={ingredient.name}
                          onChange={(e) =>
                            handleIngredientChange(
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          required
                          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:ring-pink-500"
                          placeholder="Nome do ingrediente"
                        />
                      </div>
                      <div className="w-full sm:w-48">
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
                          required
                          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:ring-pink-500"
                          placeholder="Quantidade (ex: 200g, 1 colher de sopa)"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(index)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                      {index === ingredients.length - 1 && (
                        <button
                          type="button"
                          onClick={handleAddIngredient}
                          className="p-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                        >
                          <PlusIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modo de Preparação
              </label>
              <div className="space-y-4">
                {instructions.map((instruction, index) => (
                  <div key={index} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={instruction.step}
                          onChange={(e) =>
                            handleInstructionChange(
                              index,
                              "step",
                              e.target.value
                            )
                          }
                          required
                          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:ring-pink-500"
                          placeholder={`Passo ${index + 1}`}
                        />
                      </div>
                      <div className="w-full sm:w-48">
                        <select
                          value={instruction.subStep}
                          onChange={(e) =>
                            handleInstructionChange(
                              index,
                              "subStep",
                              e.target.value
                            )
                          }
                          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:ring-pink-500"
                        >
                          {preparationSubSteps.map((subStep) => (
                            <option key={subStep} value={subStep}>
                              {subStep}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveInstruction(index)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                      {index === instructions.length - 1 && (
                        <button
                          type="button"
                          onClick={handleAddInstruction}
                          className="p-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                        >
                          <PlusIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Galeria de Fotos
                </label>
                <button
                  type="button"
                  onClick={handleAddMemory}
                  className="text-sm text-pink-600 hover:text-pink-700"
                >
                  + Nova Galeria
                </button>
              </div>
              <div className="mt-2 space-y-4">
                {memories?.map((_, index) => (
                  <div key={index} className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {memoryImagePreviews[index]?.map(
                        (preview, imageIndex) => (
                          <div key={imageIndex} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${imageIndex + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveMemoryImage(index, imageIndex)
                              }
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        )
                      )}
                      <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-4">
                        <div className="text-center">
                          <PhotoIcon
                            className="mx-auto h-8 w-8 text-gray-400"
                            aria-hidden="true"
                          />
                          <div className="mt-2 flex text-sm text-gray-600">
                            <label
                              htmlFor={`memory-image-${index}`}
                              className="relative cursor-pointer rounded-md bg-white font-medium text-pink-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-pink-500 focus-within:ring-offset-2 hover:text-pink-500"
                            >
                              <span>Adicionar fotos</span>
                              <input
                                id={`memory-image-${index}`}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) =>
                                  handleMemoryImageChange(index, e)
                                }
                                className="sr-only"
                              />
                            </label>
                          </div>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF até 10MB
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveMemory(index)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
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
