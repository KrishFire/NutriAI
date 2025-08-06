import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NutritionData } from '../../services/openai';

interface NutritionSummaryProps {
  nutrition: NutritionData;
  title?: string;
}

export function NutritionSummary({ nutrition, title = 'Total Nutrition' }: NutritionSummaryProps) {
  const nutritionItems = [
    { label: 'Calories', value: nutrition.calories, unit: '', color: '#320DFF' },
    { label: 'Protein', value: nutrition.protein, unit: 'g', color: '#DC2626' },
    { label: 'Carbs', value: nutrition.carbs, unit: 'g', color: '#16A34A' },
    { label: 'Fat', value: nutrition.fat, unit: 'g', color: '#F59E0B' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.nutritionGrid}>
        {nutritionItems.map((item, index) => (
          <View key={item.label} style={styles.nutritionItem}>
            <View style={[styles.colorDot, { backgroundColor: item.color }]} />
            <Text style={styles.nutritionValue}>
              {item.value || 0}{item.unit}
            </Text>
            <Text style={styles.nutritionLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
    flex: 1,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  nutritionValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
});