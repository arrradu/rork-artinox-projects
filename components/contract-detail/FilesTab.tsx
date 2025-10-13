import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FileText } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import EmptyState from '@/components/EmptyState';
import colors from '@/constants/colors';

interface FilesTabProps {
  contractId: string;
}

export default function FilesTab({ contractId }: FilesTabProps) {
  const { files } = useApp();
  
  const contractFiles = files.filter(f => f.contract_id === contractId);

  if (contractFiles.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Niciun fișier"
        description="Acest contract nu are fișiere încărcate"
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>
        Fișierele pentru contract vor fi afișate aici
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
