import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { 
  ArrowLeft, 
  Camera, 
  Mic, 
  Barcode, 
  Keyboard, 
  Star 
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { hapticFeedback } from '../utils/haptics';
import { RootStackParamList } from '../types/navigation';

type RouteParams = RouteProp<RootStackParamList, 'AddMoreScreen'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddMoreScreen'>;

interface InputMethod {
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  backgroundColor: string;
  action: () => void;
  description: string;
}

export default function AddMoreScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteParams>();
  
  // Get the existing meal data from navigation params
  const { currentMealData, description, mealId } = route.params || {};

  const handleCamera = () => {
    hapticFeedback.selection();
    // Navigate to camera screen with addMore flag
    navigation.navigate('CameraInput', {
      returnToAddMore: true,
      existingMealData: currentMealData,
      description,
      mealId,
    } as any);
  };

  const handleVoice = () => {
    hapticFeedback.selection();
    // Navigate to voice input screen with addMore flag
    navigation.navigate('VoiceLog', {
      returnToAddMore: true,
      existingMealData: currentMealData,
      description,
      mealId,
    } as any);
  };

  const handleBarcode = () => {
    hapticFeedback.selection();
    // Navigate to barcode scanner with addMore flag
    navigation.navigate('BarcodeInput', {
      returnToAddMore: true,
      existingMealData: currentMealData,
      description,
      mealId,
    } as any);
  };

  const handleText = () => {
    hapticFeedback.selection();
    // Navigate to text input screen with addMore flag
    navigation.navigate('TextInput', {
      returnToAddMore: true,
      existingMealData: currentMealData,
      description,
      mealId,
    } as any);
  };

  const handleFavorites = () => {
    hapticFeedback.selection();
    // Favorites feature not implemented yet
    Alert.alert('Coming Soon', 'Favorites feature will be available soon!');
  };

  const inputMethods: InputMethod[] = [
    {
      name: 'Camera',
      icon: Camera,
      color: '#4CAF50',
      backgroundColor: 'rgba(76, 175, 80, 0.08)',
      action: handleCamera,
      description: 'Take a photo of your food',
    },
    {
      name: 'Voice',
      icon: Mic,
      color: '#2196F3',
      backgroundColor: 'rgba(33, 150, 243, 0.08)',
      action: handleVoice,
      description: 'Describe your food with your voice',
    },
    {
      name: 'Barcode',
      icon: Barcode,
      color: '#9C27B0',
      backgroundColor: 'rgba(156, 39, 176, 0.08)',
      action: handleBarcode,
      description: 'Scan a product barcode',
    },
    {
      name: 'Text',
      icon: Keyboard,
      color: '#FF9800',
      backgroundColor: 'rgba(255, 152, 0, 0.08)',
      action: handleText,
      description: 'Type what you ate',
    },
    {
      name: 'Favorites',
      icon: Star,
      color: '#F44336',
      backgroundColor: 'rgba(244, 67, 54, 0.08)',
      action: handleFavorites,
      description: 'Add from your favorites',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            hapticFeedback.selection();
            navigation.goBack();
          }}
          style={styles.backButton}
        >
          <ArrowLeft size={20} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>Add More Food</Text>
          <Text style={styles.subtitle}>Choose how to add more items</Text>
        </View>
      </View>

      {/* Input Methods */}
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.methodsContainer}>
          {inputMethods.map((method, index) => (
            <MotiView
              key={method.name}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: index * 100 }}
            >
              <TouchableOpacity
                style={styles.methodButton}
                onPress={method.action}
                activeOpacity={0.7}
              >
                <View 
                  style={[
                    styles.iconContainer, 
                    { backgroundColor: method.backgroundColor }
                  ]}
                >
                  <method.icon size={24} color={method.color} strokeWidth={2} />
                </View>
                <View style={styles.methodTextContainer}>
                  <Text style={styles.methodName}>{method.name}</Text>
                  <Text style={styles.methodDescription}>{method.description}</Text>
                </View>
              </TouchableOpacity>
            </MotiView>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  methodsContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 16,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
});