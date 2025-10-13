import React from 'react';
import { View } from 'react-native';
import ChatTab from '@/components/project-detail/ChatTab';

interface ContractChatTabProps {
  contractId: string;
}

export default function ContractChatTab({ contractId }: ContractChatTabProps) {
  return (
    <View style={{ flex: 1 }}>
      <ChatTab contractId={contractId} />
    </View>
  );
}
