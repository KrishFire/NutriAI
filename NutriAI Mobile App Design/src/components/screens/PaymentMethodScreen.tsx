import React, { useState } from 'react';
import { ArrowLeftIcon, CreditCardIcon, PlusIcon, CheckIcon } from 'lucide-react';
import { PageTransition } from '../ui/PageTransition';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
interface PaymentMethodScreenProps {
  onBack: () => void;
}
export const PaymentMethodScreen: React.FC<PaymentMethodScreenProps> = ({
  onBack
}) => {
  const [paymentMethods, setPaymentMethods] = useState([{
    id: 1,
    type: 'visa',
    lastFour: '4242',
    expiry: '12/25',
    isDefault: true
  }, {
    id: 2,
    type: 'mastercard',
    lastFour: '8888',
    expiry: '06/24',
    isDefault: false
  }]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleSetDefault = (id: number) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
  };
  const handleAddCard = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowAddCard(false);
      // Simulate adding a new card
      setPaymentMethods([...paymentMethods, {
        id: Date.now(),
        type: 'visa',
        lastFour: '1234',
        expiry: '09/26',
        isDefault: false
      }]);
    }, 1500);
  };
  return <PageTransition>
      <div className="flex flex-col min-h-screen bg-white pb-6">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4" onClick={onBack}>
            <ArrowLeftIcon size={20} />
          </button>
          <h1 className="text-2xl font-bold">Payment Methods</h1>
        </div>
        <div className="px-4 py-4">
          <div className="space-y-4 mb-6">
            {paymentMethods.map(method => <motion.div key={method.id} className="border border-gray-100 rounded-xl p-4 shadow-sm" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.3
          }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      <CreditCardIcon size={20} className="text-gray-700" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className="font-medium capitalize">{method.type}</p>
                        <p className="text-xs bg-gray-100 px-2 py-0.5 rounded ml-2">
                          •••• {method.lastFour}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        Expires {method.expiry}
                      </p>
                    </div>
                  </div>
                  {method.isDefault ? <div className="bg-[#320DFF]/10 text-[#320DFF] text-xs font-medium px-3 py-1 rounded-full">
                      Default
                    </div> : <button className="text-xs text-[#320DFF]" onClick={() => handleSetDefault(method.id)}>
                      Set as default
                    </button>}
                </div>
              </motion.div>)}
          </div>
          {!showAddCard ? <Button onClick={() => setShowAddCard(true)} variant="secondary" fullWidth>
              <PlusIcon size={18} className="mr-2" />
              Add Payment Method
            </Button> : <motion.div className="border border-gray-200 rounded-xl p-4" initial={{
          opacity: 0,
          height: 0
        }} animate={{
          opacity: 1,
          height: 'auto'
        }} transition={{
          duration: 0.3
        }}>
              <h3 className="font-medium mb-4">Add New Card</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input type="text" placeholder="1234 5678 9012 3456" className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiration Date
                    </label>
                    <input type="text" placeholder="MM/YY" className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVC
                    </label>
                    <input type="text" placeholder="123" className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]" />
                  </div>
                </div>
                <div className="flex space-x-3 pt-2">
                  <Button onClick={handleAddCard} variant="primary" fullWidth isLoading={isLoading}>
                    <CheckIcon size={18} className="mr-2" />
                    Save Card
                  </Button>
                  <Button onClick={() => setShowAddCard(false)} variant="secondary" fullWidth>
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>}
        </div>
      </div>
    </PageTransition>;
};