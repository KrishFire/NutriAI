import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { PageTransition } from '@/components/ui/PageTransition';
import { GlassMorphism } from '@/components/ui/GlassMorphism';
import { Berry } from '@/components/ui/Berry';
import { StandardHeaderWithBack } from '@/components/common';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';

interface CreateRecipeScreenProps {
  onBack: () => void;
  onSave: (recipe: any) => void;
}

export function CreateRecipeScreen({
  onBack,
  onSave,
}: CreateRecipeScreenProps) {
  const [recipeName, setRecipeName] = useState('');
  const [recipeImage, setRecipeImage] = useState<string | null>(null);
  const [servings, setServings] = useState('1');
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddIngredient = () => {
    if (currentIngredient.trim()) {
      Haptics.selectionAsync();
      setIngredients([
        ...ingredients,
        {
          name: currentIngredient.trim(),
          id: Date.now(),
        },
      ]);
      setCurrentIngredient('');
    }
  };

  const handleRemoveIngredient = (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIngredients(ingredients.filter(item => item.id !== id));
  };

  const handleSave = async () => {
    if (!recipeName.trim()) {
      Alert.alert('Missing Information', 'Please enter a recipe name');
      return;
    }

    if (ingredients.length === 0) {
      Alert.alert('Missing Information', 'Please add at least one ingredient');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      const newRecipe = {
        id: Date.now(),
        name: recipeName.trim(),
        image: recipeImage,
        servings: parseInt(servings) || 1,
        ingredients: ingredients,
        calories: 450,
        protein: 30,
        carbs: 45,
        fat: 15,
      };
      setIsSaving(false);
      onSave(newRecipe);
    }, 1500);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setRecipeImage(result.assets[0].uri);
      Haptics.selectionAsync();
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setRecipeImage(result.assets[0].uri);
      Haptics.selectionAsync();
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Recipe Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  return (
    <PageTransition>
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          {/* Header */}
          <View className="px-4 pt-6 pb-6 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => {
                  Haptics.selectionAsync();
                  onBack();
                }}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mr-4"
              >
                <Ionicons name="arrow-back" size={20} color="#6b7280" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-gray-900 dark:text-white">
                Create Recipe
              </Text>
            </View>
            <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center">
              <Ionicons name="bookmark-outline" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="flex-1 px-4"
            showsVerticalScrollIndicator={false}
          >
            <View className="space-y-6 pb-6">
              {/* Recipe Image */}
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 100 }}
              >
                {recipeImage ? (
                  <View className="relative w-full h-48 rounded-xl overflow-hidden">
                    <Image
                      source={{ uri: recipeImage }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.selectionAsync();
                        setRecipeImage(null);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 items-center justify-center"
                    >
                      <Ionicons name="close" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={showImageOptions}
                    className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center"
                  >
                    <View className="items-center">
                      <View className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-2">
                        <Ionicons name="camera" size={24} color="#9ca3af" />
                      </View>
                      <Text className="text-sm text-gray-500 dark:text-gray-400">
                        Add Recipe Photo
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </MotiView>

              {/* Recipe Name */}
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 200 }}
              >
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Recipe Name
                </Text>
                <TextInput
                  value={recipeName}
                  onChangeText={setRecipeName}
                  placeholder="E.g., Homemade Granola"
                  placeholderTextColor="#9ca3af"
                  className="w-full h-12 px-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </MotiView>

              {/* Servings */}
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 300 }}
              >
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Servings
                </Text>
                <TextInput
                  value={servings}
                  onChangeText={setServings}
                  keyboardType="numeric"
                  placeholder="1"
                  placeholderTextColor="#9ca3af"
                  className="w-full h-12 px-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </MotiView>

              {/* Ingredients */}
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 400 }}
              >
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ingredients
                </Text>
                <View className="flex-row mb-3">
                  <TextInput
                    value={currentIngredient}
                    onChangeText={setCurrentIngredient}
                    placeholder="Add ingredient"
                    placeholderTextColor="#9ca3af"
                    onSubmitEditing={handleAddIngredient}
                    returnKeyType="done"
                    className="flex-1 h-12 px-4 border border-gray-300 dark:border-gray-700 rounded-l-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <TouchableOpacity
                    onPress={handleAddIngredient}
                    disabled={!currentIngredient.trim()}
                    className={`h-12 px-4 rounded-r-lg items-center justify-center ${
                      currentIngredient.trim()
                        ? 'bg-primary-600 dark:bg-primary-500'
                        : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <Ionicons
                      name="add"
                      size={20}
                      color={currentIngredient.trim() ? 'white' : '#9ca3af'}
                    />
                  </TouchableOpacity>
                </View>

                <View className="space-y-2 max-h-60">
                  <AnimatePresence>
                    {ingredients.map((ingredient, index) => (
                      <MotiView
                        key={ingredient.id}
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        exit={{ opacity: 0, translateX: -10 }}
                        transition={{ duration: 200 }}
                        className="flex-row items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <Text className="text-gray-800 dark:text-gray-200">
                          {ingredient.name}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleRemoveIngredient(ingredient.id)}
                          className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 items-center justify-center"
                        >
                          <Ionicons name="close" size={14} color="#9ca3af" />
                        </TouchableOpacity>
                      </MotiView>
                    ))}
                  </AnimatePresence>

                  {ingredients.length === 0 && (
                    <View className="py-4 items-center">
                      <Berry variant="thinking" size="sm" animate />
                      <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        No ingredients added yet
                      </Text>
                    </View>
                  )}
                </View>
              </MotiView>
            </View>
          </ScrollView>

          {/* Save Button */}
          <View className="px-4 pb-4">
            <Button
              onPress={handleSave}
              variant="primary"
              fullWidth
              disabled={
                !recipeName.trim() || ingredients.length === 0 || isSaving
              }
              loading={isSaving}
            >
              {isSaving ? 'Saving Recipe...' : 'Save Recipe'}
            </Button>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </PageTransition>
  );
}
