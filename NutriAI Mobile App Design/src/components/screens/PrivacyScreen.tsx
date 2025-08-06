import React, { useState } from 'react';
import { ArrowLeftIcon, ShieldIcon, EyeIcon, LockIcon } from 'lucide-react';
import { PageTransition } from '../ui/PageTransition';
interface PrivacyScreenProps {
  onBack: () => void;
}
export const PrivacyScreen: React.FC<PrivacyScreenProps> = ({
  onBack
}) => {
  const [dataSharing, setDataSharing] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const [personalization, setPersonalization] = useState(true);
  return <PageTransition>
      <div className="flex flex-col min-h-screen bg-white pb-6">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4" onClick={onBack}>
            <ArrowLeftIcon size={20} />
          </button>
          <h1 className="text-2xl font-bold">Privacy</h1>
        </div>
        <div className="px-4 py-4">
          {/* Privacy Overview */}
          <div className="bg-[#320DFF]/5 rounded-xl p-4 mb-6">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-[#320DFF]/20 flex items-center justify-center mr-3">
                <ShieldIcon size={20} className="text-[#320DFF]" />
              </div>
              <h2 className="font-medium">Your Privacy Matters</h2>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Control how your data is used and shared. Your nutrition data is
              always encrypted and secure.
            </p>
            <button className="text-sm text-[#320DFF] font-medium">
              View Privacy Policy
            </button>
          </div>
          {/* Privacy Settings */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-6">
            <h2 className="font-medium mb-4">Privacy Settings</h2>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#66BB6A]/10 flex items-center justify-center mr-3">
                    <EyeIcon size={20} className="text-[#66BB6A]" />
                  </div>
                  <div>
                    <p className="font-medium">Data Sharing</p>
                    <p className="text-xs text-gray-500">
                      Share data with third-party services
                    </p>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${dataSharing ? 'bg-[#320DFF]' : 'bg-gray-300'}`} onClick={() => setDataSharing(!dataSharing)}>
                  <div className="w-4 h-4 rounded-full bg-white transition-transform duration-300" style={{
                  transform: dataSharing ? 'translateX(24px)' : 'translateX(0)'
                }} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#FFA726]/10 flex items-center justify-center mr-3">
                    <LockIcon size={20} className="text-[#FFA726]" />
                  </div>
                  <div>
                    <p className="font-medium">Analytics</p>
                    <p className="text-xs text-gray-500">
                      Help us improve by sharing usage data
                    </p>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${analytics ? 'bg-[#320DFF]' : 'bg-gray-300'}`} onClick={() => setAnalytics(!analytics)}>
                  <div className="w-4 h-4 rounded-full bg-white transition-transform duration-300" style={{
                  transform: analytics ? 'translateX(24px)' : 'translateX(0)'
                }} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#42A5F5]/10 flex items-center justify-center mr-3">
                    <ShieldIcon size={20} className="text-[#42A5F5]" />
                  </div>
                  <div>
                    <p className="font-medium">Personalization</p>
                    <p className="text-xs text-gray-500">
                      Allow AI to personalize your experience
                    </p>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${personalization ? 'bg-[#320DFF]' : 'bg-gray-300'}`} onClick={() => setPersonalization(!personalization)}>
                  <div className="w-4 h-4 rounded-full bg-white transition-transform duration-300" style={{
                  transform: personalization ? 'translateX(24px)' : 'translateX(0)'
                }} />
                </div>
              </div>
            </div>
          </div>
          {/* Data Management */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <h2 className="font-medium mb-4">Data Management</h2>
            <div className="space-y-3">
              <button className="w-full py-3 text-left border-b border-gray-100">
                Download My Data
              </button>
              <button className="w-full py-3 text-left border-b border-gray-100">
                Delete Browsing History
              </button>
              <button className="w-full py-3 text-left text-red-500">
                Delete All My Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>;
};