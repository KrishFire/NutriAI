import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { WheelPicker } from 'react-native-ui-lib';
import { hapticFeedback } from '../../utils/haptics';

const BRAND_COLOR = '#320DFF';

// Helper to get the number of days in a month
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month, 0).getDate();
};

// Generate month names
const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

interface CustomDatePickerProps {
  initialDate?: Date;
  onDateChange?: (date: Date) => void;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  initialDate = new Date(2005, 0, 1),
  onDateChange,
}) => {
  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(
    initialDate.getMonth() + 1
  );
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate());

  // Generate year items (from current year going back 100 years)
  const yearItems = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 100 }, (_, i) => {
      const year = currentYear - i;
      return { label: `${year}`, value: year };
    });
  }, []);

  // Generate month items
  const monthItems = useMemo(() => {
    return monthNames.map((month, index) => ({
      label: month,
      value: index + 1,
    }));
  }, []);

  // IMPORTANT: Recalculate days when month or year changes
  const daysInMonth = useMemo(() => {
    return getDaysInMonth(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  const dayItems = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return { label: `${day}`, value: day };
    });
  }, [daysInMonth]);

  // Clamp selected day if it's out of bounds for the new month
  useEffect(() => {
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [daysInMonth, selectedDay]);

  // Notify parent component when date values change
  const handleYearChange = (value: number) => {
    // Use impact feedback for more pronounced haptic
    hapticFeedback.impact();
    setSelectedYear(value);
    const newDate = new Date(value, selectedMonth - 1, selectedDay);
    onDateChange?.(newDate);
  };

  const handleMonthChange = (value: number) => {
    // Use impact feedback for more pronounced haptic
    hapticFeedback.impact();
    setSelectedMonth(value);
    const newDate = new Date(selectedYear, value - 1, selectedDay);
    onDateChange?.(newDate);
  };

  const handleDayChange = (value: number) => {
    // Use impact feedback for more pronounced haptic
    hapticFeedback.impact();
    setSelectedDay(value);
    const newDate = new Date(selectedYear, selectedMonth - 1, value);
    onDateChange?.(newDate);
  };

  return (
    <View style={styles.container}>
      <View style={styles.pickerWrapper}>
        <Text style={styles.label}>Month</Text>
        <View style={styles.wheelContainer}>
          <WheelPicker
            items={monthItems}
            selectedValue={selectedMonth}
            onChange={(value: number) => handleMonthChange(value)}
            numberOfVisibleRows={5}
            activeTextColor={BRAND_COLOR}
            inactiveTextColor="#9CA3AF"
            textStyle={styles.pickerText}
            itemHeight={44}
            containerStyle={styles.wheel}
          />
        </View>
      </View>

      <View style={styles.pickerWrapper}>
        <Text style={styles.label}>Day</Text>
        <View style={styles.wheelContainer}>
          <WheelPicker
            items={dayItems}
            selectedValue={selectedDay}
            onChange={(value: number) => handleDayChange(value)}
            numberOfVisibleRows={5}
            activeTextColor={BRAND_COLOR}
            inactiveTextColor="#9CA3AF"
            textStyle={styles.pickerText}
            itemHeight={44}
            containerStyle={styles.wheel}
          />
        </View>
      </View>

      <View style={styles.pickerWrapper}>
        <Text style={styles.label}>Year</Text>
        <View style={styles.wheelContainer}>
          <WheelPicker
            items={yearItems}
            selectedValue={selectedYear}
            onChange={(value: number) => handleYearChange(value)}
            numberOfVisibleRows={5}
            activeTextColor={BRAND_COLOR}
            inactiveTextColor="#9CA3AF"
            textStyle={styles.pickerText}
            itemHeight={44}
            containerStyle={styles.wheel}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 12,
  },
  pickerWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 13.6,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
    fontFamily: 'System',
  },
  wheelContainer: {
    height: 220,
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  wheel: {
    flex: 1,
  },
  pickerText: {
    fontSize: 16,
    fontFamily: 'System',
  },
});

export default CustomDatePicker;
