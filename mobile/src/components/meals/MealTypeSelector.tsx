import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

interface MealTypeSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectMealType: (mealType: string) => void;
  currentMealType?: string;
}

const mealTypes = [
  { id: 'breakfast', label: 'Breakfast', icon: '🍳' },
  { id: 'lunch', label: 'Lunch', icon: '🥗' },
  { id: 'dinner', label: 'Dinner', icon: '🍽️' },
  { id: 'snack', label: 'Snack', icon: '🍎' },
];

export function MealTypeSelector({
  visible,
  onClose,
  onSelectMealType,
  currentMealType,
}: MealTypeSelectorProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Save to which meal?</Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                accessibilityLabel="Close meal selector"
                accessibilityRole="button"
                accessibilityHint="Close without selecting a meal"
              >
                <Text style={styles.closeText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.mealTypes}>
              {mealTypes.map(meal => (
                <TouchableOpacity
                  key={meal.id}
                  style={[
                    styles.mealTypeCard,
                    currentMealType === meal.id && styles.selectedMealType,
                  ]}
                  onPress={() => onSelectMealType(meal.id)}
                  accessibilityLabel={`${meal.label} meal`}
                  accessibilityRole="button"
                  accessibilityHint={`Save food to ${meal.label}`}
                  accessibilityState={{ selected: currentMealType === meal.id }}
                >
                  <Text style={styles.mealIcon}>{meal.icon}</Text>
                  <Text
                    style={[
                      styles.mealLabel,
                      currentMealType === meal.id && styles.selectedMealLabel,
                    ]}
                  >
                    {meal.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 16,
    color: '#6B7280',
  },
  mealTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mealTypeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedMealType: {
    borderColor: '#320DFF',
    backgroundColor: '#EBF4FF',
  },
  mealIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  mealLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  selectedMealLabel: {
    color: '#320DFF',
  },
});