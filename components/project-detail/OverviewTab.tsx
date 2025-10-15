import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Mail, Lock, Unlock, MoreVertical, Archive, Trash2, RotateCcw } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import TagStatus from '@/components/TagStatus';
import Money from '@/components/Money';
import { useApp, useProjectFinancials } from '@/contexts/AppContext';
import { formatDateToDisplay } from '@/constants/formatters';
import colors from '@/constants/colors';
import type { Project, Department } from '@/types';

interface OverviewTabProps {
  project: Project;
}

const departmentLabels: Record<Department, string> = {
  sales: 'Vânzări',
  produce: 'Producție',
  conta: 'Contabilitate',
  depozit: 'Depozit',
  vamuire: 'Vămuire',
  livrare: 'Livrare',
  achizitii: 'Achiziții',
  logistica: 'Logistică',
};

export default function OverviewTab({ project }: OverviewTabProps) {
  const router = useRouter();
  const { toggleDepartmentAccess, clients, contracts, currentUser, updateProject, deleteProject, payments, tasks, files, chatMessages } = useApp();
  const { total, paid, remaining } = useProjectFinancials(project.id);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  const client = clients.find(c => c.id === project.client_id);
  const projectContracts = contracts.filter(c => c.project_id === project.id);
  const contractsCount = projectContracts.length;
  const isAdmin = currentUser.role === 'admin';
  const isArchived = !!project.archived_at;
  
  const unpaidPayments = payments.filter(p => p.project_id === project.id && p.status !== 'platit');
  const hasUnpaidPayments = unpaidPayments.length > 0;
  
  const handleArchive = () => {
    setShowMenu(false);
    Alert.alert(
      'Arhivează proiect',
      `Sigur vrei să arhivezi proiectul "${project.name}"?\n\nProiectul va deveni read-only și nu va mai apărea în lista principală.`,
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Arhivează',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateProject(project.id, { archived_at: new Date().toISOString() });
              Alert.alert('Succes', 'Proiectul a fost arhivat');
            } catch (error) {
              Alert.alert('Eroare', 'Nu s-a putut arhiva proiectul');
            }
          },
        },
      ]
    );
  };
  
  const handleReactivate = () => {
    setShowMenu(false);
    Alert.alert(
      'Re-activează proiect',
      `Sigur vrei să re-activezi proiectul "${project.name}"?`,
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Re-activează',
          onPress: async () => {
            try {
              await updateProject(project.id, { archived_at: undefined });
              Alert.alert('Succes', 'Proiectul a fost re-activat');
            } catch (error) {
              Alert.alert('Eroare', 'Nu s-a putut re-activa proiectul');
            }
          },
        },
      ]
    );
  };
  
  const handleDeletePress = () => {
    setShowMenu(false);
    
    if (hasUnpaidPayments) {
      Alert.alert(
        'Atenție',
        `Proiectul are ${unpaidPayments.length} plăți neplătite. Sigur vrei să continui?`,
        [
          { text: 'Anulează', style: 'cancel' },
          { text: 'Continuă', onPress: () => setShowDeleteModal(true) },
        ]
      );
    } else {
      setShowDeleteModal(true);
    }
  };
  
  const handleDeleteConfirm = async () => {
    if (deleteConfirmText !== project.name) {
      Alert.alert('Eroare', 'Numele proiectului nu corespunde');
      return;
    }
    
    try {
      await deleteProject(project.id);
      setShowDeleteModal(false);
      setDeleteConfirmText('');
      router.back();
      Alert.alert('Succes', 'Proiectul a fost șters');
    } catch (error) {
      Alert.alert('Eroare', 'Nu s-a putut șterge proiectul');
    }
  };

  return (
    <View style={styles.container}>
      {isArchived && (
        <View style={styles.archivedBanner}>
          <Archive size={16} color={colors.warning} />
          <Text style={styles.archivedText}>Proiect arhivat</Text>
        </View>
      )}
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Informații proiect</Text>
          {isAdmin && (
            <TouchableOpacity
              onPress={() => setShowMenu(true)}
              style={styles.menuButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MoreVertical size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <TagStatus type="project" status={project.status} size="small" />
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Client</Text>
            <Text style={styles.infoValue}>{client?.name || 'N/A'}</Text>
          </View>

          {client?.email && (
            <View style={styles.infoRow}>
              <Mail size={16} color={colors.textSecondary} />
              <Text style={styles.infoValue}>{client.email}</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Creat de</Text>
            <Text style={styles.infoValue}>{project.created_by}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data creării</Text>
            <Text style={styles.infoValue}>{formatDateToDisplay(project.created_at)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Contracte</Text>
            <Text style={styles.infoValue}>{contractsCount}</Text>
          </View>

          {project.start_date && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dată început</Text>
              <Text style={styles.infoValue}>{formatDateToDisplay(project.start_date)}</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Valoare totală</Text>
            <Money amount={total} size="medium" color={colors.text} />
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Plătit</Text>
            <Money amount={paid} size="medium" color={colors.success} />
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rest de încasat</Text>
            <Money amount={remaining} size="medium" color={colors.primary} />
          </View>

          {project.comment && (
            <>
              <View style={styles.divider} />
              <View style={styles.commentSection}>
                <Text style={styles.infoLabel}>Comentariu</Text>
                <Text style={styles.commentText}>{project.comment}</Text>
              </View>
            </>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acces departamente</Text>
        <Text style={styles.sectionDescription}>
          Apasă pentru a deschide/închide accesul la cabine
        </Text>

        <View style={styles.departmentsGrid}>
          {(Object.keys(departmentLabels) as Department[]).map((dept) => {
            const isOpen = project.access[dept];
            return (
              <TouchableOpacity
                key={dept}
                style={[
                  styles.departmentCard,
                  isOpen && styles.departmentCardOpen,
                ]}
                onPress={() => toggleDepartmentAccess(project.id, dept)}
                activeOpacity={0.7}
              >
                <View style={styles.departmentHeader}>
                  {isOpen ? (
                    <Unlock size={18} color={colors.success} />
                  ) : (
                    <Lock size={18} color={colors.textTertiary} />
                  )}
                </View>
                <Text
                  style={[
                    styles.departmentLabel,
                    isOpen && styles.departmentLabelOpen,
                  ]}
                >
                  {departmentLabels[dept]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContent}>
            {isArchived ? (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleReactivate}
              >
                <RotateCcw size={20} color={colors.success} />
                <Text style={[styles.menuItemText, { color: colors.success }]}>Re-activează</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleArchive}
              >
                <Archive size={20} color={colors.warning} />
                <Text style={[styles.menuItemText, { color: colors.warning }]}>Arhivează</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDeletePress}
            >
              <Trash2 size={20} color={colors.error} />
              <Text style={[styles.menuItemText, { color: colors.error }]}>Șterge definitiv</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowDeleteModal(false);
          setDeleteConfirmText('');
        }}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowDeleteModal(false);
            setDeleteConfirmText('');
          }}
        >
          <View style={styles.deleteModalContent}>
            <View style={styles.deleteModalHeader}>
              <Trash2 size={24} color={colors.error} />
              <Text style={styles.deleteModalTitle}>Șterge proiect</Text>
            </View>
            
            <Text style={styles.deleteModalWarning}>
              Această acțiune va șterge DEFINITIV:
            </Text>
            
            <View style={styles.deleteModalList}>
              <Text style={styles.deleteModalListItem}>• {tasks.filter(t => t.project_id === project.id).length} taskuri</Text>
              <Text style={styles.deleteModalListItem}>• {payments.filter(p => p.project_id === project.id).length} plăți</Text>
              <Text style={styles.deleteModalListItem}>• {files.filter(f => f.project_id === project.id).length} fișiere</Text>
              <Text style={styles.deleteModalListItem}>• {chatMessages.filter(m => m.project_id === project.id).length} mesaje chat</Text>
              <Text style={styles.deleteModalListItem}>• {contractsCount} contracte</Text>
            </View>
            
            <Text style={styles.deleteModalInstruction}>
              Pentru a confirma, tastează exact numele proiectului:
            </Text>
            <Text style={styles.deleteModalProjectName}>{project.name}</Text>
            
            <TextInput
              style={styles.deleteModalInput}
              value={deleteConfirmText}
              onChangeText={setDeleteConfirmText}
              placeholder="Tastează numele proiectului"
              placeholderTextColor={colors.textTertiary}
              autoFocus
            />
            
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.deleteModalButtonCancel]}
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
              >
                <Text style={styles.deleteModalButtonTextCancel}>Anulează</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.deleteModalButton,
                  styles.deleteModalButtonDelete,
                  deleteConfirmText !== project.name && styles.deleteModalButtonDisabled,
                ]}
                onPress={handleDeleteConfirm}
                disabled={deleteConfirmText !== project.name}
              >
                <Text style={styles.deleteModalButtonTextDelete}>Șterge definitiv</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  archivedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.warningLight,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  archivedText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.warning,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuButton: {
    padding: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: -8,
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
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 4,
  },
  departmentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  departmentCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  departmentCardOpen: {
    borderColor: colors.success,
    backgroundColor: colors.successLight,
  },
  departmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  departmentLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.textSecondary,
  },
  departmentLabelOpen: {
    color: colors.text,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  menuContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 8,
    width: '100%',
    maxWidth: 280,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderRadius: 10,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500' as const,
  },
  deleteModalContent: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deleteModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.error,
  },
  deleteModalWarning: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 12,
    fontWeight: '600' as const,
  },
  deleteModalList: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    gap: 8,
  },
  deleteModalListItem: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  deleteModalInstruction: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  deleteModalProjectName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 12,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  deleteModalInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    marginBottom: 20,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteModalButtonCancel: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deleteModalButtonDelete: {
    backgroundColor: colors.error,
  },
  deleteModalButtonDisabled: {
    opacity: 0.5,
  },
  deleteModalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  deleteModalButtonTextDelete: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  commentSection: {
    gap: 8,
  },
  commentText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
