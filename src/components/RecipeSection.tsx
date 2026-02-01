import { motion } from "framer-motion";
import recipes from "@/data/recipes.json";
import { Clock, Utensils, Heart } from "lucide-react";
import { ArabicTerm } from "./ArabicTerm";

export const RecipeSection = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Suhoor recipes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🌅</span>
            <div>
              <h3 className="text-2xl font-display font-bold">
                <ArabicTerm
                  term="Suhoor"
                  arabic="سحور"
                  transliteration="Suḥūr"
                  definition="The pre-dawn meal eaten before beginning the daily fast"
                >
                  Suhoor
                </ArabicTerm>
                {" "}Recipes
              </h3>
              <p className="text-muted-foreground text-sm">Pre-dawn meals to fuel your fast</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.suhoor.slice(0, 3).map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-cultural group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary">
                    {recipe.region}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {recipe.prepTime}
                  </div>
                </div>

                <h4 className="font-display font-bold mb-2 group-hover:text-secondary transition-colors">
                  {recipe.name}
                </h4>
                <p className="text-sm text-muted-foreground mb-4">{recipe.description}</p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {recipe.ingredients.slice(0, 4).map((ingredient) => (
                    <span key={ingredient} className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {ingredient}
                    </span>
                  ))}
                  {recipe.ingredients.length > 4 && (
                    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      +{recipe.ingredients.length - 4} more
                    </span>
                  )}
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="flex items-start gap-2">
                    <Heart className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">{recipe.benefits}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Iftar recipes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🌙</span>
            <div>
              <h3 className="text-2xl font-display font-bold">
                <ArabicTerm
                  term="Iftar"
                  arabic="إفطار"
                  transliteration="Ifṭār"
                  definition="The evening meal that breaks the daily fast at sunset"
                >
                  Iftar
                </ArabicTerm>
                {" "}Recipes
              </h3>
              <p className="text-muted-foreground text-sm">Evening meals to break your fast</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.iftar.slice(0, 3).map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-cultural group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent">
                    {recipe.region}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {recipe.prepTime}
                  </div>
                </div>

                <h4 className="font-display font-bold mb-2 group-hover:text-secondary transition-colors">
                  {recipe.name}
                </h4>
                <p className="text-sm text-muted-foreground mb-4">{recipe.description}</p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {recipe.ingredients.slice(0, 4).map((ingredient) => (
                    <span key={ingredient} className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {ingredient}
                    </span>
                  ))}
                  {recipe.ingredients.length > 4 && (
                    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      +{recipe.ingredients.length - 4} more
                    </span>
                  )}
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="flex items-start gap-2">
                    <Utensils className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground italic">{recipe.tips}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
