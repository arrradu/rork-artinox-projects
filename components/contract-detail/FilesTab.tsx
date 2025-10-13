import React from 'react';
import { View } from 'react-native';
import FilesTab from '@/components/project-detail/FilesTab';

interface ContractFilesTabProps {
  contractId: string;
}

export default function ContractFilesTab({ contractId }: ContractFilesTabProps) {
  return (
    <View style={{ flex: 1 }}>
      <FilesTab contractId={contractId} />
    </View>
  );
}
