import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import NewRecipe from "./pages/NewRecipe";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Home />} />
              <Route
                path="/recipes"
                element={
                  <PrivateRoute>
                    <Recipes />
                  </PrivateRoute>
                }
              />
              <Route
                path="/recipes/:id"
                element={
                  <PrivateRoute>
                    <RecipeDetail />
                  </PrivateRoute>
                }
              />
              <Route
                path="/new-recipe"
                element={
                  <PrivateRoute>
                    <NewRecipe />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
