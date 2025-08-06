import React from 'react';
import { ArrowLeftIcon, UserIcon } from 'lucide-react';
import { PageTransition } from '../ui/PageTransition';
interface PersonalInfoScreenProps {
  onBack: () => void;
}
export const PersonalInfoScreen: React.FC<PersonalInfoScreenProps> = ({
  onBack
}) => {
  return <PageTransition>
      <div className="flex flex-col min-h-screen bg-white pb-6">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4" onClick={onBack}>
            <ArrowLeftIcon size={20} />
          </button>
          <h1 className="text-2xl font-bold">Personal Information</h1>
        </div>
        <div className="px-4 py-4">
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-[#320DFF]/10 flex items-center justify-center mr-3">
                  <UserIcon size={20} className="text-[#320DFF]" />
                </div>
                <h2 className="font-medium">Profile Details</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">Alex Johnson</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">alex.johnson@example.com</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">January 15, 1990</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium">Male</p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <h2 className="font-medium mb-3">Body Measurements</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Height</p>
                  <p className="font-medium">5'10" (178 cm)</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Weight</p>
                  <p className="font-medium">165 lbs (75 kg)</p>
                </div>
              </div>
            </div>
            <button className="w-full py-3 text-center text-[#320DFF] font-medium">
              Edit Information
            </button>
          </div>
        </div>
      </div>
    </PageTransition>;
};