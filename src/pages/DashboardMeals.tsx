import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, Coffee, Utensils, Clock, ChefHat, ShoppingCart, 
  ChevronRight, Flame, Droplets, Plus
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import recipesData from "@/data/recipes.json";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const DashboardMeals = () => {
  const [activeTab, setActiveTab] = useState<'suhoor' | 'iftar'>('suhoor');
  const [selectedRecipes, setSelectedRecipes] = useState<number[]>([]);
  
  const recipes = activeTab === 'suhoor' ? recipesData.suhoor : recipesData.iftar;
  
  const toggleRecipe = (id: number) => {
    setSelectedRecipes(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };
  
  // Generate grocery list from selected recipes
  const groceryList = recipes
    .filter(r => selectedRecipes.includes(r.id))
    .flatMap(r => r.ingredients);
  
  const uniqueGroceries = [...new Set(groceryList)];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              Meal Planning
              <span className="block font-arabic text-lg text-secondary mt-1">تخطيط الوجبات</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Nutritious recipes for Suhoor and Iftar from around the world
            </p>
          </motion.div>
          
          {/* Tab switcher */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2 mb-8"
          >
            <button
              onClick={() => setActiveTab('suhoor')}
              className={`flex-1 p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 ${
                activeTab === 'suhoor' 
                  ? 'border-secondary bg-secondary/10' 
                  : 'border-border hover:border-secondary/50'
              }`}
            >
              <Coffee className="w-5 h-5" />
              <div className="text-left">
                <span className="font-bold block">Suhoor</span>
                <span className="text-xs text-muted-foreground font-arabic">السحور</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('iftar')}
              className={`flex-1 p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 ${
                activeTab === 'iftar' 
                  ? 'border-secondary bg-secondary/10' 
                  : 'border-border hover:border-secondary/50'
              }`}
            >
              <Utensils className="w-5 h-5" />
              <div className="text-left">
                <span className="font-bold block">Iftar</span>
                <span className="text-xs text-muted-foreground font-arabic">الإفطار</span>
              </div>
            </button>
          </motion.div>
          
          {/* Meal tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-border mb-8"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{activeTab === 'suhoor' ? '🌙' : '🌅'}</span>
              <div>
                {activeTab === 'suhoor' ? (
                  <>
                    <p className="font-medium">Suhoor Tips • نصائح السحور</p>
                    <p className="text-sm text-muted-foreground">
                      Eat protein-rich foods and complex carbs for sustained energy. Drink plenty of water!
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">Iftar Tips • نصائح الإفطار</p>
                    <p className="text-sm text-muted-foreground">
                      Break your fast with dates and water. Don't overeat - start small and eat slowly.
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
          
          {/* Recipe cards */}
          <div className="space-y-4 mb-8">
            {recipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                  selectedRecipes.includes(recipe.id)
                    ? 'bg-secondary/10 border-secondary'
                    : 'bg-card border-border hover:border-secondary/50'
                }`}
                onClick={() => toggleRecipe(recipe.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display font-bold text-lg">{recipe.name}</h3>
                    <span className="text-sm text-secondary">{recipe.region}</span>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className={`p-2 rounded-full transition-colors ${
                        selectedRecipes.includes(recipe.id)
                          ? 'bg-secondary text-secondary-foreground'
                          : 'bg-muted'
                      }`}>
                        <Plus className={`w-4 h-4 transition-transform ${
                          selectedRecipes.includes(recipe.id) ? 'rotate-45' : ''
                        }`} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {selectedRecipes.includes(recipe.id) ? 'Remove from meal plan' : 'Add to meal plan'}
                    </TooltipContent>
                  </Tooltip>
                </div>
                
                <p className="text-muted-foreground text-sm mb-4">{recipe.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {recipe.ingredients.slice(0, 5).map((ingredient, i) => (
                    <span key={i} className="px-2 py-1 rounded-full bg-muted text-xs">
                      {ingredient}
                    </span>
                  ))}
                  {recipe.ingredients.length > 5 && (
                    <span className="px-2 py-1 rounded-full bg-muted text-xs">
                      +{recipe.ingredients.length - 5} more
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {recipe.prepTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="w-4 h-4" />
                    {recipe.benefits.split(' ').slice(0, 3).join(' ')}...
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-secondary">💡 {recipe.tips}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Grocery List */}
          {uniqueGroceries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-card border border-border"
            >
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="w-5 h-5 text-secondary" />
                <h3 className="font-display font-bold">
                  Grocery List • قائمة التسوق
                </h3>
                <span className="text-sm text-muted-foreground">({uniqueGroceries.length} items)</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {uniqueGroceries.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DashboardMeals;
