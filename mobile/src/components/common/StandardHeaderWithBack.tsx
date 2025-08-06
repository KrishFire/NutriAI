import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography, spacing } from '../../constants/theme';
import * as Haptics from 'expo-haptics';
import BaseHeader from './BaseHeader';

interface StandardHeaderWithBackProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
}

const StandardHeaderWithBack: React.FC<StandardHeaderWithBackProps> = ({ 
  title, 
  subtitle, 
  onBack 
}) => {
  return (
    <BaseHeader>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => {
            Haptics.selectionAsync();
            onBack();
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={20} color="#6b7280" />
        </TouchableOpacity>
        <View style={styles.textContainer}>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>
    </BaseHeader>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.screenTitle,
  },
  subtitle: {
    ...typography.screenSubtitle,
    marginBottom: 2,
  },
});

export default StandardHeaderWithBack;