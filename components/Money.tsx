import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import colors from '@/constants/colors';

interface MoneyProps {
  amount: number;
  currency?: string;
  style?: TextStyle;
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export default function Money({ 
  amount, 
  currency = 'RON', 
  style, 
  size = 'medium',
  color = colors.text,
}: MoneyProps) {
  const formatted = new Intl.NumberFormat('ro-RO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

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
