import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Wallet } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import EmptyState from '@/components/EmptyState';
import colors from '@/constants/colors';

interface PaymentsTabProps {
  contractId: string;
}

export default function PaymentsTab({ contractId }: PaymentsTabProps) {
  const { payments } = useApp();
  
  const contractPayments = payments.filter(p => p.contract_id === contractId);

  if (contractPayments.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title="Nicio plată"
        description="Acest contract nu are plăți configurate"
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>
        Plățile pentru contract vor fi afișate aici
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  placeholder: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
