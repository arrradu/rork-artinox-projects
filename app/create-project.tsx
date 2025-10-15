import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import colors from '@/constants/colors';
import type { ProjectStatus, Client } from '@/types';
import { X, Plus, ChevronDown } from 'lucide-react-native';

export default function CreateProjectScreen() {
  const router = useRouter();
  const { createProject, createClient, clients } = useApp();

  const [name, setName] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('nou');
  const [startDate, setStartDate] = useState('');
  const [comment, setComment] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingClient, setIsCreatingClient] = useState(false);

  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients;
    const query = clientSearch.toLowerCase();
    return clients.filter(c => 
      c.name.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query)
    );
  }, [clients, clientSearch]);

  const statusOptions: { value: ProjectStatus; label: string }[] = [
    { value: 'nou', label: 'Nou' },
    { value: 'in_lucru', label: 'În lucru' },
    { value: 'livrare', label: 'Livrare' },
    { value: 'finalizat', label: 'Finalizat' },
    { value: 'anulat', label: 'Anulat' },
  ];

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Eroare', 'Numele proiectului este obligatoriu');
      return false;
    }

    if (!selectedClient) {
      Alert.alert('Eroare', 'Selectează un client');
      return false;
    }

    return true;
  };

  const handleCreateClient = async () => {
    if (!newClientName.trim()) {
      Alert.alert('Eroare', 'Numele clientului este obligatoriu');
      return;
    }

    setIsCreatingClient(true);

    try {
      const client = await createClient({
        name: newClientName.trim(),
        email: newClientEmail.trim() || undefined,
        phone: newClientPhone.trim() || undefined,
        address: newClientAddress.trim() || undefined,
      });

      setSelectedClient(client);
      setShowNewClientModal(false);
      setNewClientName('');
      setNewClientEmail('');
      setNewClientPhone('');
      setNewClientAddress('');
      Alert.alert('Succes', 'Clientul a fost creat');
    } catch (error) {
      console.error('Error creating client:', error);
      Alert.alert('Eroare', 'Nu s-a putut crea clientul');
    } finally {
      setIsCreatingClient(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const project = await createProject({
        client_id: selectedClient!.id,
        name: name.trim(),
        status,
        start_date: startDate.trim() || undefined,
        comment: comment.trim() || undefined,
        total_value_eur: totalValue.trim() ? parseFloat(totalValue) : undefined,
      });

      router.replace(`/project/${project.id}` as any);
    } catch (error) {
      console.error('Error creating project:', error);
      Alert.alert('Eroare', 'Nu s-a putut crea proiectul');
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{
          title: 'Proiect nou',
          headerBackTitle: 'Înapoi',
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>
              Client <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowClientPicker(true)}
            >
              <Text style={[styles.pickerButtonText, !selectedClient && styles.pickerPlaceholder]}>
                {selectedClient ? selectedClient.name : 'Selectează client'}
              </Text>
              <ChevronDown size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Nume proiect <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="ex: Vinăria Alvisa"
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
            <Text style={styles.label}>Valoare totală estimată (EUR)</Text>
            <TextInput
              style={styles.input}
              value={totalValue}
              onChangeText={setTotalValue}
              placeholder="ex: 15000"
              placeholderTextColor={colors.textTertiary}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Dată început (DD-MM-YYYY)</Text>
            <TextInput
              style={styles.input}
              value={startDate}
              onChangeText={setStartDate}
              placeholder="ex: 15-01-2025"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Comentariu (opțional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={comment}
              onChangeText={setComment}
              placeholder="Detalii suplimentare despre proiect..."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showClientPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowClientPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selectează client</Text>
              <TouchableOpacity
                onPress={() => setShowClientPicker(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              value={clientSearch}
              onChangeText={setClientSearch}
              placeholder="Caută client..."
              placeholderTextColor={colors.textTertiary}
            />

            <TouchableOpacity
              style={styles.newClientButton}
              onPress={() => {
                setShowClientPicker(false);
                setShowNewClientModal(true);
              }}
            >
              <Plus size={20} color={colors.primary} />
              <Text style={styles.newClientButtonText}>Client nou</Text>
            </TouchableOpacity>

            <FlatList
              data={filteredClients}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.clientItem}
                  onPress={() => {
                    setSelectedClient(item);
                    setShowClientPicker(false);
                    setClientSearch('');
                  }}
                >
                  <Text style={styles.clientItemName}>{item.name}</Text>
                  {item.email && (
                    <Text style={styles.clientItemEmail}>{item.email}</Text>
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Text style={styles.emptyListText}>Niciun client găsit</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showNewClientModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNewClientModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Client nou</Text>
              <TouchableOpacity
                onPress={() => setShowNewClientModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.newClientForm}>
              <View style={styles.field}>
                <Text style={styles.label}>
                  Nume <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={newClientName}
                  onChangeText={setNewClientName}
                  placeholder="ex: SC Construct Design SRL"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={newClientEmail}
                  onChangeText={setNewClientEmail}
                  placeholder="contact@client.ro"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Telefon</Text>
                <TextInput
                  style={styles.input}
                  value={newClientPhone}
                  onChangeText={setNewClientPhone}
                  placeholder="+40 721 123 456"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Adresă</Text>
                <TextInput
                  style={styles.input}
                  value={newClientAddress}
                  onChangeText={setNewClientAddress}
                  placeholder="Str. Principală nr. 10, București"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, (!newClientName.trim() || isCreatingClient) && styles.submitButtonDisabled]}
                onPress={handleCreateClient}
                disabled={!newClientName.trim() || isCreatingClient}
              >
                <Text style={styles.submitButtonText}>
                  {isCreatingClient ? 'Se creează...' : 'Creează client'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
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
            {isSubmitting ? 'Se creează...' : 'Creează proiect'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  form: {
    gap: 20,
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  pickerButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: 15,
    color: colors.text,
  },
  pickerPlaceholder: {
    color: colors.textTertiary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
  },
  searchInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    margin: 16,
  },
  newClientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  newClientButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  clientItem: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  clientItemName: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.text,
    marginBottom: 4,
  },
  clientItemEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyList: {
    padding: 40,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  newClientForm: {
    padding: 20,
    gap: 16,
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
    backgroundColor: colors.surface,
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
    color: colors.surface,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.surface,
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
    color: colors.surface,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
});
