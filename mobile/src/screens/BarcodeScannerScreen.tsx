import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, LoadingSpinner } from '../components';
import { useAuth } from '../contexts/AuthContext';
import {
  lookupBarcode,
  nutritionInfoToMealAnalysis,
} from '../services/openFoodFacts';
import mealAIService from '../services/mealAI';
import { AddMealStackParamList } from '../types/navigation';

type BarcodeScannerScreenProps = NativeStackScreenProps<
  AddMealStackParamList,
  'BarcodeScanner'
>;

export default function BarcodeScannerScreen({
  navigation,
  route,
}: BarcodeScannerScreenProps) {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();

  // Use ref for immediate scan locking
  const isScannedRef = useRef(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);

  // Check if we're in add mode
  const { addToMeal } = route.params || {};

  const handleBarCodeScanned = async ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    // Prevent multiple scans using ref for immediate effect
    if (isScannedRef.current) return;
    isScannedRef.current = true;

    setIsProcessing(true);
    setScannedData(data);

    try {
      console.log('[BarcodeScanner] Barcode scanned:', data);

      // Lookup barcode in Open Food Facts
      const lookupResult = await lookupBarcode(data);

      if (!lookupResult.success || !lookupResult.data) {
        Alert.alert(
          'Product Not Found',
          'This product was not found in the Open Food Facts database. Try taking a photo instead.',
          [
            {
              text: 'Take Photo',
              onPress: () => {
                navigation.replace('Camera', route.params);
              },
            },
            {
              text: 'Scan Again',
              onPress: () => {
                isScannedRef.current = false;
                setScannedData(null);
                setIsProcessing(false);
              },
            },
          ]
        );
        return;
      }

      // Convert to meal analysis format
      const analysisData = nutritionInfoToMealAnalysis(lookupResult.data);

      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      if (addToMeal) {
        // Add mode: Return the scanned product to the existing meal
        navigation.navigate('MealDetails', {
          mealId: addToMeal.mealId,
          analysisData: addToMeal.existingAnalysis,
          newFoodItems: analysisData.foods,
          isAddingToExisting: true,
        });
      } else {
        // Normal mode: Create new meal
        const mealDescription = `Scanned product: ${lookupResult.data.name}`;

        // Auto-save meal
        const logResult = await mealAIService.logMeal(mealDescription, 'snack');

        if (logResult.success) {
          console.log(
            '[BarcodeScanner] Meal saved with ID:',
            logResult.mealLogId
          );
        }

        // Navigate to MealDetails
        navigation.navigate('MealDetails', {
          analysisData,
          mealId: logResult.mealLogId,
        });
      }
    } catch (error) {
      Alert.alert(
        'Scan Failed',
        error instanceof Error ? error.message : 'Failed to process barcode',
        [
          {
            text: 'OK',
            onPress: () => {
              isScannedRef.current = false;
              setScannedData(null);
              setIsProcessing(false);
            },
          },
        ]
      );
      console.error('Barcode scan error:', error);
    }
  };

  const handleScanAgain = () => {
    isScannedRef.current = false;
    setScannedData(null);
    setIsProcessing(false);
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner text="Requesting camera permission..." />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>No access to camera</Text>
          <Text style={styles.instructionText}>
            Please grant camera permission to scan barcodes
          </Text>
          <Button
            title="Grant Permission"
            onPress={requestPermission}
            variant="primary"
            style={styles.permissionButton}
          />
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="outline"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
        }}
        onBarcodeScanned={
          !isScannedRef.current ? handleBarCodeScanned : undefined
        }
      >
        <View style={styles.cameraHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {addToMeal ? 'Add Product' : 'Scan Barcode'}
          </Text>

          <View style={styles.placeholder} />
        </View>

        {/* Barcode scanning overlay */}
        <View style={styles.scannerOverlay}>
          <View style={styles.scanArea}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
          </View>

          <Text style={styles.instructionText}>
            Align barcode within the frame
          </Text>
        </View>

        {/* Processing overlay */}
        {isProcessing && (
          <View style={styles.processingOverlay}>
            <View style={styles.processingContent}>
              <LoadingIndicator size="large" color="#FFFFFF" />
              <Text style={styles.processingText}>
                {scannedData ? 'Looking up product...' : 'Processing...'}
              </Text>
              {scannedData && (
                <Text style={styles.barcodeText}>{scannedData}</Text>
              )}
            </View>
          </View>
        )}
      </CameraView>

      {/* Bottom controls when scanned */}
      {scannedData && !isProcessing && (
        <View style={styles.bottomControls}>
          <Button
            title="Scan Another"
            onPress={handleScanAgain}
            variant="primary"
            size="large"
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  permissionButton: {
    marginVertical: 16,
  },
  camera: {
    flex: 1,
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  placeholder: {
    width: 44,
    height: 44,
  },
  scannerOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanArea: {
    width: 280,
    height: 180,
    position: 'relative',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#007AFF',
    borderRadius: 2,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#007AFF',
    borderRadius: 2,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#007AFF',
    borderRadius: 2,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#007AFF',
    borderRadius: 2,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingContent: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 16,
  },
  processingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  barcodeText: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 8,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
});
