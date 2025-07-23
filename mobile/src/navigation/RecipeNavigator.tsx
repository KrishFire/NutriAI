import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RecipeStackParamList } from '@/types/navigation';
import { RecipeListScreen, RecipeDetailScreen, CreateRecipeScreen } from '@/screens/recipe';

const Stack = createNativeStackNavigator<RecipeStackParamList>();

export function RecipeNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="RecipeList">
        {() => (
          <RecipeListScreen
            onBack={() => {
              // Handle navigation back
            }}
            onCreateRecipe={() => {
              // Navigate to CreateRecipe
            }}
            onSelectRecipe={(recipe) => {
              // Navigate to RecipeDetail with recipe
            }}
          />
        )}
      </Stack.Screen>
      
      <Stack.Screen name="RecipeDetail">
        {({ route }) => (
          <RecipeDetailScreen
            recipe={route.params.recipe}
            onBack={() => {
              // Handle navigation back
            }}
            onEdit={(recipe) => {
              // Navigate to EditRecipe
            }}
            onAddToLog={(recipe) => {
              // Handle adding to meal log
            }}
          />
        )}
      </Stack.Screen>
      
      <Stack.Screen name="CreateRecipe">
        {() => (
          <CreateRecipeScreen
            onBack={() => {
              // Handle navigation back
            }}
            onSave={(recipe) => {
              // Handle save and navigate back
            }}
          />
        )}
      </Stack.Screen>
      
      <Stack.Screen name="EditRecipe">
        {({ route }) => (
          <CreateRecipeScreen
            onBack={() => {
              // Handle navigation back
            }}
            onSave={(recipe) => {
              // Handle update and navigate back
            }}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}