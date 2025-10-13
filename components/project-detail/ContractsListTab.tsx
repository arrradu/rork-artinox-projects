import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { FileText, ChevronRight } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { formatDateToDisplay } from '@/constants/formatters';
import TagStatus from '@/components/TagStatus';
import Money from '@/components/Money';
import colors from '@/constants/colors';
import type { Contract } from '@/types';

interface ContractsListTabProps {
  projectId: string;
}

export default function ContractsListTab({ projectId }: ContractsListTabProps) {
  const router = useRouter();
  const { contracts, payments } = useApp();
  
  const projectContracts = contracts.filter(c => c.project_id === projectId);

  const getContractFinancials = (contract: Contract) => {
    const contractPayments = payments.filter(p => p.contract_id === contract.id);
    const paid = contractPayments.reduce((sum, p) => {
      if (p.status === 'platit') return sum + p.amount;
      if (p.status === 'partial') return sum + (p.paid_amount || 0);
      return sum;
    }, 0);
    const remaining = contract.value_eur - paid;
    return { paid, remaining };
  };

  if (projectContracts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <FileText size={48} color={colors.textTertiary} />
        <Text style={styles.emptyText}>Nu există contracte</Text>
        <Text style={styles.emptySubtext}>
          Contractele vor apărea aici când vor fi create
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {projectContracts.map((contract) => {
        const { paid, remaining } = getContractFinancials(contract);
        
        return (
          <TouchableOpacity
            key={contract.id}
            style={styles.contractCard}
            onPress={() => router.push(`/contract/${contract.id}`)}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <FileText size={20} color={colors.primary} />
                <View style={styles.titleContainer}>
                  <Text style={styles.contractTitle}>{contract.title}</Text>
                  {contract.code && (
                    <Text style={styles.contractCode}>{contract.code}</Text>
                  )}
                </View>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </View>

            <View style={styles.cardBody}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Status</Text>
                <TagStatus type="contract" status={contract.status} size="small" />
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Valoare totală</Text>
                <Money amount={contract.value_eur} size="small" color={colors.text} />
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Plătit</Text>
                <Money amount={paid} size="small" color={colors.success} />
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>Rest de încasat</Text>
                <Money amount={remaining} size="small" color={colors.primary} />
              </View>

              {contract.start_date && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Data început</Text>
                  <Text style={styles.value}>{formatDateToDisplay(contract.start_date)}</Text>
                </View>
              )}

              <View style={styles.divider} />

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Creat de {contract.created_by} • {formatDateToDisplay(contract.created_at)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  contractCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  titleContainer: {
    flex: 1,
    gap: 4,
    marginRight: 8,
  },
  contractTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    flexWrap: 'wrap',
  },
  contractCode: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  cardBody: {
    padding: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 4,
  },
  footer: {
    marginTop: 4,
  },
  footerText: {
    fontSize: 12,
    color: colors.textTertiary,
  },
});
