import React from 'react';
import { View } from 'react-native';
import PaymentsTab from '@/components/project-detail/PaymentsTab';

interface ContractPaymentsTabProps {
  contractId: string;
}

export default function ContractPaymentsTab({ contractId }: ContractPaymentsTabProps) {
  return (
    <View style={{ flex: 1 }}>
      <PaymentsTab contractId={contractId} />
    </View>
  );
}
