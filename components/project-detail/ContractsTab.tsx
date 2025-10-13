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

    if (!valueEur.trim() || isNaN(Number(valueEur))) {
      Alert.alert('Eroare', 'Valoarea contractului trebuie să fie un număr valid');
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
        value_eur: Number(valueEur),
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
    const nextDueDate = item.start_date ? formatDateToDisplay(item.start_date) : null;

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
            <ChevronRight size={20} color={colors.textSecondary} />
          </View>
          {item.code && (
            <Text style={styles.contractCode}>{item.code}</Text>
          )}
        </View>

        <View style={styles.contractMeta}>
          <TagStatus type="contract" status={item.status} size="small" />
          {nextDueDate && (
            <Text style={styles.contractDate}>Început: {nextDueDate}</Text>
          )}
        </View>

        <View style={styles.contractFooter}>
          <View style={styles.contractFinancial}>
            <Text style={styles.contractLabel}>Valoare:</Text>
            <Money amount={item.value_eur} size="small" color={colors.text} />
          </View>
          <View style={styles.contractFinancial}>
            <Text style={styles.contractLabel}>Rest:</Text>
            <Money amount={item.remaining_eur} size="small" color={colors.primary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {contracts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Niciun contract"
          description={isAdmin ? 'Apasă + pentru a adăuga primul contract' : 'Nu există contracte în acest proiect'}
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
          style={styles.fab}
          onPress={() => setShowModal(true)}
          activeOpacity={0.8}
        >
          <Plus size={24} color="#FFFFFF" />
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
              contentContainerStyle={styles.modalScroll}
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
                  keyboardType="numeric"
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
            </ScrollView>

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
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'Se creează...' : 'Creează'}
                </Text>
              </TouchableOpacity>
            </View>
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
    paddingBottom: 80,
  },
  contractCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    fontFamily: 'monospace' as const,
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
  contractFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  contractFinancial: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contractLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    maxHeight: '90%',
  },
  modalScroll: {
    padding: 20,
    gap: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.text,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.text,
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
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
