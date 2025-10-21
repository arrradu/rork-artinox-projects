import type { 
  Project, 
  Contract,
  Task, 
  Payment, 
  CreateProjectInput,
  CreateContractInput,
  CreateTaskInput, 
  CreatePaymentInput,
  UpdateProjectInput,
  UpdateContractInput,
  UpdateTaskInput,
  UpdatePaymentInput,
  Department,
  ProjFile,
  ChatMessage,
  Attachment,
  CreateFileInput,
  CreateChatMessageInput,
  ProcItem,
  CreateProcItemInput,
  UpdateProcItemInput,
  User,
  ProjectMember,
  CreateProjectMemberInput,
  Client,
  CreateClientInput,
  CreateUserInput,
  UpdateUserInput
} from '@/types';

let clients: Client[] = [
  {
    id: '1',
    name: 'SC Construct Design SRL',
    email: 'contact@constructdesign.ro',
    phone: '+40 721 123 456',
    created_at: '2024-12-01T10:00:00Z',
  },
  {
    id: '2',
    name: 'Popescu Ion',
    email: 'ion.popescu@email.com',
    phone: '+40 722 234 567',
    created_at: '2024-12-15T14:00:00Z',
  },
  {
    id: '3',
    name: 'Restaurant La Mama',
    email: 'comenzi@lamama.ro',
    phone: '+40 723 345 678',
    address: 'Str. Principală nr. 10, București',
    created_at: '2024-11-20T09:00:00Z',
  },
];

let projects: Project[] = [
  {
    id: '1',
    client_id: '1',
    name: 'Proiect Balustrade Construct Design',
    status: 'in_lucru',
    created_by: 'Andrei Ionescu',
    created_at: '2025-01-05T10:00:00Z',
    access: {
      sales: true,
      produce: true,
      conta: true,
      depozit: false,
      vamuire: false,
      livrare: false,
      achizitii: true,
      logistica: false,
    },
  },
  {
    id: '2',
    client_id: '2',
    name: 'Poartă Automată Popescu',
    status: 'nou',
    created_by: 'Andrei Ionescu',
    created_at: '2025-01-08T14:30:00Z',
    access: {
      sales: true,
      produce: false,
      conta: false,
      depozit: false,
      vamuire: false,
      livrare: false,
      achizitii: false,
      logistica: false,
    },
  },
  {
    id: '3',
    client_id: '3',
    name: 'Mobilier Restaurant La Mama',
    status: 'livrare',
    created_by: 'Maria Popescu',
    created_at: '2024-12-10T09:00:00Z',
    access: {
      sales: true,
      produce: true,
      conta: true,
      depozit: true,
      vamuire: false,
      livrare: true,
      achizitii: true,
      logistica: true,
    },
  },
];

let contracts: Contract[] = [
  {
    id: '1',
    project_id: '1',
    title: 'Balustradă Inox Scară Interioară',
    code: 'CNT-2025-001',
    value_eur: 15000,
    paid_eur: 6000,
    remaining_eur: 9000,
    status: 'in_lucru',
    start_date: '2025-01-05T00:00:00Z',
    created_by: 'Andrei Ionescu',
    created_at: '2025-01-05T10:00:00Z',
  },
  {
    id: '2',
    project_id: '2',
    title: 'Poartă Automată Inox',
    code: 'CNT-2025-002',
    value_eur: 8500,
    paid_eur: 0,
    remaining_eur: 8500,
    status: 'nou',
    start_date: '2025-01-08T00:00:00Z',
    created_by: 'Andrei Ionescu',
    created_at: '2025-01-08T14:30:00Z',
  },
  {
    id: '3',
    project_id: '3',
    title: 'Mobilier Bucătărie Inox',
    code: 'CNT-2024-089',
    value_eur: 32000,
    paid_eur: 26000,
    remaining_eur: 6000,
    status: 'livrare',
    start_date: '2024-12-10T00:00:00Z',
    created_by: 'Maria Popescu',
    created_at: '2024-12-10T09:00:00Z',
  },
];

