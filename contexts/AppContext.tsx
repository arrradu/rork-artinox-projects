import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { fakeApi } from '@/api/fakeApi';
import type { 
  CreateProjectInput, 
  CreateTaskInput,
  CreatePaymentInput,
  UpdateProjectInput,
  UpdateTaskInput,
  UpdatePaymentInput,
  Department,
  CreateFileInput,
  CreateChatMessageInput,
  CreateSalesNoteInput,
  User,
  CreateProjectMemberInput,
  CreateClientInput,
  UpdateClientInput,
  CreateContractInput,
  UpdateContractInput
} from '@/types';

export const [AppContext, useApp] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [currentUser] = useState<User>({
    id: '1',
    name: 'Andrei Ionescu',
    email: 'andrei@artinox.ro',
    role: 'admin',
    department: 'sales',
  });

  const clientsQuery = useQuery({
    queryKey: ['clients'],
    queryFn: fakeApi.clients.getAll,
  });

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: fakeApi.projects.getAll,
  });

  const contractsQuery = useQuery({
    queryKey: ['contracts'],
    queryFn: fakeApi.contracts.getAll,
  });

  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: fakeApi.tasks.getAll,
  });

  const paymentsQuery = useQuery({
    queryKey: ['payments'],
    queryFn: fakeApi.payments.getAll,
  });

  const filesQuery = useQuery({
    queryKey: ['files'],
    queryFn: fakeApi.files.getAll,
  });

  const chatMessagesQuery = useQuery({
    queryKey: ['chatMessages'],
    queryFn: fakeApi.chatMessages.getAll,
  });

  const salesNotesQuery = useQuery({
    queryKey: ['salesNotes'],
    queryFn: fakeApi.salesNotes.getAll,
  });

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: fakeApi.users.getAll,
  });

  const projectMembersQuery = useQuery({
    queryKey: ['projectMembers'],
    queryFn: fakeApi.projectMembers.getAll,
  });

  const createClientMutation = useMutation({
    mutationFn: (input: CreateClientInput) => fakeApi.clients.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateClientInput }) => 
      fakeApi.clients.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: (id: string) => fakeApi.clients.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: (input: CreateProjectInput) => fakeApi.projects.create(input, currentUser.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProjectInput }) => 
      fakeApi.projects.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => fakeApi.projects.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const createContractMutation = useMutation({
    mutationFn: (input: CreateContractInput) => fakeApi.contracts.create(input, currentUser.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const updateContractMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateContractInput }) => 
      fakeApi.contracts.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteContractMutation = useMutation({
    mutationFn: (id: string) => fakeApi.contracts.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (input: CreateTaskInput) => fakeApi.tasks.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) => 
      fakeApi.tasks.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => fakeApi.tasks.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: (input: CreatePaymentInput) => fakeApi.payments.create(input, currentUser.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePaymentInput }) => 
      fakeApi.payments.update(id, input, currentUser.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (id: string) => fakeApi.payments.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const createFileMutation = useMutation({
    mutationFn: (input: CreateFileInput) => fakeApi.files.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: (id: string) => fakeApi.files.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });

  const createChatMessageMutation = useMutation({
    mutationFn: (input: CreateChatMessageInput) => fakeApi.chatMessages.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
    },
  });

  const deleteChatMessageMutation = useMutation({
    mutationFn: (id: string) => fakeApi.chatMessages.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages'] });
    },
  });

  const createSalesNoteMutation = useMutation({
    mutationFn: (input: CreateSalesNoteInput) => fakeApi.salesNotes.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesNotes'] });
    },
  });

  const deleteSalesNoteMutation = useMutation({
    mutationFn: (id: string) => fakeApi.salesNotes.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesNotes'] });
    },
  });

  const createProjectMemberMutation = useMutation({
    mutationFn: (input: CreateProjectMemberInput) => fakeApi.projectMembers.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectMembers'] });
    },
  });

  const deleteProjectMemberMutation = useMutation({
    mutationFn: (id: string) => fakeApi.projectMembers.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectMembers'] });
    },
  });

  const toggleDepartmentAccess = useCallback(async (projectId: string, department: Department) => {
    const project = projectsQuery.data?.find(p => p.id === projectId);
    if (!project) return;

    await updateProjectMutation.mutateAsync({
      id: projectId,
      input: {
        access: {
          [department]: !project.access[department],
        },
      },
    });
  }, [projectsQuery.data, updateProjectMutation.mutateAsync]);

  const updateProject = useCallback((id: string, input: UpdateProjectInput) => 
    updateProjectMutation.mutateAsync({ id, input }), [updateProjectMutation.mutateAsync]);

  const updateContract = useCallback((id: string, input: UpdateContractInput) => 
    updateContractMutation.mutateAsync({ id, input }), [updateContractMutation.mutateAsync]);

  const updateTask = useCallback((id: string, input: UpdateTaskInput) => 
    updateTaskMutation.mutateAsync({ id, input }), [updateTaskMutation.mutateAsync]);

  const updatePayment = useCallback((id: string, input: UpdatePaymentInput) => 
    updatePaymentMutation.mutateAsync({ id, input }), [updatePaymentMutation.mutateAsync]);

  const updateClient = useCallback((id: string, input: UpdateClientInput) => 
    updateClientMutation.mutateAsync({ id, input }), [updateClientMutation.mutateAsync]);

  return useMemo(() => ({
    currentUser,
    
    clients: clientsQuery.data || [],
    clientsLoading: clientsQuery.isLoading,
    clientsError: clientsQuery.error,
    
    projects: projectsQuery.data || [],
    projectsLoading: projectsQuery.isLoading,
    projectsError: projectsQuery.error,
    
    contracts: contractsQuery.data || [],
    contractsLoading: contractsQuery.isLoading,
    contractsError: contractsQuery.error,
    
    tasks: tasksQuery.data || [],
    tasksLoading: tasksQuery.isLoading,
    tasksError: tasksQuery.error,
    
    payments: paymentsQuery.data || [],
    paymentsLoading: paymentsQuery.isLoading,
    paymentsError: paymentsQuery.error,
    
    files: filesQuery.data || [],
    filesLoading: filesQuery.isLoading,
    filesError: filesQuery.error,
    
    chatMessages: chatMessagesQuery.data || [],
    chatMessagesLoading: chatMessagesQuery.isLoading,
    chatMessagesError: chatMessagesQuery.error,
    
    salesNotes: salesNotesQuery.data || [],
    salesNotesLoading: salesNotesQuery.isLoading,
    salesNotesError: salesNotesQuery.error,
    
    users: usersQuery.data || [],
    usersLoading: usersQuery.isLoading,
    usersError: usersQuery.error,
    
    projectMembers: projectMembersQuery.data || [],
    projectMembersLoading: projectMembersQuery.isLoading,
    projectMembersError: projectMembersQuery.error,
    
    createClient: createClientMutation.mutateAsync,
    updateClient,
    deleteClient: deleteClientMutation.mutateAsync,
    
    createProject: createProjectMutation.mutateAsync,
    updateProject,
    deleteProject: deleteProjectMutation.mutateAsync,
    
    createContract: createContractMutation.mutateAsync,
    updateContract,
    deleteContract: deleteContractMutation.mutateAsync,
    
    createTask: createTaskMutation.mutateAsync,
    updateTask,
    deleteTask: deleteTaskMutation.mutateAsync,
    
    createPayment: createPaymentMutation.mutateAsync,
    updatePayment,
    deletePayment: deletePaymentMutation.mutateAsync,
    
    createFile: createFileMutation.mutateAsync,
    deleteFile: deleteFileMutation.mutateAsync,
    
    createChatMessage: createChatMessageMutation.mutateAsync,
    deleteChatMessage: deleteChatMessageMutation.mutateAsync,
    
    createSalesNote: createSalesNoteMutation.mutateAsync,
    deleteSalesNote: deleteSalesNoteMutation.mutateAsync,
    
    createProjectMember: createProjectMemberMutation.mutateAsync,
    deleteProjectMember: deleteProjectMemberMutation.mutateAsync,
    
    toggleDepartmentAccess,
  }), [
    currentUser,
    clientsQuery.data,
    clientsQuery.isLoading,
    clientsQuery.error,
    projectsQuery.data,
    projectsQuery.isLoading,
    projectsQuery.error,
    contractsQuery.data,
    contractsQuery.isLoading,
    contractsQuery.error,
    tasksQuery.data,
    tasksQuery.isLoading,
    tasksQuery.error,
    paymentsQuery.data,
    paymentsQuery.isLoading,
    paymentsQuery.error,
    filesQuery.data,
    filesQuery.isLoading,
    filesQuery.error,
    chatMessagesQuery.data,
    chatMessagesQuery.isLoading,
    chatMessagesQuery.error,
    salesNotesQuery.data,
    salesNotesQuery.isLoading,
    salesNotesQuery.error,
    usersQuery.data,
    usersQuery.isLoading,
    usersQuery.error,
    projectMembersQuery.data,
    projectMembersQuery.isLoading,
    projectMembersQuery.error,
    createClientMutation.mutateAsync,
    updateClient,
    deleteClientMutation.mutateAsync,
    createProjectMutation.mutateAsync,
    updateProject,
    deleteProjectMutation.mutateAsync,
    createContractMutation.mutateAsync,
    updateContract,
    deleteContractMutation.mutateAsync,
    createTaskMutation.mutateAsync,
    updateTask,
    deleteTaskMutation.mutateAsync,
    createPaymentMutation.mutateAsync,
    updatePayment,
    deletePaymentMutation.mutateAsync,
    createFileMutation.mutateAsync,
    deleteFileMutation.mutateAsync,
    createChatMessageMutation.mutateAsync,
    deleteChatMessageMutation.mutateAsync,
    createSalesNoteMutation.mutateAsync,
    deleteSalesNoteMutation.mutateAsync,
    createProjectMemberMutation.mutateAsync,
    deleteProjectMemberMutation.mutateAsync,
    toggleDepartmentAccess,
  ]);
});

