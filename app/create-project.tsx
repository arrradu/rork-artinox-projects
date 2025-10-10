import React, { useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { formatDateToISO } from '@/constants/formatters';
import colors from '@/constants/colors';
import type { ProjectStatus } from '@/types';
import { ChevronDown, Plus } from 'lucide-react-native';

export default function CreateProjectScreen() {
  const router = useRouter();
  const { createProject, createClient, clients } = useApp();

  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('nou');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);

  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');

  const statusOptions: { value: ProjectStatus; label: string }[] = [
    { value: 'nou', label: 'Nou' },
    { value: 'in_lucru', label: 'În lucru' },
    { value: 'livrare', label: 'Livrare' },
    { value: 'finalizat', label: 'Finalizat' },
    { value: 'anulat', label: 'Anulat' },
  ];

  const selectedClient = clients.find(c => c.id === clientId);

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Eroare', 'Numele proiectului este obligatoriu');
      return false;
    }

    if (!clientId) {
      Alert.alert('Eroare', 'Selectați un client');
      return false;
    }

    return true;
  };

  const handleCreateNewClient = async () => {
    if (!newClientName.trim()) {
      Alert.alert('Eroare', 'Numele clientului este obligatoriu');
      return;
    }

    try {
      const client = await createClient({
        nume: newClientName.trim(),
        email: newClientEmail.trim() || undefined,
        telefon: newClientPhone.trim() || undefined,
        adresa: newClientAddress.trim() || undefined,
      });

      setClientId(client.id);
      setShowNewClientModal(false);
      setNewClientName('');
      setNewClientEmail('');
      setNewClientPhone('');
      setNewClientAddress('');
      Alert.alert('Succes', 'Client creat cu succes');
    } catch (error) {
      console.error('Error creating client:', error);
      Alert.alert('Eroare', 'Nu s-a putut crea clientul');
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await createProject({
        client_id: clientId,
        name: name.trim(),
        status,
        start_date: startDate ? formatDateToISO(startDate) : undefined,
        comment: comment.trim() || undefined,
      });

      Alert.alert('Succes', 'Proiect creat cu succes', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error creating project:', error);
      Alert.alert('Eroare', 'Nu s-a putut crea proiectul');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>
              Nume proiect <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="ex: Proiect Balustrade Construct Design"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Client <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowClientModal(true)}
            >
              <Text
                style={[
                  styles.selectButtonText,
                  !selectedClient && styles.selectButtonPlaceholder,
                ]}
              >
                {selectedClient ? selectedClient.nume : 'Selectați client'}
              </Text>
              <ChevronDown size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Data începerii (DD-MM-YYYY)</Text>
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
            <Text style={styles.label}>Comentariu</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={comment}
              onChangeText={setComment}
              placeholder="Notițe despre proiect..."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

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

      <Modal
        visible={showClientModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowClientModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowClientModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selectați client</Text>

            <TouchableOpacity
              style={styles.newClientButton}
              onPress={() => {
                setShowClientModal(false);
                setShowNewClientModal(true);
              }}
            >
              <Plus size={20} color={colors.primary} />
              <Text style={styles.newClientButtonText}>Client nou</Text>
            </TouchableOpacity>

            <ScrollView style={styles.clientList}>
              {clients.map((client) => (
                <TouchableOpacity
                  key={client.id}
                  style={[
                    styles.clientOption,
                    clientId === client.id && styles.clientOptionActive,
                  ]}
                  onPress={() => {
                    setClientId(client.id);
                    setShowClientModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.clientOptionText,
                      clientId === client.id && styles.clientOptionTextActive,
                    ]}
                  >
                    {client.nume}
                  </Text>
                  {client.email && (
                    <Text style={styles.clientOptionEmail}>{client.email}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showNewClientModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNewClientModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Client nou</Text>

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
                placeholder="ex: contact@client.ro"
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
                placeholder="ex: +40 21 123 4567"
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
                placeholder="ex: Str. Exemplu nr. 10, București"
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowNewClientModal(false)}
              >
                <Text style={styles.cancelButtonText}>Anulează</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreateNewClient}
              >
                <Text style={styles.submitButtonText}>Creează</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectButtonText: {
    fontSize: 15,
    color: colors.text,
  },
  selectButtonPlaceholder: {
    color: colors.textTertiary,
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 16,
  },
  newClientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: 16,
  },
  newClientButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  clientList: {
    maxHeight: 400,
  },
  clientOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: colors.background,
  },
  clientOptionActive: {
    backgroundColor: colors.primary,
  },
  clientOptionText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: colors.text,
  },
  clientOptionTextActive: {
    color: '#FFFFFF',
  },
  clientOptionEmail: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
});