let tasks: Task[] = [
  {
    id: '1',
    contract_id: '1',
    title: 'Măsurători la fața locului',
    assignee: 'Andrei Ionescu',
    due_date: '2025-01-12T12:00:00Z',
    status: 'done',
    created_at: '2025-01-05T10:30:00Z',
    done_at: '2025-01-11T16:00:00Z',
  },
  {
    id: '2',
    contract_id: '1',
    title: 'Comandă materiale inox',
    assignee: 'Andrei Ionescu',
    due_date: '2025-01-15T12:00:00Z',
    status: 'doing',
    created_at: '2025-01-05T10:35:00Z',
  },
  {
    id: '3',
    contract_id: '1',
    title: 'Producție balustradă',
    assignee: 'Andrei Ionescu',
    due_date: '2025-01-20T12:00:00Z',
    status: 'todo',
    created_at: '2025-01-05T10:40:00Z',
  },
  {
    id: '4',
    contract_id: '2',
    title: 'Întocmire ofertă detaliată',
    assignee: 'Andrei Ionescu',
    due_date: '2025-01-11T12:00:00Z',
    status: 'doing',
    created_at: '2025-01-08T14:35:00Z',
  },
  {
    id: '5',
    contract_id: '3',
    title: 'Verificare finală înainte de livrare',
    assignee: 'Andrei Ionescu',
    due_date: '2025-01-10T12:00:00Z',
    status: 'todo',
    created_at: '2024-12-10T09:30:00Z',
  },
];

let payments: Payment[] = [
  {
    id: '1',
    contract_id: '1',
    label: 'Avans 40%',
    amount: 6000,
    due_date: '2025-01-10T12:00:00Z',
    status: 'platit',
    paid_amount: 6000,
    paid_at: '2025-01-09T10:00:00Z',
    created_by: 'Andrei Ionescu',
    created_at: '2025-01-05T10:30:00Z',
    marked_paid_by: 'Elena Dumitrescu',
    marked_paid_at: '2025-01-09T10:00:00Z',
  },
  {
    id: '2',
    contract_id: '1',
    label: 'Tranșă la livrare 60%',
    amount: 9000,
    due_date: '2025-01-25T12:00:00Z',
    status: 'neplatit',
    created_by: 'Andrei Ionescu',
    created_at: '2025-01-05T10:35:00Z',
  },
  {
    id: '3',
    contract_id: '2',
    label: 'Plată integrală',
    amount: 8500,
    status: 'neplatit',
    created_by: 'Andrei Ionescu',
    created_at: '2025-01-08T14:40:00Z',
  },
  {
    id: '4',
    contract_id: '3',
    label: 'Avans 50%',
    amount: 16000,
    due_date: '2024-12-15T12:00:00Z',
    status: 'platit',
    paid_amount: 16000,
    paid_at: '2024-12-14T11:00:00Z',
    created_by: 'Maria Popescu',
    created_at: '2024-12-10T09:30:00Z',
    marked_paid_by: 'Elena Dumitrescu',
    marked_paid_at: '2024-12-14T11:00:00Z',
  },
  {
    id: '5',
    contract_id: '3',
    label: 'Rest la livrare 50%',
    amount: 16000,
    due_date: '2025-01-10T12:00:00Z',
    status: 'partial',
    paid_amount: 10000,
    paid_at: '2025-01-09T15:00:00Z',
    created_by: 'Maria Popescu',
    created_at: '2024-12-10T09:35:00Z',
    marked_paid_by: 'Elena Dumitrescu',
    marked_paid_at: '2025-01-09T15:00:00Z',
  },
];