export function useProjectById(id: string | undefined) {
  const { projects } = useApp();
  return useMemo(() => projects.find(p => p.id === id), [projects, id]);
}

export function useContractById(id: string | undefined) {
  const { contracts } = useApp();
  return useMemo(() => contracts.find(c => c.id === id), [contracts, id]);
}

export function useClientById(id: string | undefined) {
  const { clients } = useApp();
  return useMemo(() => clients.find(c => c.id === id), [clients, id]);
}

export function useContractsByProjectId(projectId: string | undefined) {
  const { contracts } = useApp();
  return useMemo(() => contracts.filter(c => c.project_id === projectId).sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ), [contracts, projectId]);
}

export function useTasksByProjectId(projectId: string | undefined) {
  const { tasks } = useApp();
  return useMemo(() => tasks.filter(t => t.project_id === projectId), [tasks, projectId]);
}

export function useTasksByContractId(contractId: string | undefined) {
  const { tasks } = useApp();
  return useMemo(() => tasks.filter(t => t.contract_id === contractId), [tasks, contractId]);
}

export function usePaymentsByProjectId(projectId: string | undefined) {
  const { payments } = useApp();
  return useMemo(() => payments.filter(p => p.project_id === projectId), [payments, projectId]);
}

export function usePaymentsByContractId(contractId: string | undefined) {
  const { payments } = useApp();
  return useMemo(() => payments.filter(p => p.contract_id === contractId), [payments, contractId]);
}

