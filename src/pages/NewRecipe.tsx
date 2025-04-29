import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import {
  PhotoIcon,
  HeartIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
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

const occasions = ["Doces", "Salgados"];

const preparationSubSteps = [
  "Bolo",
  "Cobertura",
  "Caldas",
  "Montagem",
  "Outros",
];

export default function NewRecipe() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState<
    Array<{ name: string; quantity: string }>
  >([{ name: "", quantity: "" }]);
  const [instructions, setInstructions] = useState([
    { step: "", subStep: "Bolo" },
  ]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [occasion, setOccasion] = useState("Doces");
  const [memories, setMemories] = useState<
    Array<{ text: string; imageUrl?: string }>
  >([{ text: "" }]);
  const [memoryImages, setMemoryImages] = useState<Array<File | null>>([null]);
  const [memoryImagePreviews, setMemoryImagePreviews] = useState<Array<string>>(
    [""]
  );
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "" }]);
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
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
    setMemories([...memories, { text: "" }]);
    setMemoryImages([...memoryImages, null]);
    setMemoryImagePreviews([...memoryImagePreviews, ""]);
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
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("A imagem deve ter menos de 10MB");
        return;
      }
      const newMemoryImages = [...memoryImages];
      newMemoryImages[index] = file;
      setMemoryImages(newMemoryImages);

      const reader = new FileReader();
      reader.onloadend = () => {
        const newMemoryImagePreviews = [...memoryImagePreviews];
        newMemoryImagePreviews[index] = reader.result as string;
        setMemoryImagePreviews(newMemoryImagePreviews);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMemoryTextChange = (index: number, value: string) => {
    const newMemories = [...memories];
    newMemories[index] = {
      ...newMemories[index],
      text: value,
    };
    setMemories(newMemories);
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
    if (!currentUser) return;

    setLoading(true);
    try {
      let imageUrl = "";

      if (imageFile) {
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
      const memoryImageUrls: string[] = [];
      for (let i = 0; i < memoryImages.length; i++) {
        const memoryImage = memoryImages[i];
        if (memoryImage) {
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
            memoryImageUrls[i] = url;
          } catch (error) {
            console.error("Error uploading memory image:", error);
            toast.error("Erro ao fazer upload da imagem da memória");
            setLoading(false);
            return;
          }
        }
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
        memories: memories.map((memory, index) => ({
          text: memory.text,
          imageUrl: memoryImageUrls[index],
        })),
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "recipes"), recipeData);
      toast.success("Receita criada com sucesso!");
      navigate("/recipes");
    } catch (error) {
      console.error("Error creating recipe:", error);
      toast.error("Erro ao criar receita");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-16">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <motion.div variants={item}>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Criar Nova Receita
          </h1>
          <p className="text-gray-600">
            Partilhe as suas receitas do dia a dia ou momentos especiais
          </p>
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
                  <div className="mt-4 flex text-sm text-gray-600">
                    <label
                      htmlFor="image"
                      className="relative cursor-pointer rounded-md bg-white font-medium text-pink-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-pink-500 focus-within:ring-offset-2 hover:text-pink-500"
                    >
                      <span>Carregar imagem</span>
                      <input
                        id="image"
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">ou arraste e solte</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF até 10MB
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
              <div className="mt-2 space-y-4">
                {memories.map((memory, index) => (
                  <div key={index} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={memory.text}
                          onChange={(e) =>
                            handleMemoryTextChange(index, e.target.value)
                          }
                          className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-pink-500 focus:ring-pink-500"
                          placeholder={`Memória ${index + 1}`}
                        />
                      </div>
                      <div className="w-full sm:w-48">
                        <div className="mt-1 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-4">
                          <div className="text-center">
                            {memoryImagePreviews[index] ? (
                              <div className="relative">
                                <img
                                  src={memoryImagePreviews[index]}
                                  alt="Preview"
                                  className="mx-auto h-24 w-24 object-cover rounded-lg"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newMemoryImagePreviews = [
                                      ...memoryImagePreviews,
                                    ];
                                    newMemoryImagePreviews[index] = "";
                                    setMemoryImagePreviews(
                                      newMemoryImagePreviews
                                    );
                                    const newMemoryImages = [...memoryImages];
                                    newMemoryImages[index] = null;
                                    setMemoryImages(newMemoryImages);
                                  }}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                  ×
                                </button>
                              </div>
                            ) : (
                              <PhotoIcon
                                className="mx-auto h-8 w-8 text-gray-400"
                                aria-hidden="true"
                              />
                            )}
                            <div className="mt-2 flex text-sm text-gray-600">
                              <label
                                htmlFor={`memory-image-${index}`}
                                className="relative cursor-pointer rounded-md bg-white font-medium text-pink-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-pink-500 focus-within:ring-offset-2 hover:text-pink-500"
                              >
                                <span>Carregar imagem</span>
                                <input
                                  id={`memory-image-${index}`}
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleMemoryImageChange(index, e)
                                  }
                                  className="sr-only"
                                />
                              </label>
                              <p className="pl-1">ou arraste e solte</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF até 10MB
                            </p>
                          </div>
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
              onClick={() => navigate("/recipes")}
              className="px-6 py-3 text-base font-medium rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors duration-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="group relative px-6 py-3 text-base font-medium rounded-lg text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform translate-x-0 -skew-x-12 group-hover:translate-x-full group-hover:skew-x-12 bg-gradient-to-r from-purple-600 to-pink-600"></span>
              <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform -translate-x-full skew-x-12 group-hover:translate-x-0 group-hover:skew-x-12 bg-gradient-to-r from-pink-600 to-purple-600"></span>
              <span className="relative flex items-center justify-center">
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <>
                    <HeartIcon className="h-5 w-5 mr-2" />
                    Criar Receita
                  </>
                )}
              </span>
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
