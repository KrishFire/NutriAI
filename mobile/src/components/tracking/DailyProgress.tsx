import { View, Text, StyleSheet } from 'react-native';
import { MACRO_COLORS } from '../../constants';
import MacroRing from './MacroRing';
import Card from '../common/Card';

interface DailyProgressProps {
  calories: { current: number; target: number };
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fat: { current: number; target: number };
}

export default function DailyProgress({
  calories,
  protein,
  carbs,
  fat,
}: DailyProgressProps) {
  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Today's Progress</Text>

      <View style={styles.mainRingContainer}>
        <MacroRing
          current={calories.current}
          target={calories.target}
          label="Calories"
          color={MACRO_COLORS.CALORIES}
          size={160}
          strokeWidth={12}
          showPercentage={false}
        />
      </View>

      <View style={styles.macroRingsContainer}>
        <MacroRing
          current={protein.current}
          target={protein.target}
          label="Protein"
          color={MACRO_COLORS.PROTEIN}
          size={80}
          strokeWidth={6}
        />
        <MacroRing
          current={carbs.current}
          target={carbs.target}
          label="Carbs"
          color={MACRO_COLORS.CARBS}
          size={80}
          strokeWidth={6}
        />
        <MacroRing
          current={fat.current}
          target={fat.target}
          label="Fat"
          color={MACRO_COLORS.FAT}
          size={80}
          strokeWidth={6}
        />
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          {calories.current} of {calories.target} calories
        </Text>
        <Text style={styles.remainingText}>
          {Math.max(0, calories.target - calories.current)} remaining
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  mainRingContainer: {
    marginBottom: 20,
  },
  macroRingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  summaryContainer: {
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  remainingText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
});
