import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar, AlertCircle } from 'lucide-react-native';
import colors from '@/constants/colors';

interface DeadlineBadgeProps {
  dueDate?: string;
  size?: 'small' | 'medium';
}

export default function DeadlineBadge({ dueDate, size = 'medium' }: DeadlineBadgeProps) {
  if (!dueDate) return null;

  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const isOverdue = diffDays < 0;
  const isUrgent = diffDays >= 0 && diffDays <= 2;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ro-RO', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    }).format(date);
  };

  let bgColor: string = colors.border;
  let textColor: string = colors.textSecondary;
  let Icon = Calendar;

  if (isOverdue) {
    bgColor = colors.errorLight;
    textColor = colors.error;
    Icon = AlertCircle;
  } else if (isUrgent) {
    bgColor = colors.warningLight;
    textColor = colors.warning;
    Icon = AlertCircle;
  }

  const iconSize = size === 'small' ? 12 : 14;
  const fontSize = size === 'small' ? 11 : 13;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Icon size={iconSize} color={textColor} />
      <Text style={[styles.text, { color: textColor, fontSize }]}>
        {formatDate(due)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '500' as const,
  },
});
