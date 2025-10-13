import React from 'react';
import { View } from 'react-native';
import TasksTab from '@/components/project-detail/TasksTab';

interface ContractTasksTabProps {
  contractId: string;
}

export default function ContractTasksTab({ contractId }: ContractTasksTabProps) {
  return (
    <View style={{ flex: 1 }}>
      <TasksTab contractId={contractId} />
    </View>
  );
}
