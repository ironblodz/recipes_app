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
            <main className="flex-1">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  path="/"
                  element={
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                      <Home />
                    </div>
                  }
                />
                <Route
                  path="/recipes"
                  element={
                    <PrivateRoute>
                      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                        <Recipes />
                      </div>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/recipes/:id"
                  element={
                    <PrivateRoute>
                      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                        <RecipeDetail />
                      </div>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/recipes/:id/edit"
                  element={
                    <PrivateRoute>
                      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                        <EditRecipe />
                      </div>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/new-recipe"
                  element={
                    <PrivateRoute>
                      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                        <NewRecipe />
                      </div>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                        <Profile />
                      </div>
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
