import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MealAnalysis, ChatMessage } from '../../../shared/types';
import { mealCorrectionService } from '../../services/mealCorrection';

interface MealCorrectionModalProps {
  visible: boolean;
  onClose: () => void;
  mealId: string;
  currentAnalysis: MealAnalysis;
  onCorrectionComplete: (
    newAnalysis: MealAnalysis,
    newHistory: ChatMessage[]
  ) => void;
}

interface ExampleCorrection {
  id: string;
  text: string;
  description: string;
}

const EXAMPLE_CORRECTIONS: ExampleCorrection[] = [
  {
    id: 'protein_shake',
    text: "it's a protein shake with blueberry and banana",
    description: 'Specify ingredients in drinks',
  },
  {
    id: 'portion_size',
    text: "that's actually a large portion, about 2 servings",
    description: 'Correct portion sizes',
  },
  {
    id: 'cooking_method',
    text: "it's grilled, not fried",
    description: 'Specify cooking method',
  },
  {
    id: 'brand_specific',
    text: "it's a McDonald's Big Mac",
    description: 'Identify specific brands',
  },
  {
    id: 'missing_items',
    text: "there's also avocado and ranch dressing",
    description: 'Add missing items',
  },
  {
    id: 'wrong_food',
    text: "that's quinoa, not rice",
    description: 'Correct food identification',
  },
];

/**
 * Smart Modal for AI meal corrections
 * Allows users to send natural language corrections like "it's a protein shake with blueberry and banana"
 */
export default function MealCorrectionModal({
  visible,
  onClose,
  mealId,
  currentAnalysis,
  onCorrectionComplete,
}: MealCorrectionModalProps) {
  const [correctionText, setCorrectionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textInputRef = useRef<TextInput>(null);

  const handleExamplePress = (example: ExampleCorrection) => {
    setCorrectionText(example.text);
    textInputRef.current?.focus();
  };

  const handleSubmitCorrection = async () => {
    if (!correctionText.trim()) {
      Alert.alert('Error', 'Please enter a correction message');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await mealCorrectionService.submitCorrection(
        mealId,
        correctionText
      );

      if (!result.success) {
        Alert.alert(
          'Correction Failed',
          result.error || 'Unable to process your correction. Please try again.'
        );
        return;
      }

      if (!result.newAnalysis || !result.newHistory) {
        Alert.alert('Error', 'Received invalid response from server');
        return;
      }

      console.log(
        `[MealCorrectionModal] Correction successful. New analysis has ${result.newAnalysis.foods.length} foods`
      );

      // Call parent handler with the corrected analysis
      onCorrectionComplete(result.newAnalysis, result.newHistory);

      // Reset and close modal
      setCorrectionText('');
      onClose();
    } catch (error) {
      console.error('[MealCorrectionModal] Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return; // Prevent closing during submission
    setCorrectionText('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="sparkles" size={24} color="#007AFF" />
            <Text style={styles.headerTitle}>Refine Analysis</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            disabled={isSubmitting}
          >
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Current Analysis Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Analysis</Text>
            <View style={styles.analysisCard}>
              <Text style={styles.analysisText}>
                {currentAnalysis.foods
                  .map(food => `${food.quantity} ${food.unit} ${food.name}`)
                  .join(', ')}
              </Text>
              <View style={styles.macroSummary}>
                <Text style={styles.macroText}>
                  {currentAnalysis.totalCalories} cal
                </Text>
                <Text style={styles.macroText}>
                  {currentAnalysis.totalProtein}g protein
                </Text>
                <Text style={styles.macroText}>
                  {currentAnalysis.totalCarbs}g carbs
                </Text>
                <Text style={styles.macroText}>
                  {currentAnalysis.totalFat}g fat
                </Text>
              </View>
            </View>
          </View>

          {/* Correction Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tell me what's different</Text>
            <Text style={styles.helpText}>
              Use natural language to correct the analysis. Be specific about
              ingredients, portions, or cooking methods.
            </Text>
            <TextInput
              ref={textInputRef}
              style={styles.correctionInput}
              placeholder="e.g., it's a protein shake with blueberry and banana"
              value={correctionText}
              onChangeText={setCorrectionText}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              autoFocus
              editable={!isSubmitting}
            />
          </View>

          {/* Quick Examples */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Common Corrections</Text>
            <View style={styles.examplesGrid}>
              {EXAMPLE_CORRECTIONS.map(example => (
                <TouchableOpacity
                  key={example.id}
                  style={styles.exampleCard}
                  onPress={() => handleExamplePress(example)}
                  disabled={isSubmitting}
                >
                  <Text style={styles.exampleText}>{example.text}</Text>
                  <Text style={styles.exampleDescription}>
                    {example.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleClose}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              (!correctionText.trim() || isSubmitting) &&
                styles.submitButtonDisabled,
            ]}
            onPress={handleSubmitCorrection}
            disabled={!correctionText.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="white"
                  style={styles.loadingIcon}
                />
                <Text style={styles.submitButtonText}>Refining...</Text>
              </>
            ) : (
              <>
                <Ionicons
                  name="sparkles"
                  size={16}
                  color="white"
                  style={styles.buttonIcon}
                />
                <Text style={styles.submitButtonText}>Refine Analysis</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  analysisCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  analysisText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
  },
  macroSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  helpText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  correctionInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a1a1a',
    minHeight: 80,
    maxHeight: 120,
  },
  examplesGrid: {
    gap: 12,
  },
  exampleCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  exampleText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 4,
  },
  exampleDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionBar: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    flex: 2,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  buttonIcon: {
    marginRight: 6,
  },
  loadingIcon: {
    marginRight: 8,
  },
});
