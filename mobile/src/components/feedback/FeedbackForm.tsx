import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal } from 'react-native';
import { MessageSquare, Star, X, Send } from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';
import { Button } from '../ui/Button';
import { hapticFeedback } from '../../utils/haptics';

interface FeedbackFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (feedback: {
    rating: number;
    comment: string;
    contactInfo?: string;
  }) => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [step, setStep] = useState<'rating' | 'comment'>('rating');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContactField, setShowContactField] = useState(false);

  const handleRatingSelect = (selectedRating: number) => {
    hapticFeedback.selection();
    setRating(selectedRating);
  };

  const handleNextStep = () => {
    hapticFeedback.selection();
    setStep('comment');
  };

  const handleSubmit = () => {
    if (comment.trim() === '') return;

    hapticFeedback.success();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      onSubmit({
        rating,
        comment,
        contactInfo: contactInfo.trim() !== '' ? contactInfo : undefined,
      });
      setIsSubmitting(false);
      // Reset form
      setRating(0);
      setComment('');
      setContactInfo('');
      setStep('rating');
      setShowContactField(false);
    }, 1000);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 bg-black/50 justify-center items-center px-4"
        activeOpacity={1}
        onPress={onClose}
      >
        <MotiView
          from={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl overflow-hidden"
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={e => e.stopPropagation()}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <View className="flex-row items-center">
                <MessageSquare
                  size={20}
                  className="text-primary dark:text-[#6D56FF] mr-2"
                />
                <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                  Share Your Feedback
                </Text>
              </View>
              <TouchableOpacity className="p-1 rounded-full" onPress={onClose}>
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View className="p-6">
              <AnimatePresence>
                {step === 'rating' ? (
                  <MotiView
                    key="rating-step"
                    from={{ opacity: 0, translateX: -20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    exit={{ opacity: 0, translateX: 20 }}
                  >
                    <Text className="text-gray-600 dark:text-gray-300 mb-6">
                      How would you rate your experience with our app?
                    </Text>
                    <View className="flex-row justify-center space-x-2 mb-8">
                      {[1, 2, 3, 4, 5].map(star => (
                        <TouchableOpacity
                          key={star}
                          className={`w-12 h-12 rounded-full items-center justify-center ${
                            rating >= star
                              ? 'bg-primary/10 dark:bg-[#6D56FF]/20'
                              : 'bg-gray-100 dark:bg-gray-700'
                          }`}
                          onPress={() => handleRatingSelect(star)}
                        >
                          <Star
                            size={24}
                            color={rating >= star ? '#320DFF' : '#9CA3AF'}
                            fill={rating >= star ? '#320DFF' : 'transparent'}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                    <Button
                      variant="primary"
                      onPress={handleNextStep}
                      disabled={rating === 0}
                      className="w-full"
                    >
                      <Text className="text-white font-medium">Continue</Text>
                    </Button>
                  </MotiView>
                ) : (
                  <MotiView
                    key="comment-step"
                    from={{ opacity: 0, translateX: 20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    exit={{ opacity: 0, translateX: -20 }}
                  >
                    <Text className="text-gray-600 dark:text-gray-300 mb-4">
                      Please share your thoughts with us:
                    </Text>
                    <TextInput
                      className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-4"
                      multiline
                      numberOfLines={4}
                      placeholder="What do you like or dislike? Any suggestions for improvement?"
                      placeholderTextColor="#9CA3AF"
                      value={comment}
                      onChangeText={setComment}
                      textAlignVertical="top"
                    />

                    <TouchableOpacity
                      className="mb-4"
                      onPress={() => setShowContactField(!showContactField)}
                    >
                      <Text className="text-primary dark:text-[#6D56FF] text-sm">
                        {showContactField
                          ? 'Hide contact field'
                          : 'Add contact information (optional)'}
                      </Text>
                    </TouchableOpacity>

                    <AnimatePresence>
                      {showContactField && (
                        <MotiView
                          from={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mb-4"
                        >
                          <TextInput
                            className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="Email or phone number (optional)"
                            placeholderTextColor="#9CA3AF"
                            value={contactInfo}
                            onChangeText={setContactInfo}
                          />
                        </MotiView>
                      )}
                    </AnimatePresence>

                    <View className="flex-row space-x-3">
                      <Button
                        variant="secondary"
                        onPress={() => setStep('rating')}
                        disabled={isSubmitting}
                        className="flex-1"
                      >
                        <Text className="text-gray-700 font-medium">Back</Text>
                      </Button>
                      <Button
                        variant="primary"
                        onPress={handleSubmit}
                        disabled={comment.trim() === '' || isSubmitting}
                        loading={isSubmitting}
                        className="flex-1"
                      >
                        <View className="flex-row items-center">
                          <Send size={16} color="white" className="mr-2" />
                          <Text className="text-white font-medium">Submit</Text>
                        </View>
                      </Button>
                    </View>
                  </MotiView>
                )}
              </AnimatePresence>
            </View>
          </TouchableOpacity>
        </MotiView>
      </TouchableOpacity>
    </Modal>
  );
};
