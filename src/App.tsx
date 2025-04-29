import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Recipes from "./pages/Recipes";
import RecipeDetail from "./pages/RecipeDetail";
import NewRecipe from "./pages/NewRecipe";
import EditRecipe from "./pages/EditRecipe";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="flex min-h-[calc(100vh-4rem)]">
            <main className="flex-1 w-full px-0 sm:px-6 lg:px-8">
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
                  path="/recipes/:id/edit"
                  element={
                    <PrivateRoute>
                      <EditRecipe />
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
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </main>
          </div>
          <Toaster position="bottom-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
