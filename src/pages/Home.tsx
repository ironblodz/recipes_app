import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
  const { currentUser } = useAuth();

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Bem-vinda ao Receitas da Joana
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        A tua aplicação privada de receitas favoritas ❤️
      </p>
      {!currentUser ? (
        <Link
          to="/login"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Entrar para ver suas receitas
        </Link>
      ) : (
        <Link
          to="/recipes"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Ver minhas receitas
        </Link>
      )}
    </div>
  );
}
