import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TagStatus from '@/components/TagStatus';
import Money from '@/components/Money';
import { useApp } from '@/contexts/AppContext';
import { formatDateToDisplay } from '@/constants/formatters';
import colors from '@/constants/colors';
import type { Contract } from '@/types';

interface OverviewTabProps {
  contract: Contract;
}

export default function OverviewTab({ contract }: OverviewTabProps) {
  const { payments } = useApp();
  
  const contractPayments = payments.filter(p => p.contract_id === contract.id);
  const paid = contractPayments.reduce((sum, p) => {
    if (p.status === 'platit') return sum + p.amount;
    if (p.status === 'partial') return sum + (p.paid_amount || 0);
    return sum;
  }, 0);
  const remaining = contract.value_eur - paid;

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informații contract</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <TagStatus type="contract" status={contract.status} size="small" />
          </View>

          {contract.code && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cod contract</Text>
              <Text style={styles.infoValue}>{contract.code}</Text>
            </View>
          )}

          {contract.description && (
            <>
              <View style={styles.divider} />
              <View style={styles.descriptionContainer}>
                <Text style={styles.infoLabel}>Descriere</Text>
                <Text style={styles.descriptionText}>{contract.description}</Text>
              </View>
            </>
          )}

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Creat de</Text>
            <Text style={styles.infoValue}>{contract.created_by}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data creării</Text>
            <Text style={styles.infoValue}>{formatDateToDisplay(contract.created_at)}</Text>
          </View>

          {contract.start_date && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Data început</Text>
              <Text style={styles.infoValue}>{formatDateToDisplay(contract.start_date)}</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Valoare totală</Text>
            <Money amount={contract.value_eur} size="medium" color={colors.text} />
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Plătit</Text>
            <Money amount={paid} size="medium" color={colors.success} />
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rest de încasat</Text>
            <Money amount={remaining} size="medium" color={colors.primary} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  descriptionContainer: {
    gap: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 4,
  },
});
