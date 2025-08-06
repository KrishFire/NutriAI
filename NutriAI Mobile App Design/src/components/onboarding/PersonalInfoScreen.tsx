import React, { useState } from 'react';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '../ui/Button';
interface PersonalInfoScreenProps {
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}
export const PersonalInfoScreen: React.FC<PersonalInfoScreenProps> = ({
  onBack,
  onNext,
  onSkip
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [sex, setSex] = useState<'male' | 'female' | ''>('');
  const [height, setHeight] = useState({
    feet: '',
    inches: ''
  });
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };
  return <div className="flex flex-col min-h-screen bg-white p-6 pb-8">
      <div className="flex items-center justify-between mb-4">
        <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center" onClick={onBack}>
          <ArrowLeftIcon size={20} />
        </button>
        <button className="text-sm text-gray-500" onClick={onSkip}>
          Skip
        </button>
      </div>
      <div className="w-full h-1 bg-gray-100 rounded-full mb-8">
        <div className="h-full bg-[#320DFF] rounded-full" style={{
        width: '20%'
      }}></div>
      </div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Let's Get to Know You</h1>
        <p className="text-gray-600">
          This helps us personalize your experience
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5 flex-1">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input id="firstName" type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]" required />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input id="lastName" type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name (optional)" className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]" />
          </div>
        </div>
        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
            Birthday
          </label>
          <input id="birthDate" type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]" required />
          <p className="text-xs text-gray-500 mt-1">
            Helps calculate your calorie needs
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Biological Sex
          </label>
          <div className="flex space-x-4">
            <button type="button" onClick={() => setSex('male')} className={`flex-1 h-12 rounded-lg border ${sex === 'male' ? 'border-[#320DFF] bg-[#320DFF]/5 text-[#320DFF]' : 'border-gray-300 text-gray-700'}`}>
              Male
            </button>
            <button type="button" onClick={() => setSex('female')} className={`flex-1 h-12 rounded-lg border ${sex === 'female' ? 'border-[#320DFF] bg-[#320DFF]/5 text-[#320DFF]' : 'border-gray-300 text-gray-700'}`}>
              Female
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Used for metabolic calculations
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Height
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input type="number" value={height.feet} onChange={e => setHeight({
              ...height,
              feet: e.target.value
            })} placeholder="Feet" className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]" required />
            </div>
            <div>
              <input type="number" value={height.inches} onChange={e => setHeight({
              ...height,
              inches: e.target.value
            })} placeholder="Inches" className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]" required />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Weight
          </label>
          <div className="flex space-x-4">
            <div className="flex-1">
              <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Weight" className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]" required />
            </div>
            <div className="w-24">
              <div className="flex h-12 rounded-lg overflow-hidden border border-gray-300">
                <button type="button" onClick={() => setWeightUnit('lbs')} className={`flex-1 flex items-center justify-center ${weightUnit === 'lbs' ? 'bg-[#320DFF] text-white' : 'bg-white text-gray-700'}`}>
                  lbs
                </button>
                <button type="button" onClick={() => setWeightUnit('kg')} className={`flex-1 flex items-center justify-center ${weightUnit === 'kg' ? 'bg-[#320DFF] text-white' : 'bg-white text-gray-700'}`}>
                  kg
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="pt-4">
          <Button onClick={onNext} variant="primary" fullWidth>
            Continue
          </Button>
        </div>
      </form>
    </div>;
};