let files: ProjFile[] = [
  {
    id: '1',
    contract_id: '1',
    name: 'Cerere client - Balustradă.pdf',
    url: 'https://example.com/files/cerere-1.pdf',
    tag: 'cerere',
    size: 245000,
    mime_type: 'application/pdf',
    uploader: 'Andrei Ionescu',
    created_at: '2025-01-05T10:15:00Z',
  },
  {
    id: '2',
    contract_id: '1',
    name: 'Contract semnat.pdf',
    url: 'https://example.com/files/contract-1.pdf',
    tag: 'contract',
    size: 512000,
    mime_type: 'application/pdf',
    uploader: 'Maria Popescu',
    created_at: '2025-01-06T14:30:00Z',
  },
  {
    id: '3',
    contract_id: '1',
    name: 'Desen tehnic balustradă.dwg',
    url: 'https://example.com/files/desen-1.dwg',
    tag: 'desen',
    size: 1024000,
    mime_type: 'application/acad',
    uploader: 'Ion Vasile',
    created_at: '2025-01-07T09:00:00Z',
  },
  {
    id: '4',
    contract_id: '3',
    name: 'Poze bucătărie existentă.zip',
    url: 'https://example.com/files/poze-3.zip',
    tag: 'poza',
    size: 5120000,
    mime_type: 'application/zip',
    uploader: 'Andrei Ionescu',
    created_at: '2024-12-10T10:00:00Z',
  },
  {
    id: '5',
    contract_id: '1',
    name: 'Imagine balustradă referință.jpg',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    tag: 'poza',
    size: 856000,
    mime_type: 'image/jpeg',
    uploader: 'Maria Popescu',
    created_at: '2025-01-08T11:00:00Z',
  },
];

let chatMessages: ChatMessage[] = [
  {
    id: '1',
    contract_id: '1',
    author_id: '1',
    author_name: 'Andrei Ionescu',
    text: 'Am finalizat măsurătorile. Totul arată bine.',
    created_at: '2025-01-11T16:30:00Z',
  },
  {
    id: '2',
    contract_id: '1',
    author_id: '2',
    author_name: 'Maria Popescu',
    text: 'Perfect! Când estimezi că putem începe producția?',
    reply_to_id: '1',
    created_at: '2025-01-11T17:00:00Z',
  },
  {
    id: '3',
    contract_id: '1',
    author_id: '1',
    author_name: 'Andrei Ionescu',
    text: 'După ce primim materialele, în 2-3 zile lucrătoare.',
    reply_to_id: '2',
    created_at: '2025-01-11T17:15:00Z',
  },
  {
    id: '4',
    contract_id: '3',
    author_id: '3',
    author_name: 'Ion Vasile',
    text: 'Clientul a confirmat data livrării pentru 10 ianuarie.',
    created_at: '2025-01-08T11:00:00Z',
  },
  {
    id: '5',
    contract_id: '1',
    author_id: '1',
    author_name: 'Andrei Ionescu',
    text: 'Iată pozele de la fața locului:',
    attachments: [
      {
        id: 'att1',
        message_id: '5',
        name: 'Scara_interior.jpg',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
        mime_type: 'image/jpeg',
        size_bytes: 856000,
        created_at: '2025-01-11T16:25:00Z',
      },
      {
        id: 'att2',
        message_id: '5',
        name: 'Detaliu_balustrada.jpg',
        url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
        mime_type: 'image/jpeg',
        size_bytes: 742000,
        created_at: '2025-01-11T16:25:00Z',
      },
    ],
    created_at: '2025-01-11T16:25:00Z',
  },
  {
    id: '6',
    contract_id: '1',
    author_id: '2',
    author_name: 'Maria Popescu',
    text: 'Am atașat desenul tehnic actualizat.',
    attachments: [
      {
        id: 'att3',
        message_id: '6',
        name: 'Desen_tehnic_v2.pdf',
        url: 'https://example.com/files/desen-v2.pdf',
        mime_type: 'application/pdf',
        size_bytes: 1245000,
        created_at: '2025-01-12T09:00:00Z',
      },
    ],
    created_at: '2025-01-12T09:00:00Z',
  },
];

let users: User[] = [
  {
    id: '1',
    name: 'Andrei Ionescu',
    email: 'andrei@artinox.ro',
    role: 'admin',
    department: 'sales',
  },
  {
    id: '2',
    name: 'Maria Popescu',
    email: 'maria@artinox.ro',
    role: 'produce',
    department: 'produce',
  },
  {
    id: '3',
    name: 'Ion Vasile',
    email: 'ion@artinox.ro',
    role: 'achizitii',
    department: 'achizitii',
  },
  {
    id: '4',
    name: 'Elena Dumitrescu',
    email: 'elena@artinox.ro',
    role: 'conta',
    department: 'conta',
  },
  {
    id: '5',
    name: 'Mihai Georgescu',
    email: 'mihai@artinox.ro',
    role: 'livrare',
    department: 'livrare',
  },
  {
    id: '6',
    name: 'Ana Marinescu',
    email: 'ana@artinox.ro',
    role: 'depozit',
    department: 'depozit',
  },
  {
    id: '7',
    name: 'Cristian Popa',
    email: 'cristian@artinox.ro',
    role: 'vamuire',
    department: 'vamuire',
  },
  {
    id: '8',
    name: 'Laura Stan',
    email: 'laura@artinox.ro',
    role: 'logistica',
    department: 'logistica',
  },
];

