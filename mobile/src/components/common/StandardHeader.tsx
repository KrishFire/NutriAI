import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { typography } from '../../constants/theme';
import BaseHeader from './BaseHeader';

interface StandardHeaderProps {
  title: string;
  subtitle?: string;
}

const StandardHeader: React.FC<StandardHeaderProps> = ({ title, subtitle }) => {
  return (
    <BaseHeader>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      <Text style={styles.title}>{title}</Text>
    </BaseHeader>
  );
};

const styles = StyleSheet.create({
  title: {
    ...typography.screenTitle,
  },
  subtitle: {
    ...typography.screenSubtitle,
    marginBottom: 2,
  },
});

export default StandardHeader;