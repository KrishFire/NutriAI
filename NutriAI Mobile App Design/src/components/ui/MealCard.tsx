import React from 'react';
interface Meal {
  id: number;
  type: string;
  time: string;
  calories: number;
  image: string;
  macros: {
    carbs: number;
    protein: number;
    fat: number;
  };
  isFavorite?: boolean;
}
interface MealCardProps {
  meal: Meal;
}
export const MealCard: React.FC<MealCardProps> = ({
  meal
}) => {
  const {
    type,
    time,
    calories,
    image,
    macros,
    isFavorite
  } = meal;
  const totalMacros = macros.carbs + macros.protein + macros.fat;
  const carbsPercentage = Math.round(macros.carbs / totalMacros * 100);
  const proteinPercentage = Math.round(macros.protein / totalMacros * 100);
  const fatPercentage = Math.round(macros.fat / totalMacros * 100);
  return <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
      <div className="flex items-center">
        <div className="w-16 h-16 rounded-lg overflow-hidden mr-3 bg-gray-100">
          <img src={image} alt={type} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <div>
              <h3 className="font-medium text-gray-900">{type}</h3>
              <p className="text-xs text-gray-500">{time}</p>
            </div>
            <span className="font-medium text-gray-900">{calories} cal</span>
          </div>
          <div className="h-2 flex rounded-full overflow-hidden bg-gray-100 mt-2">
            <div className="bg-[#FFA726]" style={{
            width: `${carbsPercentage}%`
          }}></div>
            <div className="bg-[#42A5F5]" style={{
            width: `${proteinPercentage}%`
          }}></div>
            <div className="bg-[#66BB6A]" style={{
            width: `${fatPercentage}%`
          }}></div>
          </div>
          <div className="flex text-xs mt-1 text-gray-500">
            <span className="mr-2">C: {macros.carbs}g</span>
            <span className="mr-2">P: {macros.protein}g</span>
            <span>F: {macros.fat}g</span>
          </div>
        </div>
      </div>
    </div>;
};