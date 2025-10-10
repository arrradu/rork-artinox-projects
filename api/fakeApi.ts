import type { 
  Project, 
  Task, 
  Payment, 
  CreateProjectInput, 
  CreateTaskInput, 
  CreatePaymentInput,
  UpdateProjectInput,
  UpdateTaskInput,
  UpdatePaymentInput,
  Department,
  ProjFile,
  ChatMessage,
  SalesNote,
  CreateFileInput,
  CreateChatMessageInput,
  CreateSalesNoteInput,
  ProcItem,
  CreateProcItemInput,
  UpdateProcItemInput,
  User,
  ProjectMember,
  CreateProjectMemberInput,
  Client,
  CreateClientInput,
  UpdateClientInput,
  Contract,
  CreateContractInput,
  UpdateContractInput
} from '@/types';

let clients: Client[] = [
  {
    id: '1',
    nume: 'SC Construct Design SRL',
    email: 'contact@constructdesign.ro',
    telefon: '+40 21 123 4567',
    adresa: 'Str. Constructorilor nr. 10, București',
    created_at: '2024-11-15T10:00:00Z',
  },
  {
    id: '2',
    nume: 'Popescu Ion',
    email: 'ion.popescu@email.com',
    telefon: '+40 722 123 456',
    created_at: '2025-01-05T14:30:00Z',
  },
  {
    id: '3',
    nume: 'Restaurant La Mama',
    email: 'comenzi@lamama.ro',
    telefon: '+40 21 987 6543',
    adresa: 'Bd. Unirii nr. 45, București',
    created_at: '2024-10-20T09:00:00Z',
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
    start_date: '2025-01-05T00:00:00Z',
    total_value_eur: 15000,
    paid_eur: 6000,
    remaining_eur: 9000,
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
    start_date: '2025-01-10T00:00:00Z',
    total_value_eur: 8500,
    paid_eur: 0,
    remaining_eur: 8500,
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
    start_date: '2024-12-10T00:00:00Z',
    total_value_eur: 32000,
    paid_eur: 26000,
    remaining_eur: 6000,
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
    code: 'CD-2025-001',
    description: 'Balustradă inox pentru scară interioară, 15m lungime',
    start_date: '2025-01-05T00:00:00Z',
    value_eur: 15000,
    paid_eur: 6000,
    remaining_eur: 9000,
    status: 'in_lucru',
    created_at: '2025-01-05T10:00:00Z',
    created_by: 'Andrei Ionescu',
  },
  {
    id: '2',
    project_id: '2',
    title: 'Poartă Automată Inox',
    code: 'PI-2025-001',
    description: 'Poartă automată inox cu sistem de deschidere electrică',
    start_date: '2025-01-10T00:00:00Z',
    value_eur: 8500,
    paid_eur: 0,
    remaining_eur: 8500,
    status: 'nou',
    created_at: '2025-01-08T14:30:00Z',
    created_by: 'Andrei Ionescu',
  },
  {
    id: '3',
    project_id: '3',
    title: 'Mobilier Bucătărie Inox - Faza 1',
    code: 'LM-2024-089-F1',
    description: 'Blaturi, mese de lucru și rafturi inox',
    start_date: '2024-12-10T00:00:00Z',
    value_eur: 20000,
    paid_eur: 16000,
    remaining_eur: 4000,
    status: 'livrare',
    created_at: '2024-12-10T09:00:00Z',
    created_by: 'Maria Popescu',
  },
  {
    id: '4',
    project_id: '3',
    title: 'Mobilier Bucătărie Inox - Faza 2',
    code: 'LM-2024-089-F2',
    description: 'Dulapuri și echipamente suplimentare',
    start_date: '2024-12-20T00:00:00Z',
    value_eur: 12000,
    paid_eur: 10000,
    remaining_eur: 2000,
    status: 'in_lucru',
    created_at: '2024-12-20T10:00:00Z',
    created_by: 'Maria Popescu',
  },
];