export function useMyTasks() {
  const { tasks, currentUser } = useApp();
  return useMemo(() => tasks.filter(t => t.assignee === currentUser.name), [tasks, currentUser.name]);
}

export function useProjectFinancials(projectId: string | undefined) {
  const project = useProjectById(projectId);
  
  return useMemo(() => {
    if (!project) return { total: 0, paid: 0, remaining: 0 };
    
    return {
      total: project.total_value_eur,
      paid: project.paid_eur,
      remaining: project.remaining_eur,
    };
  }, [project]);
}

export function useContractFinancials(contractId: string | undefined) {
  const contract = useContractById(contractId);
  
  return useMemo(() => {
    if (!contract) return { total: 0, paid: 0, remaining: 0 };
    
    return {
      total: contract.value_eur,
      paid: contract.paid_eur,
      remaining: contract.remaining_eur,
    };
  }, [contract]);
}

export function useFilesByProjectId(projectId: string | undefined) {
  const { files } = useApp();
  return useMemo(() => files.filter(f => f.project_id === projectId).sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ), [files, projectId]);
}

export function useFilesByContractId(contractId: string | undefined) {
  const { files } = useApp();
  return useMemo(() => files.filter(f => f.contract_id === contractId).sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ), [files, contractId]);
}

export function useChatMessagesByProjectId(projectId: string | undefined) {
  const { chatMessages } = useApp();
  return useMemo(() => chatMessages.filter(m => m.project_id === projectId).sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  ), [chatMessages, projectId]);
}

export function useChatMessagesByContractId(contractId: string | undefined) {
  const { chatMessages } = useApp();
  return useMemo(() => chatMessages.filter(m => m.contract_id === contractId).sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  ), [chatMessages, contractId]);
}

export function useSalesNotesByProjectId(projectId: string | undefined) {
  const { salesNotes } = useApp();
  return useMemo(() => salesNotes.filter(n => n.project_id === projectId).sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ), [salesNotes, projectId]);
}

export function useSalesNotesByContractId(contractId: string | undefined) {
  const { salesNotes } = useApp();
  return useMemo(() => salesNotes.filter(n => n.contract_id === contractId).sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ), [salesNotes, contractId]);
}

export function useUserById(userId: string | undefined) {
  const { users } = useApp();
  return useMemo(() => users.find(u => u.id === userId), [users, userId]);
}

export function useUsersByDepartment(department: Department) {
  const { users } = useApp();
  return useMemo(() => users.filter(u => u.department === department), [users, department]);
}

export function useProjectMembersByProjectId(projectId: string | undefined) {
  const { projectMembers } = useApp();
  return useMemo(() => projectMembers.filter(pm => pm.project_id === projectId), [projectMembers, projectId]);
}

export function useProjectMembersByUserId(userId: string | undefined) {
  const { projectMembers } = useApp();
  return useMemo(() => projectMembers.filter(pm => pm.user_id === userId), [projectMembers, userId]);
}

export function useVisibleProjects() {
  const { projects, currentUser, projectMembers } = useApp();
  
  return useMemo(() => {
    if (currentUser.role === 'admin') {
      return projects;
    }
    
    return projects.filter(project => {
      const hasAccess = project.access[currentUser.department];
      const isMember = projectMembers.some(
        pm => pm.project_id === project.id && pm.user_id === currentUser.id
      );
      return hasAccess || isMember;
    });
  }, [projects, currentUser, projectMembers]);
}

export function useTasksByUserId(userId: string | undefined) {
  const { tasks, users } = useApp();
  const user = useMemo(() => users.find(u => u.id === userId), [users, userId]);
  
  return useMemo(() => {
    if (!user) return [];
    return tasks.filter(t => t.assignee === user.name);
  }, [tasks, user]);
}
