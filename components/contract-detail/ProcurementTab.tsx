import React from 'react';
import { Package } from 'lucide-react-native';
import EmptyState from '@/components/EmptyState';

interface ProcurementTabProps {
  contractId: string;
}

export default function ProcurementTab({ contractId }: ProcurementTabProps) {
  return (
    <EmptyState
      icon={Package}
      title="Nicio achiziție"
      description="Achizițiile pentru acest contract vor apărea aici"
    />
  );
}