let tasks: Task[] = [
  {
    id: '1',
    project_id: '1',
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
    project_id: '1',
    contract_id: '1',
    title: 'Comandă materiale inox',
    assignee: 'Andrei Ionescu',
    due_date: '2025-01-15T12:00:00Z',
    status: 'doing',
    created_at: '2025-01-05T10:35:00Z',
  },
  {
    id: '3',
    project_id: '1',
    contract_id: '1',
    title: 'Producție balustradă',
    assignee: 'Andrei Ionescu',
    due_date: '2025-01-20T12:00:00Z',
    status: 'todo',
    created_at: '2025-01-05T10:40:00Z',
  },
  {
    id: '4',
    project_id: '2',
    contract_id: '2',
    title: 'Întocmire ofertă detaliată',
    assignee: 'Andrei Ionescu',
    due_date: '2025-01-11T12:00:00Z',
    status: 'doing',
    created_at: '2025-01-08T14:35:00Z',
  },
  {
    id: '5',
    project_id: '3',
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
    project_id: '1',
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
    project_id: '1',
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
    project_id: '2',
    contract_id: '2',
    label: 'Plată integrală',
    amount: 8500,
    status: 'neplatit',
    created_by: 'Andrei Ionescu',
    created_at: '2025-01-08T14:40:00Z',
  },
  {
    id: '4',
    project_id: '3',
    contract_id: '3',
    label: 'Avans 50%',
    amount: 10000,
    due_date: '2024-12-15T12:00:00Z',
    status: 'platit',
    paid_amount: 10000,
    paid_at: '2024-12-14T11:00:00Z',
    created_by: 'Maria Popescu',
    created_at: '2024-12-10T09:30:00Z',
    marked_paid_by: 'Elena Dumitrescu',
    marked_paid_at: '2024-12-14T11:00:00Z',
  },
  {
    id: '5',
    project_id: '3',
    contract_id: '3',
    label: 'Rest la livrare 50%',
    amount: 10000,
    due_date: '2025-01-10T12:00:00Z',
    status: 'partial',
    paid_amount: 6000,
    paid_at: '2025-01-09T15:00:00Z',
    created_by: 'Maria Popescu',
    created_at: '2024-12-10T09:35:00Z',
    marked_paid_by: 'Elena Dumitrescu',
    marked_paid_at: '2025-01-09T15:00:00Z',
  },
  {
    id: '6',
    project_id: '3',
    contract_id: '4',
    label: 'Avans 50%',
    amount: 6000,
    due_date: '2024-12-25T12:00:00Z',
    status: 'platit',
    paid_amount: 6000,
    paid_at: '2024-12-24T10:00:00Z',
    created_by: 'Maria Popescu',
    created_at: '2024-12-20T10:00:00Z',
    marked_paid_by: 'Elena Dumitrescu',
    marked_paid_at: '2024-12-24T10:00:00Z',
  },
  {
    id: '7',
    project_id: '3',
    contract_id: '4',
    label: 'Rest la finalizare 50%',
    amount: 6000,
    due_date: '2025-01-15T12:00:00Z',
    status: 'partial',
    paid_amount: 4000,
    paid_at: '2025-01-10T14:00:00Z',
    created_by: 'Maria Popescu',
    created_at: '2024-12-20T10:05:00Z',
    marked_paid_by: 'Elena Dumitrescu',
    marked_paid_at: '2025-01-10T14:00:00Z',
  },
];

let files: ProjFile[] = [
  {
    id: '1',
    project_id: '1',
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
    project_id: '1',
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
    project_id: '1',
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
    project_id: '3',
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
    project_id: '1',
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
    project_id: '1',
    contract_id: '1',
    author: 'Andrei Ionescu',
    text: 'Am finalizat măsurătorile. Totul arată bine.',
    created_at: '2025-01-11T16:30:00Z',
  },
  {
    id: '2',
    project_id: '1',
    contract_id: '1',
    author: 'Maria Popescu',
    text: 'Perfect! Când estimezi că putem începe producția?',
    reply_to_id: '1',
    created_at: '2025-01-11T17:00:00Z',
  },
  {
    id: '3',
    project_id: '1',
    contract_id: '1',
    author: 'Andrei Ionescu',
    text: 'După ce primim materialele, în 2-3 zile lucrătoare.',
    reply_to_id: '2',
    created_at: '2025-01-11T17:15:00Z',
  },
  {
    id: '4',
    project_id: '3',
    contract_id: '3',
    author: 'Ion Vasile',
    text: 'Clientul a confirmat data livrării pentru 10 ianuarie.',
    created_at: '2025-01-08T11:00:00Z',
  },
];

