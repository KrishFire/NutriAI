import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, User, Calendar, Edit2 } from 'lucide-react-native';
import MotiView from 'moti';
import { hapticFeedback } from '../../utils/haptics';
import { Button } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';

interface PersonalInfo {
  name: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  height: string;
  weight: string;
}

export default function PersonalInfoScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editField, setEditField] = useState<keyof PersonalInfo | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Mock data - in real app, this would come from user profile
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: user?.user_metadata?.full_name || 'Alex Johnson',
    email: user?.email || 'alex.johnson@example.com',
    dateOfBirth: 'January 15, 1990',
    gender: 'Male',
    height: "5'10\" (178 cm)",
    weight: '165 lbs (75 kg)',
  });

  const openEditModal = (field: keyof PersonalInfo) => {
    hapticFeedback.selection();
    setEditField(field);
    setTempValue(personalInfo[field]);
    setIsEditModalVisible(true);
  };

  const handleSave = async () => {
    if (!editField) return;
    
    hapticFeedback.success();
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setPersonalInfo(prev => ({
      ...prev,
      [editField]: tempValue,
    }));
    
    setIsSaving(false);
    setIsEditModalVisible(false);
    setEditField(null);
    setTempValue('');
  };

  const InfoItem = ({ 
    label, 
    value, 
    field,
    editable = false 
  }: { 
    label: string; 
    value: string; 
    field?: keyof PersonalInfo;
    editable?: boolean;
  }) => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 300 }}
      className="mb-4"
    >
      <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </Text>
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-medium text-gray-900 dark:text-white flex-1">
          {value}
        </Text>
        {editable && field && (
          <TouchableOpacity
            onPress={() => openEditModal(field)}
            className="p-2"
          >
            <Edit2 size={16} className="text-primary-600 dark:text-primary-400" />
          </TouchableOpacity>
        )}
      </View>
    </MotiView>
  );

  const getInputType = (field: keyof PersonalInfo) => {
    switch (field) {
      case 'email':
        return 'email-address';
      case 'weight':
      case 'height':
        return 'numeric';
      default:
        return 'default';
    }
  };

  const getFieldLabel = (field: keyof PersonalInfo) => {
    const labels: Record<keyof PersonalInfo, string> = {
      name: 'Full Name',
      email: 'Email Address',
      dateOfBirth: 'Date of Birth',
      gender: 'Gender',
      height: 'Height',
      weight: 'Weight',
    };
    return labels[field];
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="flex-row items-center justify-between px-4 py-4">
        <TouchableOpacity
          onPress={() => {
            hapticFeedback.selection();
            navigation.goBack();
          }}
          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center"
        >
          <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">
          Personal Information
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 py-4">
          {/* Profile Section */}
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 400 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6"
          >
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center mr-3">
                <User size={24} className="text-primary-600 dark:text-primary-400" />
              </View>
              <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                Profile Details
              </Text>
            </View>
            
            <InfoItem 
              label="Name" 
              value={personalInfo.name} 
              field="name"
              editable 
            />
            <InfoItem 
              label="Email" 
              value={personalInfo.email} 
              field="email"
              editable={false} 
            />
            <InfoItem 
              label="Date of Birth" 
              value={personalInfo.dateOfBirth} 
              field="dateOfBirth"
              editable 
            />
            <InfoItem 
              label="Gender" 
              value={personalInfo.gender} 
              field="gender"
              editable 
            />
          </MotiView>

          {/* Body Measurements Section */}
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'timing', duration: 400, delay: 100 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4"
          >
            <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Body Measurements
            </Text>
            
            <InfoItem 
              label="Height" 
              value={personalInfo.height} 
              field="height"
              editable 
            />
            <InfoItem 
              label="Weight" 
              value={personalInfo.weight} 
              field="weight"
              editable 
            />
          </MotiView>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <TouchableOpacity
            className="flex-1 bg-black/50"
            activeOpacity={1}
            onPress={() => setIsEditModalVisible(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              className="mt-auto bg-white dark:bg-gray-800 rounded-t-3xl p-6"
              onPress={(e) => e.stopPropagation()}
            >
              <View className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full self-center mb-6" />
              
              <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Edit {editField ? getFieldLabel(editField) : ''}
              </Text>
              
              <TextInput
                className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-lg text-gray-900 dark:text-white mb-6"
                value={tempValue}
                onChangeText={setTempValue}
                keyboardType={editField ? getInputType(editField) : 'default'}
                autoFocus
                placeholder={`Enter ${editField ? getFieldLabel(editField).toLowerCase() : ''}`}
                placeholderTextColor="#9ca3af"
              />
              
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg"
                  onPress={() => {
                    hapticFeedback.selection();
                    setIsEditModalVisible(false);
                  }}
                >
                  <Text className="text-center text-gray-700 dark:text-gray-300 font-medium">
                    Cancel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="flex-1 py-3 bg-primary-600 dark:bg-primary-500 rounded-lg"
                  onPress={handleSave}
                  disabled={isSaving}
                >
                  <Text className="text-center text-white font-medium">
                    {isSaving ? 'Saving...' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}