let projectMembers: ProjectMember[] = [
  { id: '1', project_id: '1', user_id: '1' },
  { id: '2', project_id: '1', user_id: '2' },
  { id: '3', project_id: '1', user_id: '3' },
  { id: '4', project_id: '2', user_id: '1' },
  { id: '5', project_id: '3', user_id: '1' },
  { id: '6', project_id: '3', user_id: '2' },
  { id: '7', project_id: '3', user_id: '3' },
  { id: '8', project_id: '3', user_id: '4' },
  { id: '9', project_id: '3', user_id: '5' },
  { id: '10', project_id: '3', user_id: '6' },
];

let procItems: ProcItem[] = [
  {
    id: '1',
    contract_id: '1',
    name: 'Țeavă inox Ø42mm',
    qty: 50,
    unit: 'm',
    supplier: 'Inox Distribution SRL',
    price_estimate: 2500,
    assignee: 'Ion Vasile',
    due_date: '2025-01-14T12:00:00Z',
    status: 'comandat',
    po_number: 'PO-2025-001',
    updated_at: '2025-01-10T10:00:00Z',
  },
  {
    id: '2',
    contract_id: '1',
    name: 'Șuruburi inox M8',
    qty: 200,
    unit: 'buc',
    supplier: 'Inox Distribution SRL',
    price_estimate: 150,
    assignee: 'Ion Vasile',
    due_date: '2025-01-14T12:00:00Z',
    status: 'in_tranzit',
    po_number: 'PO-2025-001',
    transport: {
      type: 'extern',
      vehicle_number: 'B-123-ABC',
      cmr_awb: 'CMR-2025-0042',
      eta: '2025-01-13T14:00:00Z',
    },
    updated_at: '2025-01-11T15:30:00Z',
  },
  {
    id: '3',
    contract_id: '1',
    name: 'Placă inox 2mm',
    qty: 15,
    unit: 'buc',
    status: 'de_comandat',
    assignee: 'Ion Vasile',
    updated_at: '2025-01-10T09:00:00Z',
  },
  {
    id: '4',
    contract_id: '3',
    name: 'Blat inox 1.5mm',
    qty: 25,
    unit: 'm',
    supplier: 'Metal Pro SRL',
    price_estimate: 5000,
    assignee: 'Maria Popescu',
    due_date: '2025-01-05T12:00:00Z',
    status: 'receptionat',
    po_number: 'PO-2024-089',
    qty_received: 25,
    updated_at: '2025-01-05T16:00:00Z',
  },
];

const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

