import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { TaskStatus } from '@/types';
import colors from '@/constants/colors';

interface TaskStatusToggleProps {
  status: TaskStatus;
  onChange: (status: TaskStatus) => void;
  disabled?: boolean;
}

export default function TaskStatusToggle({ status, onChange, disabled }: TaskStatusToggleProps) {
  const options: { value: TaskStatus; label: string; color: string }[] = [
    { value: 'todo', label: 'De făcut', color: '#A0A0A0' },
    { value: 'doing', label: 'În lucru', color: '#F6C14B' },
    { value: 'done', label: 'Realizat', color: '#22C55E' },
  ];

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isActive = status === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              isActive && { backgroundColor: option.color },
            ]}
            onPress={() => !disabled && onChange(option.value)}
            activeOpacity={0.7}
            disabled={disabled}
          >
            <Text
              style={[
                styles.optionText,
                isActive && styles.optionTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  option: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  optionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
});
