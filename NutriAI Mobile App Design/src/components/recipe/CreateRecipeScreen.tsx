import React, { useState } from 'react';
import { ArrowLeftIcon, PlusIcon, XIcon, CameraIcon, BookmarkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '../ui/PageTransition';
import { Button } from '../ui/Button';
import { hapticFeedback } from '../../utils/haptics';
import { useTheme } from '../../utils/theme';
interface CreateRecipeScreenProps {
  onBack: () => void;
  onSave: (recipe: any) => void;
}
export const CreateRecipeScreen: React.FC<CreateRecipeScreenProps> = ({
  onBack,
  onSave
}) => {
  const {
    colors,
    isDark
  } = useTheme();
  const [recipeName, setRecipeName] = useState('');
  const [recipeImage, setRecipeImage] = useState<string | null>(null);
  const [servings, setServings] = useState('1');
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const handleAddIngredient = () => {
    if (currentIngredient.trim()) {
      hapticFeedback.selection();
      setIngredients([...ingredients, {
        name: currentIngredient,
        id: Date.now()
      }]);
      setCurrentIngredient('');
    }
  };
  const handleRemoveIngredient = (id: number) => {
    hapticFeedback.impact();
    setIngredients(ingredients.filter(item => item.id !== id));
  };
  const handleSave = () => {
    if (!recipeName.trim() || ingredients.length === 0) return;
    hapticFeedback.success();
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      const newRecipe = {
        id: Date.now(),
        name: recipeName,
        image: recipeImage,
        servings: parseInt(servings),
        ingredients: ingredients,
        calories: 450,
        protein: 30,
        carbs: 45,
        fat: 15
      };
      setIsSaving(false);
      onSave(newRecipe);
    }, 1500);
  };
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        setRecipeImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  return <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 pb-6">
        <div className="px-4 pt-12 pb-4 flex items-center justify-between">
          <div className="flex items-center">
            <motion.button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4" onClick={() => {
            hapticFeedback.selection();
            onBack();
          }} whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }}>
              <ArrowLeftIcon size={20} className="text-gray-700 dark:text-gray-300" />
            </motion.button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Create Recipe
            </h1>
          </div>
          <motion.button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center" whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }}>
            <BookmarkIcon size={20} className="text-gray-700 dark:text-gray-300" />
          </motion.button>
        </div>
        <div className="px-4 py-4 flex-1">
          <div className="space-y-6">
            {/* Recipe Image */}
            <div className="mb-4">
              {recipeImage ? <div className="relative w-full h-48 rounded-xl overflow-hidden">
                  <img src={recipeImage} alt="Recipe" className="w-full h-full object-cover" />
                  <motion.button className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center" onClick={() => setRecipeImage(null)} whileHover={{
                scale: 1.1
              }} whileTap={{
                scale: 0.9
              }}>
                    <XIcon size={16} className="text-white" />
                  </motion.button>
                </div> : <label className="block w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2">
                    <CameraIcon size={24} className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Add Recipe Photo
                  </span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>}
            </div>
            {/* Recipe Name */}
            <div>
              <label htmlFor="recipeName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Recipe Name
              </label>
              <input id="recipeName" type="text" value={recipeName} onChange={e => setRecipeName(e.target.value)} placeholder="E.g., Homemade Granola" className="w-full h-12 px-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20 focus:border-[#320DFF] dark:focus:border-[#6D56FF]" />
            </div>
            {/* Servings */}
            <div>
              <label htmlFor="servings" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Servings
              </label>
              <input id="servings" type="number" min="1" value={servings} onChange={e => setServings(e.target.value)} className="w-full h-12 px-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20 focus:border-[#320DFF] dark:focus:border-[#6D56FF]" />
            </div>
            {/* Ingredients */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ingredients
              </label>
              <div className="flex mb-3">
                <input type="text" value={currentIngredient} onChange={e => setCurrentIngredient(e.target.value)} placeholder="Add ingredient" className="flex-1 h-12 px-4 border border-gray-300 dark:border-gray-700 rounded-l-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20 focus:border-[#320DFF] dark:focus:border-[#6D56FF]" onKeyPress={e => e.key === 'Enter' && handleAddIngredient()} />
                <motion.button className="h-12 px-4 bg-[#320DFF] dark:bg-[#6D56FF] text-white rounded-r-lg flex items-center justify-center" onClick={handleAddIngredient} whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }} disabled={!currentIngredient.trim()}>
                  <PlusIcon size={20} />
                </motion.button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <AnimatePresence>
                  {ingredients.map(ingredient => <motion.div key={ingredient.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg" initial={{
                  opacity: 0,
                  y: 10
                }} animate={{
                  opacity: 1,
                  y: 0
                }} exit={{
                  opacity: 0,
                  x: -10
                }} transition={{
                  duration: 0.2
                }}>
                      <span className="text-gray-800 dark:text-gray-200">
                        {ingredient.name}
                      </span>
                      <motion.button className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center" onClick={() => handleRemoveIngredient(ingredient.id)} whileHover={{
                    scale: 1.1
                  }} whileTap={{
                    scale: 0.9
                  }}>
                        <XIcon size={14} className="text-gray-500 dark:text-gray-400" />
                      </motion.button>
                    </motion.div>)}
                </AnimatePresence>
                {ingredients.length === 0 && <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                    No ingredients added yet
                  </p>}
              </div>
            </div>
          </div>
        </div>
        <div className="px-4">
          <Button variant="primary" fullWidth onClick={handleSave} disabled={!recipeName.trim() || ingredients.length === 0 || isSaving} loading={isSaving}>
            {isSaving ? 'Saving Recipe...' : 'Save Recipe'}
          </Button>
        </div>
      </div>
    </PageTransition>;
};