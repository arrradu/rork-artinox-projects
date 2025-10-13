import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import colors from '@/constants/colors';
import OverviewTab from '@/components/contract-detail/OverviewTab';
import TasksTab from '@/components/contract-detail/TasksTab';
import PaymentsTab from '@/components/contract-detail/PaymentsTab';
import FilesTab from '@/components/contract-detail/FilesTab';
import ChatTab from '@/components/contract-detail/ChatTab';
import ProcurementTab from '@/components/contract-detail/ProcurementTab';

type TabType = 'overview' | 'tasks' | 'payments' | 'files' | 'chat' | 'procurement';

export default function ContractDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { contracts } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const contract = contracts.find(c => c.id === id);

  if (!contract) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: contract.title,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
          onPress={() => setActiveTab('overview')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'overview' && styles.tabTextActive,
            ]}
          >
            Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'tasks' && styles.tabActive]}
          onPress={() => setActiveTab('tasks')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'tasks' && styles.tabTextActive,
            ]}
          >
            Tasks
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'payments' && styles.tabActive]}
          onPress={() => setActiveTab('payments')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'payments' && styles.tabTextActive,
            ]}
          >
            Plăți
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'files' && styles.tabActive]}
          onPress={() => setActiveTab('files')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'files' && styles.tabTextActive,
            ]}
          >
            Files
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'chat' && styles.tabActive]}
          onPress={() => setActiveTab('chat')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'chat' && styles.tabTextActive,
            ]}
          >
            Chat
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'procurement' && styles.tabActive]}
          onPress={() => setActiveTab('procurement')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'procurement' && styles.tabTextActive,
            ]}
          >
            Achiziții
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'overview' && <OverviewTab contract={contract} />}
        {activeTab === 'tasks' && <TasksTab contractId={contract.id} />}
        {activeTab === 'payments' && <PaymentsTab contractId={contract.id} />}
        {activeTab === 'files' && <FilesTab contractId={contract.id} />}
        {activeTab === 'chat' && <ChatTab contractId={contract.id} />}
        {activeTab === 'procurement' && <ProcurementTab contractId={contract.id} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600' as const,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
});
