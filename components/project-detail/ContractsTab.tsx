import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, FileText, ChevronRight } from 'lucide-react-native';
import { useApp, useContractsByProjectId } from '@/contexts/AppContext';
import TagStatus from '@/components/TagStatus';
import Money from '@/components/Money';
import EmptyState from '@/components/EmptyState';
import { formatDateToISO, formatDateToDisplay } from '@/constants/formatters';
import colors from '@/constants/colors';
import type { Contract, ContractStatus } from '@/types';

interface ContractsTabProps {
  projectId: string;
}

export default function ContractsTab({ projectId }: ContractsTabProps) {
  const router = useRouter();
  const { currentUser, createContract } = useApp();
  const contracts = useContractsByProjectId(projectId);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [valueEur, setValueEur] = useState('');
  const [status, setStatus] = useState<ContractStatus>('nou');

  const isAdmin = currentUser.role === 'admin';

  const statusOptions: { value: ContractStatus; label: string }[] = [
    { value: 'nou', label: 'Nou' },
    { value: 'in_lucru', label: 'În lucru' },
    { value: 'livrare', label: 'Livrare' },
    { value: 'finalizat', label: 'Finalizat' },
  ];

  const resetForm = () => {
    setTitle('');
    setCode('');
    setDescription('');
    setStartDate('');
    setValueEur('');
    setStatus('nou');
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Eroare', 'Titlul contractului este obligatoriu');
      return;
    }

    if (!valueEur.trim()) {
      Alert.alert('Eroare', 'Valoarea contractului este obligatorie');
      return;
    }

    const value = parseFloat(valueEur.replace(/,/g, '.'));
    if (isNaN(value) || value <= 0) {
      Alert.alert('Eroare', 'Valoarea trebuie să fie un număr pozitiv');
      return;
    }

    setIsSubmitting(true);

    try {
      await createContract({
        project_id: projectId,
        title: title.trim(),
        code: code.trim() || undefined,
        description: description.trim() || undefined,
        start_date: startDate ? formatDateToISO(startDate) : undefined,
        value_eur: value,
        status,
      });

      Alert.alert('Succes', 'Contract creat cu succes');
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating contract:', error);
      Alert.alert('Eroare', 'Nu s-a putut crea contractul');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContract = ({ item }: { item: Contract }) => {
    const nextPaymentDue = item.remaining_eur > 0 ? 'Plăți restante' : 'Plătit integral';

    return (
      <TouchableOpacity
        style={styles.contractCard}
        onPress={() => router.push(`/contract/${item.id}` as any)}
        activeOpacity={0.7}
      >
        <View style={styles.contractHeader}>
          <View style={styles.contractTitleRow}>
            <Text style={styles.contractTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <ChevronRight size={20} color={colors.textTertiary} />
          </View>
          {item.code && (
            <Text style={styles.contractCode}>Cod: {item.code}</Text>
          )}
        </View>

        <View style={styles.contractMeta}>
          <TagStatus type="contract" status={item.status} size="small" />
          {item.start_date && (
            <Text style={styles.contractDate}>
              Început: {formatDateToDisplay(item.start_date)}
            </Text>
          )}
        </View>

        <View style={styles.contractFinancials}>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Valoare:</Text>
            <Money amount={item.value_eur} size="small" color={colors.text} />
          </View>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Plătit:</Text>
            <Money amount={item.paid_eur} size="small" color={colors.success} />
          </View>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Rest:</Text>
            <Money amount={item.remaining_eur} size="small" color={colors.primary} />
          </View>
        </View>

        {item.remaining_eur > 0 && (
          <View style={styles.contractFooter}>
            <Text style={styles.nextPayment}>{nextPaymentDue}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {contracts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Niciun contract"
          description={
            isAdmin
              ? 'Apasă + pentru a adăuga primul contract'
              : 'Nu există contracte în acest proiect'
          }
        />
      ) : (
        <FlatList
          data={contracts}
          keyExtractor={(item) => item.id}
          renderItem={renderContract}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {isAdmin && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowModal(true)}
          activeOpacity={0.8}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Contract</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.modalTitle}>Contract nou</Text>

              <View style={styles.field}>
                <Text style={styles.label}>
                  Titlu <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="ex: Cisterne CCT"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Cod contract</Text>
                <TextInput
                  style={styles.input}
                  value={code}
                  onChangeText={setCode}
                  placeholder="ex: ALV-2025-01"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>
                  Valoare (EUR) <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={valueEur}
                  onChangeText={setValueEur}
                  placeholder="ex: 15000"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Data început (DD-MM-YYYY)</Text>
                <TextInput
                  style={styles.input}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="ex: 15-01-2025"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.statusGrid}>
                  {statusOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.statusButton,
                        status === option.value && styles.statusButtonActive,
                      ]}
                      onPress={() => setStatus(option.value)}
                    >
                      <Text
                        style={[
                          styles.statusButtonText,
                          status === option.value && styles.statusButtonTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Descriere</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Detalii despre contract..."
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                >
                  <Text style={styles.cancelButtonText}>Anulează</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    isSubmitting && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  <Text style={styles.submitButtonText}>
                    {isSubmitting ? 'Se creează...' : 'Creează'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    gap: 12,
  },
  contractCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  contractHeader: {
    gap: 4,
  },
  contractTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  contractTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600' as const,
    color: colors.text,
  },
  contractCode: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  contractMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contractDate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  contractFinancials: {
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  financialLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  contractFooter: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  nextPayment: {
    fontSize: 13,
    color: colors.warning,
    fontWeight: '500' as const,
  },
  addButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 20,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.text,
    marginBottom: 8,
  },
  required: {
    color: colors.error,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  statusButtonTextActive: {
    color: '#FFFFFF',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
