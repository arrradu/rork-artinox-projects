import React from 'react';
import { View } from 'react-native';
import ProcurementTab from '@/components/project-detail/ProcurementTab';

interface ContractProcurementTabProps {
  contractId: string;
}

export default function ContractProcurementTab({ contractId }: ContractProcurementTabProps) {
  return (
    <View style={{ flex: 1 }}>
      <ProcurementTab contractId={contractId} />
    </View>
  );
}
