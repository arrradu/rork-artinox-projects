import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Mail, Lock, Unlock } from 'lucide-react-native';
import TagStatus from '@/components/TagStatus';
import Money from '@/components/Money';
import { useApp, useProjectFinancials } from '@/contexts/AppContext';
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
  const { toggleDepartmentAccess } = useApp();
  const { total, paid, remaining } = useProjectFinancials(project.id);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informații proiect</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <TagStatus type="project" status={project.status} size="small" />
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Client</Text>
            <Text style={styles.infoValue}>{project.client_name}</Text>
          </View>

          {project.client_email && (
            <View style={styles.infoRow}>
              <Mail size={16} color={colors.textSecondary} />
              <Text style={styles.infoValue}>{project.client_email}</Text>
            </View>
          )}

          {project.value_total !== undefined && (
            <>
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
});
