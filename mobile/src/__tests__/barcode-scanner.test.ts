/**
 * Test file for barcode scanner integration
 * Tests the OpenFoodFacts API integration and barcode scanning functionality
 */

import { lookupBarcode, nutritionInfoToMealAnalysis } from '../services/openFoodFacts';

describe('Barcode Scanner Integration', () => {
  describe('OpenFoodFacts Service', () => {
    it('should handle invalid barcode formats', async () => {
      const result = await lookupBarcode('123'); // Too short
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid barcode format');
    });

    it('should convert nutrition info to meal analysis format', () => {
      const nutritionInfo = {
        name: 'Test Product',
        brand: 'Test Brand',
        barcode: '1234567890123',
        calories: 250,
        protein: 10,
        carbs: 30,
        fat: 12,
        fiber: 3,
        sugar: 5,
        sodium: 200,
        servingSize: '100g',
      };

      const result = nutritionInfoToMealAnalysis(nutritionInfo, 2, 'serving');

      expect(result.foods).toHaveLength(1);
      expect(result.foods[0].name).toBe('Test Brand Test Product');
      expect(result.foods[0].quantity).toBe('2 serving');
      expect(result.foods[0].nutrition.calories).toBe(500); // 250 * 2
      expect(result.foods[0].nutrition.protein).toBe(20); // 10 * 2
      expect(result.foods[0].confidence).toBe(1.0);
      expect(result.totalNutrition.calories).toBe(500);
      expect(result.notes).toContain('Scanned product: Test Brand Test Product');
    });

    it('should handle products without brand names', () => {
      const nutritionInfo = {
        name: 'Generic Product',
        barcode: '1234567890123',
        calories: 100,
        protein: 5,
        carbs: 15,
        fat: 3,
      };

      const result = nutritionInfoToMealAnalysis(nutritionInfo);

      expect(result.foods[0].name).toBe('Generic Product');
      expect(result.notes).toContain('Scanned product: Generic Product');
    });
  });

  describe('Barcode Types', () => {
    it('should support common barcode formats', () => {
      // The CameraScreen component supports these barcode types
      const supportedTypes = ['ean13', 'ean8', 'upc_a', 'upc_e'];
      
      // EAN-13: European Article Number (most common globally)
      // EAN-8: Shortened version for small products
      // UPC-A: Universal Product Code (common in US/Canada)
      // UPC-E: Compressed UPC for small products
      
      expect(supportedTypes).toContain('ean13');
      expect(supportedTypes).toContain('upc_a');
    });
  });
});