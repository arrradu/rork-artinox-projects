import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Wallet } from 'lucide-react-native';
import { usePaymentsByProjectId, useProjectFinancials } from '@/contexts/AppContext';
import TagStatus from '@/components/TagStatus';
import Money from '@/components/Money';
import DeadlineBadge from '@/components/DeadlineBadge';
import EmptyState from '@/components/EmptyState';
import colors from '@/constants/colors';
import type { Payment } from '@/types';

interface PaymentsTabProps {
  projectId: string;
}

function PaymentCard({ payment }: { payment: Payment }) {
  return (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <Text style={styles.paymentLabel} numberOfLines={1}>
          {payment.label}
        </Text>
        <TagStatus type="payment" status={payment.status} size="small" />
      </View>

      <View style={styles.paymentBody}>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentRowLabel}>Sumă</Text>
          <Money amount={payment.amount} size="small" />
        </View>

        {payment.paid_amount !== undefined && payment.paid_amount > 0 && (
          <View style={styles.paymentRow}>
            <Text style={styles.paymentRowLabel}>Plătit</Text>
            <Money amount={payment.paid_amount} size="small" color={colors.success} />
          </View>
        )}

        {payment.status !== 'platit' && (
          <View style={styles.paymentRow}>
            <Text style={styles.paymentRowLabel}>Rămas</Text>
            <Money
              amount={payment.amount - (payment.paid_amount || 0)}
              size="small"
              color={colors.error}
            />
          </View>
        )}
      </View>

      {payment.due_date && (
        <View style={styles.paymentFooter}>
          <DeadlineBadge dueDate={payment.due_date} size="small" />
        </View>
      )}
    </View>
  );
}

export default function PaymentsTab({ projectId }: PaymentsTabProps) {
  const payments = usePaymentsByProjectId(projectId);
  const { total, paid, remaining } = useProjectFinancials(projectId);

  if (payments.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title="Nicio plată"
        description="Acest proiect nu are plăți configurate"
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Rezumat financiar</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total proiect</Text>
          <Money amount={total} size="medium" />
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Plătit</Text>
          <Money amount={paid} size="medium" color={colors.success} />
        </View>

        <View style={styles.divider} />

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabelBold}>Rest de încasat</Text>
          <Money amount={remaining} size="large" color={colors.primary} />
        </View>
      </View>

      <View style={styles.paymentsSection}>
        <Text style={styles.sectionTitle}>Tranșe de plată</Text>
        {payments.map((payment) => (
          <PaymentCard key={payment.id} payment={payment} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryLabelBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 4,
  },
  paymentsSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  paymentCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  paymentLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.text,
  },
  paymentBody: {
    gap: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentRowLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  paymentFooter: {
    paddingTop: 4,
  },
});
