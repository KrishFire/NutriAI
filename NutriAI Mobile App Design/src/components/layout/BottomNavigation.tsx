import React from 'react';
import { HomeIcon, PlusIcon, CalendarIcon, LineChartIcon, UserIcon } from 'lucide-react';
interface BottomNavigationProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}
export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentScreen,
  onNavigate
}) => {
  const navItems = [{
    id: 'home',
    icon: HomeIcon,
    label: 'Home'
  }, {
    id: 'history',
    icon: CalendarIcon,
    label: 'History'
  }, {
    id: 'log',
    icon: PlusIcon,
    label: 'Log',
    primary: true
  }, {
    id: 'insights',
    icon: LineChartIcon,
    label: 'Insights'
  }, {
    id: 'profile',
    icon: UserIcon,
    label: 'Profile'
  }];
  return <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-16 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center px-2 z-50">
      {navItems.map(item => {
      const isActive = currentScreen === item.id;
      const isPrimary = item.primary;
      if (isPrimary) {
        return <button key={item.id} className={`flex flex-col items-center justify-center p-2 w-16 h-16 -mt-6 rounded-full bg-[#320DFF] text-white shadow-lg`} onClick={() => onNavigate(item.id)}>
              <item.icon size={24} strokeWidth={2} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>;
      }
      return <button key={item.id} className={`flex flex-col items-center justify-center p-2 w-16 h-full ${isActive ? 'text-[#320DFF]' : 'text-gray-500'}`} onClick={() => onNavigate(item.id)}>
            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className={`text-xs mt-1 ${isActive ? 'font-medium' : ''}`}>
              {item.label}
            </span>
          </button>;
    })}
    </div>;
};