import React, { useState } from 'react';
import { ArrowLeftIcon, BookmarkIcon, Share2Icon, EditIcon, PlusIcon, ChevronDownIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '../ui/PageTransition';
import { Button } from '../ui/Button';
import { hapticFeedback } from '../../utils/haptics';
import { useTheme } from '../../utils/theme';
interface RecipeDetailScreenProps {
  recipe: any;
  onBack: () => void;
  onEdit: (recipe: any) => void;
  onAddToLog: (recipe: any) => void;
}
export const RecipeDetailScreen: React.FC<RecipeDetailScreenProps> = ({
  recipe,
  onBack,
  onEdit,
  onAddToLog
}) => {
  const {
    colors,
    isDark
  } = useTheme();
  const [isFavorite, setIsFavorite] = useState(true);
  const [showIngredients, setShowIngredients] = useState(true);
  const [servingSize, setServingSize] = useState(recipe.servings);
  const toggleFavorite = () => {
    hapticFeedback.impact();
    setIsFavorite(!isFavorite);
  };
  const handleAddToLog = () => {
    hapticFeedback.success();
    onAddToLog(recipe);
  };
  const handleEdit = () => {
    hapticFeedback.selection();
    onEdit(recipe);
  };
  const adjustServingSize = (delta: number) => {
    const newSize = servingSize + delta;
    if (newSize >= 1) {
      hapticFeedback.selection();
      setServingSize(newSize);
    }
  };
  // Calculate nutrition based on serving size
  const calculateNutrition = (value: number) => {
    const ratio = servingSize / recipe.servings;
    return Math.round(value * ratio);
  };
  return <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 pb-6">
        {/* Header with Image */}
        <div className="relative h-64 w-full">
          <motion.img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" initial={{
          opacity: 0.8,
          scale: 1.1
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.5
        }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <motion.button className="absolute top-12 left-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center" onClick={() => {
          hapticFeedback.selection();
          onBack();
        }} whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }}>
            <ArrowLeftIcon size={20} className="text-white" />
          </motion.button>
          <div className="absolute top-12 right-4 flex space-x-2">
            <motion.button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center" onClick={toggleFavorite} whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }}>
              <BookmarkIcon size={20} className={isFavorite ? 'text-[#320DFF] dark:text-[#6D56FF] fill-[#320DFF] dark:fill-[#6D56FF]' : 'text-white'} />
            </motion.button>
            <motion.button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center" whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }}>
              <Share2Icon size={20} className="text-white" />
            </motion.button>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-2xl font-bold text-white mb-1">
              {recipe.name}
            </h1>
            <div className="flex items-center text-white/80 text-sm">
              <span>{recipe.ingredients.length} ingredients</span>
            </div>
          </div>
        </div>
        {/* Recipe Content */}
        <div className="px-4 py-6">
          {/* Nutrition Summary */}
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-medium text-gray-900 dark:text-white">
                Nutrition
              </h2>
              <div className="flex items-center">
                <motion.button className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center" onClick={() => adjustServingSize(-1)} disabled={servingSize <= 1} whileHover={{
                scale: 1.1
              }} whileTap={{
                scale: 0.9
              }}>
                  <span className="text-gray-700 dark:text-gray-300 font-bold">
                    -
                  </span>
                </motion.button>
                <span className="mx-3 font-medium text-gray-900 dark:text-white">
                  {servingSize} {servingSize === 1 ? 'serving' : 'servings'}
                </span>
                <motion.button className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center" onClick={() => adjustServingSize(1)} whileHover={{
                scale: 1.1
              }} whileTap={{
                scale: 0.9
              }}>
                  <span className="text-gray-700 dark:text-gray-300 font-bold">
                    +
                  </span>
                </motion.button>
              </div>
            </div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-gray-500 dark:text-gray-400">Calories</p>
              <p className="font-bold text-gray-900 dark:text-white">
                {calculateNutrition(recipe.calories)}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Carbs
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {calculateNutrition(recipe.carbs)}g
                </p>
                <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                  <motion.div className="h-full bg-[#FFA726]" initial={{
                  width: 0
                }} animate={{
                  width: `${recipe.carbs / (recipe.carbs + recipe.protein + recipe.fat) * 100}%`
                }} transition={{
                  duration: 0.8
                }}></motion.div>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Protein
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {calculateNutrition(recipe.protein)}g
                </p>
                <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                  <motion.div className="h-full bg-[#42A5F5]" initial={{
                  width: 0
                }} animate={{
                  width: `${recipe.protein / (recipe.carbs + recipe.protein + recipe.fat) * 100}%`
                }} transition={{
                  duration: 0.8,
                  delay: 0.1
                }}></motion.div>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Fat
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {calculateNutrition(recipe.fat)}g
                </p>
                <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                  <motion.div className="h-full bg-[#66BB6A]" initial={{
                  width: 0
                }} animate={{
                  width: `${recipe.fat / (recipe.carbs + recipe.protein + recipe.fat) * 100}%`
                }} transition={{
                  duration: 0.8,
                  delay: 0.2
                }}></motion.div>
                </div>
              </div>
            </div>
          </div>
          {/* Ingredients */}
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm mb-6">
            <motion.button className="w-full flex justify-between items-center" onClick={() => {
            hapticFeedback.selection();
            setShowIngredients(!showIngredients);
          }}>
              <h2 className="font-medium text-gray-900 dark:text-white">
                Ingredients
              </h2>
              <motion.div animate={{
              rotate: showIngredients ? 180 : 0
            }} transition={{
              duration: 0.3
            }}>
                <ChevronDownIcon size={20} className="text-gray-500 dark:text-gray-400" />
              </motion.div>
            </motion.button>
            <AnimatePresence>
              {showIngredients && <motion.div initial={{
              height: 0,
              opacity: 0
            }} animate={{
              height: 'auto',
              opacity: 1
            }} exit={{
              height: 0,
              opacity: 0
            }} transition={{
              duration: 0.3
            }} className="overflow-hidden">
                  <div className="mt-4 space-y-2">
                    {recipe.ingredients.map((ingredient: any, index: number) => <div key={ingredient.id} className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-[#320DFF] dark:bg-[#6D56FF] mr-3"></div>
                          <p className="text-gray-700 dark:text-gray-300">
                            {ingredient.name}
                          </p>
                        </div>)}
                  </div>
                </motion.div>}
            </AnimatePresence>
          </div>
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <motion.button className="flex-1 h-12 flex items-center justify-center space-x-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300" onClick={handleEdit} whileHover={{
            scale: 1.02
          }} whileTap={{
            scale: 0.98
          }}>
              <EditIcon size={18} />
              <span>Edit</span>
            </motion.button>
            <Button variant="primary" fullWidth onClick={handleAddToLog} icon={<PlusIcon size={18} />}>
              Add to Log
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>;
};