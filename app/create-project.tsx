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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import colors from '@/constants/colors';
import type { ProjectStatus } from '@/types';

export default function CreateProjectScreen() {
  const router = useRouter();
  const { createProject } = useApp();

  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [valueTotal, setValueTotal] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('nou');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions: { value: ProjectStatus; label: string }[] = [
    { value: 'nou', label: 'Nou' },
    { value: 'in_lucru', label: 'În lucru' },
    { value: 'livrare', label: 'Livrare' },
    { value: 'finalizat', label: 'Finalizat' },
    { value: 'anulat', label: 'Anulat' },
  ];

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Eroare', 'Titlul este obligatoriu');
      return false;
    }

    if (!clientName.trim()) {
      Alert.alert('Eroare', 'Numele clientului este obligatoriu');
      return false;
    }

    if (valueTotal && parseFloat(valueTotal) < 0) {
      Alert.alert('Eroare', 'Valoarea trebuie să fie pozitivă');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await createProject({
        title: title.trim(),
        client_name: clientName.trim(),
        client_email: clientEmail.trim() || undefined,
        value_total: valueTotal ? parseFloat(valueTotal) : undefined,
        status,
      });

      Alert.alert('Success', 'Proiect creat cu succes', [
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
              Titlu proiect <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="ex: Balustradă Inox Scară"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Nume client <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={clientName}
              onChangeText={setClientName}
              placeholder="ex: SC Construct Design SRL"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email client</Text>
            <TextInput
              style={styles.input}
              value={clientEmail}
              onChangeText={setClientEmail}
              placeholder="ex: contact@client.ro"
              placeholderTextColor={colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Valoare totală (RON)</Text>
            <TextInput
              style={styles.input}
              value={valueTotal}
              onChangeText={setValueTotal}
              placeholder="ex: 15000"
              placeholderTextColor={colors.textTertiary}
              keyboardType="decimal-pad"
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
});
