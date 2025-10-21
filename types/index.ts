export type Department = 'sales' | 'produce' | 'conta' | 'depozit' | 'vamuire' | 'livrare' | 'achizitii' | 'logistica';

export type UserRole = 'admin' | 'sales' | 'produce' | 'conta' | 'depozit' | 'vamuire' | 'livrare' | 'achizitii' | 'logistica';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: Department;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role?: string;
}

export type ProjectStatus = 'nou' | 'in_lucru' | 'livrare' | 'finalizat' | 'anulat';

export type ContractStatus = 'nou' | 'in_lucru' | 'livrare' | 'finalizat' | 'anulat';

export type TaskStatus = 'todo' | 'doing' | 'done';

export type PaymentStatus = 'neplatit' | 'partial' | 'platit';

export interface Project {
  id: string;
  client_id: string;
  name: string;
  status: ProjectStatus;
  created_by: string;
  created_at: string;
  start_date?: string;
  comment?: string;
  total_value_eur?: number;
  paid_eur?: number;
  remaining_eur?: number;
  access: Record<Department, boolean>;
  archived_at?: string;
}

export interface Contract {
  id: string;
  project_id: string;
  title: string;
  code?: string;
  description?: string;
  start_date?: string;
  value_eur: number;
  paid_eur: number;
  remaining_eur: number;
  status: ContractStatus;
  created_at: string;
  created_by: string;
}

export interface Task {
  id: string;
  project_id?: string;
  contract_id?: string;
  title: string;
  assignee: string;
  due_date?: string;
  status: TaskStatus;
  created_at: string;
  done_at?: string;
}

export interface Payment {
  id: string;
  project_id?: string;
  contract_id?: string;
  label: string;
  amount: number;
  due_date?: string;
  status: PaymentStatus;
  paid_amount?: number;
  paid_at?: string;
  created_by: string;
  created_at: string;
  marked_paid_by?: string;
  marked_paid_at?: string;
  comment?: string;
  attachment_url?: string;
}

export interface CreateClientInput {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface CreateProjectInput {
  client_id: string;
  name: string;
  status?: ProjectStatus;
  start_date?: string;
  comment?: string;
  total_value_eur?: number;
}

export interface CreateContractInput {
  project_id: string;
  title: string;
  code?: string;
  description?: string;
  start_date?: string;
  value_eur: number;
}

export interface CreateTaskInput {
  project_id?: string;
  contract_id?: string;
  title: string;
  assignee: string;
  due_date?: string;
  status?: TaskStatus;
}

export interface CreatePaymentInput {
  project_id?: string;
  contract_id?: string;
  label: string;
  amount: number;
  due_date?: string;
  status?: PaymentStatus;
  comment?: string;
}

export interface UpdateProjectInput {
  name?: string;
  status?: ProjectStatus;
  access?: Partial<Record<Department, boolean>>;
  archived_at?: string;
}

export interface UpdateContractInput {
  title?: string;
  code?: string;
  description?: string;
  start_date?: string;
  value_eur?: number;
  status?: ContractStatus;
}

export interface UpdateTaskInput {
  title?: string;
  assignee?: string;
  due_date?: string;
  status?: TaskStatus;
}

export interface UpdatePaymentInput {
  label?: string;
  amount?: number;
  due_date?: string;
  status?: PaymentStatus;
  paid_amount?: number;
  paid_at?: string;
  comment?: string;
  attachment_url?: string;
}

export type FileTag = 'cerere' | 'contract' | 'desen' | 'poza' | 'altul';

export interface ProjFile {
  id: string;
  project_id?: string;
  contract_id?: string;
  name: string;
  url: string;
  tag: FileTag;
  size?: number;
  mime_type?: string;
  uploader?: string;
  created_at: string;
}

export interface Attachment {
  id: string;
  message_id: string;
  name: string;
  url: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  project_id?: string;
  contract_id?: string;
  author_id: string;
  author_name: string;
  text?: string;
  attachments?: Attachment[];
  reply_to_id?: string;
  created_at: string;
}



export interface CreateFileInput {
  project_id?: string;
  contract_id?: string;
  name: string;
  url: string;
  tag: FileTag;
  size?: number;
  mime_type?: string;
  uploader?: string;
}

export interface CreateChatMessageInput {
  project_id?: string;
  contract_id?: string;
  author_id: string;
  author_name: string;
  text?: string;
  attachments?: Omit<Attachment, 'id' | 'message_id' | 'created_at'>[];
  reply_to_id?: string;
}

export type ProcStatus = 'de_comandat' | 'comandat' | 'in_tranzit' | 'livrat_partial' | 'receptionat';

export type ProcUnit = 'kg' | 'buc' | 'm' | 'L' | 'ml';

export type TransportType = 'propriu' | 'extern';

export interface TransportInfo {
  type: TransportType;
  vehicle_number?: string;
  cmr_awb?: string;
  eta?: string;
}

export interface ProcItem {
  id: string;
  project_id?: string;
  contract_id?: string;
  name: string;
  qty: number;
  unit: ProcUnit;
  supplier?: string;
  price_estimate?: number;
  assignee?: string;
  due_date?: string;
  status: ProcStatus;
  po_number?: string;
  attachment_url?: string;
  transport?: TransportInfo;
  qty_received?: number;
  updated_at: string;
}

export interface CreateProcItemInput {
  project_id?: string;
  contract_id?: string;
  name: string;
  qty: number;
  unit: ProcUnit;
  supplier?: string;
  price_estimate?: number;
  assignee?: string;
  due_date?: string;
  status?: ProcStatus;
  po_number?: string;
  attachment_url?: string;
}

export interface UpdateProcItemInput {
  name?: string;
  qty?: number;
  unit?: ProcUnit;
  supplier?: string;
  price_estimate?: number;
  assignee?: string;
  due_date?: string;
  status?: ProcStatus;
  po_number?: string;
  attachment_url?: string;
  transport?: TransportInfo;
  qty_received?: number;
}

export interface CreateProjectMemberInput {
  project_id: string;
  user_id: string;
  role?: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  role: UserRole;
  department: Department;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: UserRole;
  department?: Department;
}
