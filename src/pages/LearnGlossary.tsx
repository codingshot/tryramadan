import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, BookOpen, Volume2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import glossaryData from "@/data/glossary.json";

const LearnGlossary = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const categories = [...new Set(glossaryData.glossary.map(item => item.category))];
  
  const filteredTerms = glossaryData.glossary.filter(item => {
    const matchesSearch = 
      item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.arabic.includes(searchQuery) ||
      item.definition.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link 
            to="/dashboard/learn" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Learn
          </Link>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              Islamic Glossary
              <span className="block font-arabic text-lg text-secondary mt-1">المصطلحات الإسلامية</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Learn essential Arabic and Islamic terms with English definitions
            </p>
          </motion.div>
          
          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search terms in English or Arabic..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-background focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
              />
            </div>
          </motion.div>
          
          {/* Category filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap gap-2 mb-8"
          >
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                !selectedCategory 
                  ? 'bg-secondary text-secondary-foreground' 
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  selectedCategory === category 
                    ? 'bg-secondary text-secondary-foreground' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>
          
          {/* Glossary terms */}
          <div className="space-y-4">
            {filteredTerms.map((item, index) => (
              <motion.div
                key={item.term}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.03 }}
                className="p-5 rounded-2xl bg-card border border-border hover:border-secondary/50 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-display font-bold text-xl">{item.term}</h3>
                      <span className="font-arabic text-2xl text-secondary">{item.arabic}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Volume2 className="w-4 h-4" />
                      <span className="italic">{item.pronunciation}</span>
                      <span className="px-2 py-0.5 rounded-full bg-muted text-xs">{item.category}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-muted-foreground">{item.definition}</p>
              </motion.div>
            ))}
            
            {filteredTerms.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No terms found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LearnGlossary;
