import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { FoodItem } from '../../services/openai';

interface FoodItemCardProps {
  food: FoodItem;
  onUpdate: (updatedFood: FoodItem) => void;
  onRemove: () => void;
}

export function FoodItemCard({ food, onUpdate, onRemove }: FoodItemCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFood, setEditedFood] = useState(food);

  const handleSave = () => {
    onUpdate(editedFood);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedFood(food);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <View style={styles.card}>
        <View style={styles.editHeader}>
          <TextInput
            style={styles.nameInput}
            value={editedFood.name}
            onChangeText={text => setEditedFood({ ...editedFood, name: text })}
            placeholder="Food name"
            accessibilityLabel="Food name"
            accessibilityHint="Enter the name of the food item"
          />
          <View style={styles.editActions}>
            <TouchableOpacity
              onPress={handleSave}
              style={styles.saveButton}
              accessibilityLabel="Save changes"
              accessibilityRole="button"
              accessibilityHint="Save your edits to this food item"
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCancel}
              style={styles.cancelButton}
              accessibilityLabel="Cancel editing"
              accessibilityRole="button"
              accessibilityHint="Cancel editing and discard changes"
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.nutritionGrid}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>Quantity</Text>
            <TextInput
              style={styles.nutritionInput}
              value={editedFood.quantity}
              onChangeText={text => setEditedFood({ ...editedFood, quantity: text })}
              placeholder="e.g., 1 cup"
              accessibilityLabel="Quantity"
              accessibilityHint="Enter the quantity of this food item"
            />
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>Calories</Text>
            <TextInput
              style={styles.nutritionInput}
              value={String(editedFood.calories || '')}
              onChangeText={text =>
                setEditedFood({ ...editedFood, calories: parseInt(text) || 0 })
              }
              keyboardType="numeric"
              placeholder="0"
              accessibilityLabel="Calories"
              accessibilityHint="Enter the number of calories"
            />
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>Protein (g)</Text>
            <TextInput
              style={styles.nutritionInput}
              value={String(editedFood.protein || '')}
              onChangeText={text =>
                setEditedFood({ ...editedFood, protein: parseInt(text) || 0 })
              }
              keyboardType="numeric"
              placeholder="0"
              accessibilityLabel="Protein in grams"
              accessibilityHint="Enter the amount of protein in grams"
            />
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>Carbs (g)</Text>
            <TextInput
              style={styles.nutritionInput}
              value={String(editedFood.carbs || '')}
              onChangeText={text =>
                setEditedFood({ ...editedFood, carbs: parseInt(text) || 0 })
              }
              keyboardType="numeric"
              placeholder="0"
              accessibilityLabel="Carbohydrates in grams"
              accessibilityHint="Enter the amount of carbohydrates in grams"
            />
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>Fat (g)</Text>
            <TextInput
              style={styles.nutritionInput}
              value={String(editedFood.fat || '')}
              onChangeText={text =>
                setEditedFood({ ...editedFood, fat: parseInt(text) || 0 })
              }
              keyboardType="numeric"
              placeholder="0"
              accessibilityLabel="Fat in grams"
              accessibilityHint="Enter the amount of fat in grams"
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.foodName}>{food.name}</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            style={styles.editButton}
            accessibilityLabel={`Edit ${food.name}`}
            accessibilityRole="button"
            accessibilityHint="Edit this food item's details"
          >
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onRemove}
            style={styles.removeButton}
            accessibilityLabel={`Remove ${food.name}`}
            accessibilityRole="button"
            accessibilityHint="Remove this food item from the meal"
          >
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.quantity}>{food.quantity || '1 serving'}</Text>
      <View style={styles.nutritionInfo}>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{food.calories || 0}</Text>
          <Text style={styles.nutritionLabel}>cal</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{food.protein || 0}g</Text>
          <Text style={styles.nutritionLabel}>protein</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{food.carbs || 0}g</Text>
          <Text style={styles.nutritionLabel}>carbs</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionValue}>{food.fat || 0}g</Text>
          <Text style={styles.nutritionLabel}>fat</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  quantity: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
  },
  editText: {
    fontSize: 14,
    color: '#4B5563',
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
  },
  removeText: {
    fontSize: 14,
    color: '#DC2626',
  },
  nutritionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  editHeader: {
    marginBottom: 16,
  },
  nameInput: {
    fontSize: 16,
    fontWeight: '600',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#320DFF',
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
  },
  cancelText: {
    color: '#4B5563',
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  nutritionInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
    minWidth: 80,
  },
});