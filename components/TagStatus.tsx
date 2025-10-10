import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '@/constants/colors';
import type { ProjectStatus, TaskStatus, PaymentStatus, ContractStatus } from '@/types';

interface TagStatusProps {
  type: 'project' | 'contract' | 'task' | 'payment';
  status: ProjectStatus | ContractStatus | TaskStatus | PaymentStatus;
  size?: 'small' | 'medium';
}

const projectLabels: Record<ProjectStatus, string> = {
  nou: 'Nou',
  in_lucru: 'În lucru',
  livrare: 'Livrare',
  finalizat: 'Finalizat',
  anulat: 'Anulat',
};

const contractLabels: Record<ContractStatus, string> = {
  nou: 'Nou',
  in_lucru: 'În lucru',
  livrare: 'Livrare',
  finalizat: 'Finalizat',
};

const taskLabels: Record<TaskStatus, string> = {
  todo: 'De făcut',
  doing: 'În lucru',
  done: 'Finalizat',
};

const paymentLabels: Record<PaymentStatus, string> = {
  neplatit: 'Neplătit',
  partial: 'Parțial',
  platit: 'Plătit',
};

const projectColors: Record<ProjectStatus, { bg: string; text: string }> = {
  nou: { bg: colors.statusNouLight, text: colors.statusNou },
  in_lucru: { bg: colors.statusInLucruLight, text: colors.statusInLucru },
  livrare: { bg: colors.statusLivrareLight, text: colors.statusLivrare },
  finalizat: { bg: colors.statusFinalizatLight, text: colors.statusFinalizat },
  anulat: { bg: colors.statusAnulatLight, text: colors.statusAnulat },
};

const contractColors: Record<ContractStatus, { bg: string; text: string }> = {
  nou: { bg: colors.statusNouLight, text: colors.statusNou },
  in_lucru: { bg: colors.statusInLucruLight, text: colors.statusInLucru },
  livrare: { bg: colors.statusLivrareLight, text: colors.statusLivrare },
  finalizat: { bg: colors.statusFinalizatLight, text: colors.statusFinalizat },
};

const taskColors: Record<TaskStatus, { bg: string; text: string }> = {
  todo: { bg: colors.taskTodoLight, text: colors.taskTodo },
  doing: { bg: colors.taskDoingLight, text: colors.taskDoing },
  done: { bg: colors.taskDoneLight, text: colors.taskDone },
};

const paymentColors: Record<PaymentStatus, { bg: string; text: string }> = {
  neplatit: { bg: colors.paymentNeplatitLight, text: colors.paymentNeplatit },
  partial: { bg: colors.paymentPartialLight, text: colors.paymentPartial },
  platit: { bg: colors.paymentPlatitLight, text: colors.paymentPlatit },
};

export default function TagStatus({ type, status, size = 'medium' }: TagStatusProps) {
  let label = '';
  let colorScheme: { bg: string; text: string } = { bg: colors.border, text: colors.text };

  if (type === 'project') {
    label = projectLabels[status as ProjectStatus];
    colorScheme = projectColors[status as ProjectStatus];
  } else if (type === 'contract') {
    label = contractLabels[status as ContractStatus];
    colorScheme = contractColors[status as ContractStatus];
  } else if (type === 'task') {
    label = taskLabels[status as TaskStatus];
    colorScheme = taskColors[status as TaskStatus];
  } else if (type === 'payment') {
    label = paymentLabels[status as PaymentStatus];
    colorScheme = paymentColors[status as PaymentStatus];
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colorScheme.bg },
        size === 'small' && styles.containerSmall,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: colorScheme.text },
          size === 'small' && styles.textSmall,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  containerSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  text: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  textSmall: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
});
