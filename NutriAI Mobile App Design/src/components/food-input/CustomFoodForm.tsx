import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { hapticFeedback } from '../../utils/haptics';
interface CustomFoodFormProps {
  onSave: (foodData: any) => void;
  onCancel: () => void;
}
export const CustomFoodForm: React.FC<CustomFoodFormProps> = ({
  onSave,
  onCancel
}) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [servingSize, setServingSize] = useState('');
  const [servingUnit, setServingUnit] = useState('g');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    [key: string]: string;
  }>({});
  const validateForm = () => {
    const newErrors: {
      [key: string]: string;
    } = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!servingSize.trim()) newErrors.servingSize = 'Serving size is required';
    if (!calories.trim()) newErrors.calories = 'Calories are required';
    // Validate numbers
    if (servingSize && isNaN(Number(servingSize))) {
      newErrors.servingSize = 'Must be a number';
    }
    if (calories && isNaN(Number(calories))) {
      newErrors.calories = 'Must be a number';
    }
    if (protein && isNaN(Number(protein))) {
      newErrors.protein = 'Must be a number';
    }
    if (carbs && isNaN(Number(carbs))) {
      newErrors.carbs = 'Must be a number';
    }
    if (fat && isNaN(Number(fat))) {
      newErrors.fat = 'Must be a number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = () => {
    if (validateForm()) {
      hapticFeedback.success();
      onSave({
        name,
        brand: brand || undefined,
        servingSize: {
          amount: Number(servingSize),
          unit: servingUnit
        },
        nutrition: {
          calories: Number(calories),
          protein: protein ? Number(protein) : undefined,
          carbs: carbs ? Number(carbs) : undefined,
          fat: fat ? Number(fat) : undefined
        },
        image
      });
    } else {
      hapticFeedback.error();
    }
  };
  const handleAddImage = () => {
    // In a real app, this would open the camera or file picker
    // For now, just set a placeholder image
    setImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80');
  };
  return <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Food Name*
        </label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20`} placeholder="e.g. Grilled Chicken Breast" />
        {errors.name && <p className="mt-1 text-xs text-red-500 flex items-center">
            <AlertCircle size={12} className="mr-1" /> {errors.name}
          </p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Brand (optional)
        </label>
        <input type="text" value={brand} onChange={e => setBrand(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20" placeholder="e.g. Tyson" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Serving Size*
          </label>
          <div className="flex">
            <input type="text" value={servingSize} onChange={e => setServingSize(e.target.value)} className={`flex-1 px-3 py-2 bg-white dark:bg-gray-800 border ${errors.servingSize ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20`} placeholder="100" />
            <select value={servingUnit} onChange={e => setServingUnit(e.target.value)} className="px-2 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:outline-none">
              <option value="g">g</option>
              <option value="ml">ml</option>
              <option value="oz">oz</option>
              <option value="cup">cup</option>
              <option value="tbsp">tbsp</option>
              <option value="tsp">tsp</option>
              <option value="piece">piece</option>
            </select>
          </div>
          {errors.servingSize && <p className="mt-1 text-xs text-red-500 flex items-center">
              <AlertCircle size={12} className="mr-1" /> {errors.servingSize}
            </p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Calories*
          </label>
          <input type="text" value={calories} onChange={e => setCalories(e.target.value)} className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border ${errors.calories ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20`} placeholder="150" />
          {errors.calories && <p className="mt-1 text-xs text-red-500 flex items-center">
              <AlertCircle size={12} className="mr-1" /> {errors.calories}
            </p>}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Protein (g)
          </label>
          <input type="text" value={protein} onChange={e => setProtein(e.target.value)} className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border ${errors.protein ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20`} placeholder="20" />
          {errors.protein && <p className="mt-1 text-xs text-red-500 flex items-center">
              <AlertCircle size={12} className="mr-1" /> {errors.protein}
            </p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Carbs (g)
          </label>
          <input type="text" value={carbs} onChange={e => setCarbs(e.target.value)} className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border ${errors.carbs ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20`} placeholder="0" />
          {errors.carbs && <p className="mt-1 text-xs text-red-500 flex items-center">
              <AlertCircle size={12} className="mr-1" /> {errors.carbs}
            </p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fat (g)
          </label>
          <input type="text" value={fat} onChange={e => setFat(e.target.value)} className={`w-full px-3 py-2 bg-white dark:bg-gray-800 border ${errors.fat ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20`} placeholder="8" />
          {errors.fat && <p className="mt-1 text-xs text-red-500 flex items-center">
              <AlertCircle size={12} className="mr-1" /> {errors.fat}
            </p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Image (optional)
        </label>
        {image ? <div className="relative w-full h-40 rounded-lg overflow-hidden mb-2">
            <img src={image} alt="Food" className="w-full h-full object-cover" />
            <button className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md" onClick={() => setImage(null)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div> : <motion.button className="w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center" onClick={handleAddImage} whileHover={{
        backgroundColor: 'rgba(0,0,0,0.02)'
      }} whileTap={{
        scale: 0.98
      }}>
            <Camera size={32} className="text-gray-400 dark:text-gray-500 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Add photo
            </p>
          </motion.button>}
      </div>
      <div className="flex space-x-3 pt-4">
        <Button variant="secondary" fullWidth onClick={() => {
        hapticFeedback.selection();
        onCancel();
      }}>
          Cancel
        </Button>
        <Button variant="primary" fullWidth onClick={handleSubmit}>
          Save Food
        </Button>
      </div>
    </div>;
};