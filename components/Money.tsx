import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import colors from '@/constants/colors';
import { formatCurrency } from '@/constants/formatters';

interface MoneyProps {
  amount: number;
  currency?: string;
  style?: TextStyle;
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export default function Money({ 
  amount, 
  currency = 'EUR', 
  style, 
  size = 'medium',
  color = colors.text,
}: MoneyProps) {
  const formatted = formatCurrency(amount);

  const fontSize = size === 'small' ? 13 : size === 'large' ? 20 : 15;

  return (
    <Text style={[styles.text, { fontSize, color }, style]}>
      {formatted} {currency}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: '600' as const,
  },
});
