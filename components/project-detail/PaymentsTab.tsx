import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Alert } from 'react-native';
import { Wallet, Plus, Edit2, CheckCircle, AlertTriangle, Clock } from 'lucide-react-native';
import { usePaymentsByProjectId, usePaymentsByContractId, useProjectFinancials, useContractFinancials, useApp } from '@/contexts/AppContext';

import Money from '@/components/Money';
import EmptyState from '@/components/EmptyState';
import colors from '@/constants/colors';
import { formatDateShort, formatDateToDisplay, formatDateToISO, getCurrentDateDisplay } from '@/constants/formatters';
import type { Payment, PaymentStatus } from '@/types';

interface PaymentsTabProps {
  projectId?: string;
  contractId?: string;
}

type PaymentFilter = 'toate' | 'neplatite' | 'depasite' | 'partiale' | 'platite';

function getDaysUntilDue(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getPaymentStatusColor(payment: Payment): string {
  if (payment.status === 'platit') return colors.success;
  if (payment.status === 'partial') return '#FACC15';
  
  if (!payment.due_date) return '#F59E0B';
  
  const daysUntil = getDaysUntilDue(payment.due_date);
  if (daysUntil < 0) return colors.error;
  return '#F59E0B';
}

function getPaymentStatusText(payment: Payment): string {
  if (payment.status === 'platit') return 'Plătit';
  if (payment.status === 'partial') return 'Parțial';
  
  if (!payment.due_date) return 'Aștept plata';
  
  const daysUntil = getDaysUntilDue(payment.due_date);
  if (daysUntil < 0) return 'Depășit';
  return 'Aștept plata';
}

function getPaymentUrgency(payment: Payment): number {
  if (payment.status === 'platit') return 999;
  if (!payment.due_date) return 500;
  
  const daysUntil = getDaysUntilDue(payment.due_date);
  if (daysUntil < 0) return -daysUntil;
  return 100 + daysUntil;
}

function PaymentCard({ payment, onEdit, onMarkPaid, canEdit }: { 
  payment: Payment; 
  onEdit: () => void;
  onMarkPaid: () => void;
  canEdit: boolean;
}) {
  const statusColor = getPaymentStatusColor(payment);
  const statusText = getPaymentStatusText(payment);
  const daysUntil = payment.due_date ? getDaysUntilDue(payment.due_date) : null;
  const showWarning = daysUntil !== null && daysUntil <= 3 && daysUntil >= 0 && payment.status !== 'platit';

  return (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentHeaderLeft}>
          <Text style={styles.paymentLabel} numberOfLines={1}>
            {payment.label}
          </Text>
          {showWarning && (
            <AlertTriangle size={16} color={colors.warning} style={styles.warningIcon} />
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
        </View>
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

        {payment.status === 'partial' && payment.paid_amount && (
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(payment.paid_amount / payment.amount) * 100}%` }
              ]} 
            />
          </View>
        )}
      </View>

      {payment.due_date && payment.status !== 'platit' && daysUntil !== null && (
        <View style={styles.deadlineSection}>
          <Clock size={14} color={daysUntil < 0 ? colors.error : colors.textSecondary} />
          <Text style={[
            styles.deadlineText,
            daysUntil < 0 && styles.deadlineOverdue
          ]}>
            {daysUntil >= 0 
              ? `În ${daysUntil} ${daysUntil === 1 ? 'zi' : 'zile'}`
              : `Depășit cu ${Math.abs(daysUntil)} ${Math.abs(daysUntil) === 1 ? 'zi' : 'zile'}`
            }
          </Text>
        </View>
      )}

      {payment.status === 'platit' && payment.paid_at && (
        <View style={styles.deadlineSection}>
          <CheckCircle size={14} color={colors.success} />
          <Text style={styles.paidAtText}>
            Plătit la {formatDateShort(payment.paid_at)}
          </Text>
        </View>
      )}

      <View style={styles.auditSection}>
        <Text style={styles.auditText}>
          Creat de: {payment.created_by} • {formatDateShort(payment.created_at)}
        </Text>
        {payment.marked_paid_by && payment.marked_paid_at && (
          <Text style={styles.auditText}>
            Confirmat plătit de: {payment.marked_paid_by} • {formatDateShort(payment.marked_paid_at)}
          </Text>
        )}
      </View>

      {canEdit && (
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
            <Edit2 size={16} color={colors.primary} />
            <Text style={styles.actionButtonText}>Editează</Text>
          </TouchableOpacity>
          {payment.status !== 'platit' && (
            <TouchableOpacity style={styles.actionButtonPrimary} onPress={onMarkPaid}>
              <CheckCircle size={16} color="#fff" />
              <Text style={styles.actionButtonTextPrimary}>Marchează plătit</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

function AddPaymentModal({ 
  visible, 
  onClose, 
  onSubmit, 
  projectId 
}: { 
  visible: boolean; 
  onClose: () => void; 
  onSubmit: (data: any) => void;
  projectId: string;
}) {
  const [label, setLabel] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [comment, setComment] = useState<string>('');

  const handleSubmit = () => {
    if (!label.trim() || !amount.trim()) {
      Alert.alert('Eroare', 'Completează denumirea și suma');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Eroare', 'Suma trebuie să fie un număr pozitiv');
      return;
    }

    let dueDateISO: string | undefined = undefined;
    if (dueDate) {
      try {
        dueDateISO = new Date(formatDateToISO(dueDate)).toISOString();
      } catch (error) {
        Alert.alert('Eroare', 'Formatul datei trebuie să fie DD-MM-YYYY');
        return;
      }
    }

    onSubmit({
      project_id: projectId,
      label: label.trim(),
      amount: amountNum,
      due_date: dueDateISO,
      comment: comment.trim() || undefined,
    });

    setLabel('');
    setAmount('');
    setDueDate('');
    setComment('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Adaugă tranșă</Text>

          <Text style={styles.inputLabel}>Denumire *</Text>
          <TextInput
            style={styles.input}
            value={label}
            onChangeText={setLabel}
            placeholder="ex: Avans 40%"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.inputLabel}>Sumă (EUR) *</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            keyboardType="numeric"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.inputLabel}>Scadență (DD-MM-YYYY)</Text>
          <TextInput
            style={styles.input}
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="31-01-2025"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.inputLabel}>Comentariu</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={comment}
            onChangeText={setComment}
            placeholder="Detalii opționale"
            multiline
            numberOfLines={3}
            placeholderTextColor={colors.textSecondary}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalButtonSecondary} onPress={onClose}>
              <Text style={styles.modalButtonSecondaryText}>Anulează</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButtonPrimary} onPress={handleSubmit}>
              <Text style={styles.modalButtonPrimaryText}>Adaugă</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function MarkPaidModal({ 
  visible, 
  onClose, 
  onSubmit, 
  payment 
}: { 
  visible: boolean; 
  onClose: () => void; 
  onSubmit: (data: any) => void;
  payment: Payment | null;
}) {
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [paidAt, setPaidAt] = useState<string>('');

  React.useEffect(() => {
    if (payment) {
      setPaidAmount(payment.amount.toString());
      setPaidAt(getCurrentDateDisplay());
    }
  }, [payment]);

  const handleSubmit = () => {
    if (!payment) return;

    const amountNum = parseFloat(paidAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Eroare', 'Suma trebuie să fie un număr pozitiv');
      return;
    }

    const newStatus: PaymentStatus = amountNum >= payment.amount ? 'platit' : 'partial';

    let paidAtISO: string;
    try {
      paidAtISO = paidAt ? new Date(formatDateToISO(paidAt)).toISOString() : new Date().toISOString();
    } catch (error) {
      Alert.alert('Eroare', 'Formatul datei trebuie să fie DD-MM-YYYY');
      return;
    }

    onSubmit({
      paid_amount: amountNum,
      paid_at: paidAtISO,
      status: newStatus,
    });
  };

  if (!payment) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Marchează plătit</Text>
          <Text style={styles.modalSubtitle}>{payment.label}</Text>

          <Text style={styles.inputLabel}>Sumă plătită (EUR) *</Text>
          <TextInput
            style={styles.input}
            value={paidAmount}
            onChangeText={setPaidAmount}
            placeholder="0"
            keyboardType="numeric"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={styles.inputLabel}>Data plății (DD-MM-YYYY)</Text>
          <TextInput
            style={styles.input}
            value={paidAt}
            onChangeText={setPaidAt}
            placeholder="10-01-2025"
            placeholderTextColor={colors.textSecondary}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalButtonSecondary} onPress={onClose}>
              <Text style={styles.modalButtonSecondaryText}>Anulează</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButtonPrimary} onPress={handleSubmit}>
              <Text style={styles.modalButtonPrimaryText}>Confirmă</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function PaymentsTab({ projectId, contractId }: PaymentsTabProps) {
  const projectPayments = usePaymentsByProjectId(projectId);
  const contractPayments = usePaymentsByContractId(contractId);
  const payments = contractId ? contractPayments : projectPayments;
  
  const projectFinancials = useProjectFinancials(projectId);
  const contractFinancials = useContractFinancials(contractId);
  const { total, paid, remaining } = contractId ? contractFinancials : projectFinancials;
  const { currentUser, createPayment, updatePayment } = useApp();
  const [filter, setFilter] = useState<PaymentFilter>('toate');
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  const [markPaidModalVisible, setMarkPaidModalVisible] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const canEdit = useMemo(() => {
    return currentUser.role === 'admin' || 
           currentUser.department === 'sales' || 
           currentUser.department === 'conta';
  }, [currentUser]);

  const filteredPayments = useMemo(() => {
    let filtered = [...payments];

    switch (filter) {
      case 'neplatite':
        filtered = filtered.filter(p => p.status === 'neplatit');
        break;
      case 'depasite':
        filtered = filtered.filter(p => {
          if (p.status === 'platit' || !p.due_date) return false;
          return getDaysUntilDue(p.due_date) < 0;
        });
        break;
      case 'partiale':
        filtered = filtered.filter(p => p.status === 'partial');
        break;
      case 'platite':
        filtered = filtered.filter(p => p.status === 'platit');
        break;
    }

    return filtered.sort((a, b) => getPaymentUrgency(a) - getPaymentUrgency(b));
  }, [payments, filter]);

  const handleAddPayment = async (data: any) => {
    try {
      await createPayment(data);
      setAddModalVisible(false);
    } catch (error) {
      console.error('Error creating payment:', error);
      Alert.alert('Eroare', 'Nu s-a putut crea tranșa');
    }
  };

  const handleMarkPaid = async (data: any) => {
    if (!selectedPayment) return;
    
    try {
      await updatePayment(selectedPayment.id, data);
      setMarkPaidModalVisible(false);
      setSelectedPayment(null);
    } catch (error) {
      console.error('Error updating payment:', error);
      Alert.alert('Eroare', 'Nu s-a putut actualiza tranșa');
    }
  };

  if (payments.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon={Wallet}
          title="Nicio plată"
          description="Acest proiect nu are plăți configurate"
        />
        {canEdit && (
          <TouchableOpacity 
            style={styles.addButtonEmpty} 
            onPress={() => setAddModalVisible(true)}
          >
            <Plus size={20} color="#fff" />
            <Text style={styles.addButtonText}>Adaugă tranșă</Text>
          </TouchableOpacity>
        )}
        <AddPaymentModal
          visible={addModalVisible}
          onClose={() => setAddModalVisible(false)}
          onSubmit={handleAddPayment}
          projectId={projectId || ''}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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

      <View style={styles.filtersSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
          {(['toate', 'neplatite', 'depasite', 'partiale', 'platite'] as PaymentFilter[]).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterButton, filter === f && styles.filterButtonActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterButtonText, filter === f && styles.filterButtonTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.paymentsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tranșe de plată</Text>
          {canEdit && (
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => setAddModalVisible(true)}
            >
              <Plus size={18} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        {filteredPayments.map((payment) => (
          <PaymentCard
            key={payment.id}
            payment={payment}
            onEdit={() => {}}
            onMarkPaid={() => {
              setSelectedPayment(payment);
              setMarkPaidModalVisible(true);
            }}
            canEdit={canEdit}
          />
        ))}

        {filteredPayments.length === 0 && (
          <View style={styles.emptyFilter}>
            <Text style={styles.emptyFilterText}>
              Nicio tranșă în categoria selectată
            </Text>
          </View>
        )}
      </View>

      <AddPaymentModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSubmit={handleAddPayment}
        projectId={projectId || ''}
      />

      <MarkPaidModal
        visible={markPaidModalVisible}
        onClose={() => {
          setMarkPaidModalVisible(false);
          setSelectedPayment(null);
        }}
        onSubmit={handleMarkPaid}
        payment={selectedPayment}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
    marginBottom: 16,
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
  filtersSection: {
    marginBottom: 16,
  },
  filters: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500' as const,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  paymentsSection: {
    gap: 12,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
    marginTop: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
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
  paymentHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.text,
  },
  warningIcon: {
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
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
  progressBar: {
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FACC15',
    borderRadius: 2,
  },
  deadlineSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
  },
  deadlineText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  deadlineOverdue: {
    color: colors.error,
    fontWeight: '500' as const,
  },
  paidAtText: {
    fontSize: 13,
    color: colors.success,
  },
  auditSection: {
    gap: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  auditText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionButtonText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500' as const,
  },
  actionButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  actionButtonTextPrimary: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500' as const,
  },
  emptyFilter: {
    padding: 32,
    alignItems: 'center',
  },
  emptyFilterText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
  },
  modalButtonPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
});