export const fakeApi = {
  clients: {
    getAll: async (): Promise<Client[]> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return [...clients];
    },
    
    getById: async (id: string): Promise<Client | undefined> => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return clients.find(c => c.id === id);
    },
    
    create: async (input: CreateClientInput): Promise<Client> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const newClient: Client = {
        id: generateId(),
        name: input.name,
        email: input.email,
        phone: input.phone,
        address: input.address,
        created_at: new Date().toISOString(),
      };
      
      clients = [newClient, ...clients];
      return newClient;
    },
  },
  
  users: {
    getAll: async (): Promise<User[]> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return [...users];
    },
    
    getById: async (id: string): Promise<User | undefined> => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return users.find(u => u.id === id);
    },
    
    getByDepartment: async (department: Department): Promise<User[]> => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return users.filter(u => u.department === department);
    },
    
    create: async (input: CreateUserInput): Promise<User> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const newUser: User = {
        id: generateId(),
        name: input.name,
        email: input.email,
        role: input.role,
        department: input.department,
      };
      
      users = [...users, newUser];
      return newUser;
    },
    
    update: async (id: string, input: UpdateUserInput): Promise<User | undefined> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const index = users.findIndex(u => u.id === id);
      if (index === -1) return undefined;
      
      const updated: User = {
        ...users[index],
        ...input,
      };
      
      users[index] = updated;
      return updated;
    },
    
    delete: async (id: string): Promise<boolean> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      const initialLength = users.length;
      users = users.filter(u => u.id !== id);
      return users.length < initialLength;
    },
  },
  
  projectMembers: {
    getAll: async (): Promise<ProjectMember[]> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return [...projectMembers];
    },
    
    getByProjectId: async (projectId: string): Promise<ProjectMember[]> => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return projectMembers.filter(pm => pm.project_id === projectId);
    },
    
    getByUserId: async (userId: string): Promise<ProjectMember[]> => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return projectMembers.filter(pm => pm.user_id === userId);
    },
    
    create: async (input: CreateProjectMemberInput): Promise<ProjectMember> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const newMember: ProjectMember = {
        id: generateId(),
        project_id: input.project_id,
        user_id: input.user_id,
        role: input.role,
      };
      
      projectMembers = [...projectMembers, newMember];
      return newMember;
    },
    
    delete: async (id: string): Promise<boolean> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      const initialLength = projectMembers.length;
      projectMembers = projectMembers.filter(pm => pm.id !== id);
      return projectMembers.length < initialLength;
    },
  },
  
  procItems: {
    getAll: async (): Promise<ProcItem[]> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return [...procItems];
    },
    
    getByProjectId: async (projectId: string): Promise<ProcItem[]> => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return procItems.filter(p => p.project_id === projectId).sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    },
    
    getByContractId: async (contractId: string): Promise<ProcItem[]> => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return procItems.filter(p => p.contract_id === contractId).sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    },
    
    getById: async (id: string): Promise<ProcItem | undefined> => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return procItems.find(p => p.id === id);
    },
    
    create: async (input: CreateProcItemInput): Promise<ProcItem> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const newItem: ProcItem = {
        id: generateId(),
        project_id: input.project_id,
        contract_id: input.contract_id,
        name: input.name,
        qty: input.qty,
        unit: input.unit,
        supplier: input.supplier,
        price_estimate: input.price_estimate,
        assignee: input.assignee,
        due_date: input.due_date,
        status: input.status || 'de_comandat',
        po_number: input.po_number,
        attachment_url: input.attachment_url,
        updated_at: new Date().toISOString(),
      };
      
      procItems = [newItem, ...procItems];
      return newItem;
    },
    
    update: async (id: string, input: UpdateProcItemInput): Promise<ProcItem | undefined> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const index = procItems.findIndex(p => p.id === id);
      if (index === -1) return undefined;
      
      const updated: ProcItem = {
        ...procItems[index],
        ...input,
        transport: input.transport 
          ? { ...procItems[index].transport, ...input.transport }
          : procItems[index].transport,
        updated_at: new Date().toISOString(),
      };
      
      procItems[index] = updated;
      return updated;
    },
    
    delete: async (id: string): Promise<boolean> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      const initialLength = procItems.length;
      procItems = procItems.filter(p => p.id !== id);
      return procItems.length < initialLength;
    },
  },
  
  files: {
    getAll: async (): Promise<ProjFile[]> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return [...files];
    },
    
    getByProjectId: async (projectId: string): Promise<ProjFile[]> => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return files.filter(f => f.project_id === projectId).sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    
    getByContractId: async (contractId: string): Promise<ProjFile[]> => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return files.filter(f => f.contract_id === contractId).sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    
    create: async (input: CreateFileInput): Promise<ProjFile> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const newFile: ProjFile = {
        id: generateId(),
        project_id: input.project_id,
        contract_id: input.contract_id,
        name: input.name,
        url: input.url,
        tag: input.tag,
        size: input.size,
        mime_type: input.mime_type,
        uploader: input.uploader,
        created_at: new Date().toISOString(),
      };
      
      files = [newFile, ...files];
      return newFile;
    },
    
    delete: async (id: string): Promise<boolean> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      const initialLength = files.length;
      files = files.filter(f => f.id !== id);
      return files.length < initialLength;
    },
  },
  
  chatMessages: {
    getAll: async (): Promise<ChatMessage[]> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return [...chatMessages];
    },
    
    getByProjectId: async (projectId: string): Promise<ChatMessage[]> => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return chatMessages.filter(m => m.project_id === projectId).sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    },
    
    getByContractId: async (contractId: string): Promise<ChatMessage[]> => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return chatMessages.filter(m => m.contract_id === contractId).sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    },
    
    create: async (input: CreateChatMessageInput): Promise<ChatMessage> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const attachments: Attachment[] = (input.attachments || []).map(att => ({
        id: generateId(),
        message_id: '',
        name: att.name,
        url: att.url,
        mime_type: att.mime_type,
        size_bytes: att.size_bytes,
        created_at: new Date().toISOString(),
      }));
      
      const newMessage: ChatMessage = {
        id: generateId(),
        project_id: input.project_id,
        contract_id: input.contract_id,
        author_id: input.author_id,
        author_name: input.author_name,
        text: input.text,
        attachments: attachments.length > 0 ? attachments : undefined,
        reply_to_id: input.reply_to_id,
        created_at: new Date().toISOString(),
      };
      
      if (attachments.length > 0) {
        attachments.forEach(att => {
          att.message_id = newMessage.id;
        });
      }
      
      chatMessages = [...chatMessages, newMessage];
      return newMessage;
    },
    
    delete: async (id: string): Promise<boolean> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      const initialLength = chatMessages.length;
      chatMessages = chatMessages.filter(m => m.id !== id);
      return chatMessages.length < initialLength;
    },
  },
  
  projects: {
    getAll: async (): Promise<Project[]> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return [...projects];
    },
    
    getById: async (id: string): Promise<Project | undefined> => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return projects.find(p => p.id === id);
    },
    
    create: async (input: CreateProjectInput, currentUser: string): Promise<Project> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const defaultAccess: Record<Department, boolean> = {
        sales: true,
        produce: false,
        conta: false,
        depozit: false,
        vamuire: false,
        livrare: false,
        achizitii: false,
        logistica: false,
      };
      
      const newProject: Project = {
        id: generateId(),
        client_id: input.client_id,
        name: input.name,
        status: input.status || 'nou',
        created_by: currentUser,
        created_at: new Date().toISOString(),
        start_date: input.start_date,
        comment: input.comment,
        total_value_eur: input.total_value_eur,
        access: defaultAccess,
      };
      
      projects = [newProject, ...projects];
      return newProject;
    },
    
    update: async (id: string, input: UpdateProjectInput): Promise<Project | undefined> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const index = projects.findIndex(p => p.id === id);
      if (index === -1) return undefined;
      
      const updated: Project = {
        ...projects[index],
        ...input,
        access: input.access 
          ? { ...projects[index].access, ...input.access }
          : projects[index].access,
      };
      
      projects[index] = updated;
      return updated;
    },
    
    delete: async (id: string): Promise<boolean> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      const initialLength = projects.length;
      projects = projects.filter(p => p.id !== id);
      return projects.length < initialLength;
    },
  },
  
  contracts: {
    getAll: async (): Promise<Contract[]> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return [...contracts];
    },
    
    getById: async (id: string): Promise<Contract | undefined> => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return contracts.find(c => c.id === id);
    },
    
    getByProjectId: async (projectId: string): Promise<Contract[]> => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return contracts.filter(c => c.project_id === projectId).sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    
    create: async (input: CreateContractInput, currentUser: string): Promise<Contract> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const newContract: Contract = {
        id: generateId(),
        project_id: input.project_id,
        title: input.title,
        code: input.code,
        description: input.description,
        start_date: input.start_date,
        value_eur: input.value_eur,
        paid_eur: 0,
        remaining_eur: input.value_eur,
        status: 'nou',
        created_by: currentUser,
        created_at: new Date().toISOString(),
      };
      
      contracts = [newContract, ...contracts];
      return newContract;
    },
    
    update: async (id: string, input: UpdateContractInput): Promise<Contract | undefined> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const index = contracts.findIndex(c => c.id === id);
      if (index === -1) return undefined;
      
      const updated: Contract = {
        ...contracts[index],
        ...input,
      };
      
      if (input.value_eur !== undefined) {
        updated.remaining_eur = input.value_eur - updated.paid_eur;
      }
      
      contracts[index] = updated;
      return updated;
    },
    
    delete: async (id: string): Promise<boolean> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      const initialLength = contracts.length;
      contracts = contracts.filter(c => c.id !== id);
      return contracts.length < initialLength;
    },
  },
  
  tasks: {
    getAll: async (): Promise<Task[]> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return [...tasks];
    },
    
    getByProjectId: async (projectId: string): Promise<Task[]> => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return tasks.filter(t => t.project_id === projectId);
    },
    
    getByContractId: async (contractId: string): Promise<Task[]> => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return tasks.filter(t => t.contract_id === contractId);
    },
    
    getById: async (id: string): Promise<Task | undefined> => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return tasks.find(t => t.id === id);
    },
    
    create: async (input: CreateTaskInput): Promise<Task> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const newTask: Task = {
        id: generateId(),
        project_id: input.project_id,
        contract_id: input.contract_id,
        title: input.title,
        assignee: input.assignee,
        due_date: input.due_date,
        status: input.status || 'todo',
        created_at: new Date().toISOString(),
      };
      
      tasks = [newTask, ...tasks];
      return newTask;
    },
    
    update: async (id: string, input: UpdateTaskInput): Promise<Task | undefined> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const index = tasks.findIndex(t => t.id === id);
      if (index === -1) return undefined;
      
      const currentTask = tasks[index];
      let done_at = currentTask.done_at;
      
      if (input.status !== undefined) {
        if (input.status === 'done' && currentTask.status !== 'done') {
          done_at = new Date().toISOString();
        } else if (input.status !== 'done') {
          done_at = undefined;
        }
      }
      
      const updated: Task = {
        ...currentTask,
        ...input,
        done_at,
      };
      
      tasks[index] = updated;
      return updated;
    },
    
    delete: async (id: string): Promise<boolean> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      const initialLength = tasks.length;
      tasks = tasks.filter(t => t.id !== id);
      return tasks.length < initialLength;
    },
  },
  
  payments: {
    getAll: async (): Promise<Payment[]> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return [...payments];
    },
    
    getByProjectId: async (projectId: string): Promise<Payment[]> => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return payments.filter(p => p.project_id === projectId);
    },
    
    getByContractId: async (contractId: string): Promise<Payment[]> => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return payments.filter(p => p.contract_id === contractId);
    },
    
    getById: async (id: string): Promise<Payment | undefined> => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return payments.find(p => p.id === id);
    },
    
    create: async (input: CreatePaymentInput, currentUser: string): Promise<Payment> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const newPayment: Payment = {
        id: generateId(),
        project_id: input.project_id,
        contract_id: input.contract_id,
        label: input.label,
        amount: input.amount,
        due_date: input.due_date,
        status: input.status || 'neplatit',
        comment: input.comment,
        created_by: currentUser,
        created_at: new Date().toISOString(),
      };
      
      payments = [newPayment, ...payments];
      return newPayment;
    },
    
    update: async (id: string, input: UpdatePaymentInput, currentUser?: string): Promise<Payment | undefined> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const index = payments.findIndex(p => p.id === id);
      if (index === -1) return undefined;
      
      const currentPayment = payments[index];
      let marked_paid_by = currentPayment.marked_paid_by;
      let marked_paid_at = currentPayment.marked_paid_at;
      
      if (input.status !== undefined && input.paid_amount !== undefined && currentUser) {
        if (input.status === 'platit' || input.status === 'partial') {
          marked_paid_by = currentUser;
          marked_paid_at = new Date().toISOString();
        }
      }
      
      if (input.status !== undefined && input.status === 'neplatit') {
        marked_paid_by = undefined;
        marked_paid_at = undefined;
      }
      
      const updated: Payment = {
        ...currentPayment,
        ...input,
        marked_paid_by,
        marked_paid_at,
      };
      
      payments[index] = updated;
      return updated;
    },
    
    delete: async (id: string): Promise<boolean> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      const initialLength = payments.length;
      payments = payments.filter(p => p.id !== id);
      return payments.length < initialLength;
    },
  },
};