let salesNotes: SalesNote[] = [
  {
    id: '1',
    project_id: '1',
    contract_id: '1',
    author: 'Andrei Ionescu',
    text: 'Client foarte exigent, atenție la detalii. A cerut garanție extinsă.',
    created_at: '2025-01-05T11:00:00Z',
  },
  {
    id: '2',
    project_id: '2',
    contract_id: '2',
    author: 'Andrei Ionescu',
    text: 'Posibil proiect mare în viitor - poartă + gard complet. Să menținem relația.',
    created_at: '2025-01-08T15:00:00Z',
  },
  {
    id: '3',
    project_id: '3',
    author: 'Maria Popescu',
    text: 'Client recurent, plătește prompt. Prioritate mare.',
    created_at: '2024-12-10T09:30:00Z',
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
    project_id: '1',
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
    project_id: '1',
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
    project_id: '1',
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
    project_id: '3',
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

const recalculateProjectFinancials = (projectId: string) => {
  const projectContracts = contracts.filter(c => c.project_id === projectId);
  const totalValue = projectContracts.reduce((sum, c) => sum + c.value_eur, 0);
  const totalPaid = projectContracts.reduce((sum, c) => sum + c.paid_eur, 0);
  const totalRemaining = projectContracts.reduce((sum, c) => sum + c.remaining_eur, 0);
  
  const projectIndex = projects.findIndex(p => p.id === projectId);
  if (projectIndex !== -1) {
    projects[projectIndex] = {
      ...projects[projectIndex],
      total_value_eur: totalValue,
      paid_eur: totalPaid,
      remaining_eur: totalRemaining,
    };
  }
};

const recalculateContractFinancials = (contractId: string) => {
  const contractPayments = payments.filter(p => p.contract_id === contractId);
  const totalValue = contractPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = contractPayments.reduce((sum, p) => {
    if (p.status === 'platit') return sum + (p.paid_amount || p.amount);
    if (p.status === 'partial') return sum + (p.paid_amount || 0);
    return sum;
  }, 0);
  
  const contractIndex = contracts.findIndex(c => c.id === contractId);
  if (contractIndex !== -1) {
    contracts[contractIndex] = {
      ...contracts[contractIndex],
      value_eur: totalValue,
      paid_eur: totalPaid,
      remaining_eur: totalValue - totalPaid,
    };
    
    recalculateProjectFinancials(contracts[contractIndex].project_id);
  }
};

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
        nume: input.nume,
        email: input.email,
        telefon: input.telefon,
        adresa: input.adresa,
        created_at: new Date().toISOString(),
      };
      
      clients = [newClient, ...clients];
      return newClient;
    },
    
    update: async (id: string, input: UpdateClientInput): Promise<Client | undefined> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const index = clients.findIndex(c => c.id === id);
      if (index === -1) return undefined;
      
      const updated: Client = {
        ...clients[index],
        ...input,
      };
      
      clients[index] = updated;
      return updated;
    },
    
    delete: async (id: string): Promise<boolean> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      const initialLength = clients.length;
      clients = clients.filter(c => c.id !== id);
      return clients.length < initialLength;
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
        status: input.status || 'nou',
        created_at: new Date().toISOString(),
        created_by: currentUser,
      };
      
      contracts = [newContract, ...contracts];
      recalculateProjectFinancials(input.project_id);
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
      recalculateProjectFinancials(updated.project_id);
      return updated;
    },
    
    delete: async (id: string): Promise<boolean> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      const contract = contracts.find(c => c.id === id);
      if (!contract) return false;
      
      const initialLength = contracts.length;
      contracts = contracts.filter(c => c.id !== id);
      
      if (contracts.length < initialLength) {
        recalculateProjectFinancials(contract.project_id);
        return true;
      }
      return false;
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
      
      const newMessage: ChatMessage = {
        id: generateId(),
        project_id: input.project_id,
        contract_id: input.contract_id,
        author: input.author,
        text: input.text,
        reply_to_id: input.reply_to_id,
        created_at: new Date().toISOString(),
      };
      
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
  
  salesNotes: {
    getAll: async (): Promise<SalesNote[]> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return [...salesNotes];
    },
    
    getByProjectId: async (projectId: string): Promise<SalesNote[]> => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return salesNotes.filter(n => n.project_id === projectId).sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    
    getByContractId: async (contractId: string): Promise<SalesNote[]> => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return salesNotes.filter(n => n.contract_id === contractId).sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    
    create: async (input: CreateSalesNoteInput): Promise<SalesNote> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const newNote: SalesNote = {
        id: generateId(),
        project_id: input.project_id,
        contract_id: input.contract_id,
        author: input.author,
        text: input.text,
        created_at: new Date().toISOString(),
      };
      
      salesNotes = [newNote, ...salesNotes];
      return newNote;
    },
    
    delete: async (id: string): Promise<boolean> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      const initialLength = salesNotes.length;
      salesNotes = salesNotes.filter(n => n.id !== id);
      return salesNotes.length < initialLength;
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
        total_value_eur: 0,
        paid_eur: 0,
        remaining_eur: 0,
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
      
      if (input.contract_id) {
        recalculateContractFinancials(input.contract_id);
      }
      
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
      
      if (updated.contract_id) {
        recalculateContractFinancials(updated.contract_id);
      }
      
      return updated;
    },
    
    delete: async (id: string): Promise<boolean> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      const payment = payments.find(p => p.id === id);
      if (!payment) return false;
      
      const initialLength = payments.length;
      payments = payments.filter(p => p.id !== id);
      
      if (payments.length < initialLength && payment.contract_id) {
        recalculateContractFinancials(payment.contract_id);
        return true;
      }
      
      return payments.length < initialLength;
    },
  },
};
