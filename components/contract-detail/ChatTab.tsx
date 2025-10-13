import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import EmptyState from '@/components/EmptyState';
import colors from '@/constants/colors';

interface ChatTabProps {
  contractId: string;
}

export default function ChatTab({ contractId }: ChatTabProps) {
  const { chatMessages } = useApp();
  
  const contractMessages = chatMessages.filter(m => m.contract_id === contractId);

  if (contractMessages.length === 0) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="Niciun mesaj"
        description="Conversația pentru acest contract va apărea aici"
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>
        Chat-ul pentru contract va fi afișat aici
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
