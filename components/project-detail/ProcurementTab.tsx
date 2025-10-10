import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Plus, Search, X, Package, Truck } from 'lucide-react-native';
import colors from '@/constants/colors';
import { formatDateToDisplay } from '@/constants/formatters';
import { fakeApi } from '@/api/fakeApi';
import type { ProcItem, ProcStatus, ProcUnit, TransportType } from '@/types';

interface ProcurementTabProps {
  projectId?: string;
  contractId?: string;
}

const STATUS_LABELS: Record<ProcStatus, string> = {
  de_comandat: 'De comandat',
  comandat: 'Comandat',
  in_tranzit: 'În tranzit',
  livrat_partial: 'Livrat parțial',
  receptionat: 'Recepționat',
};

const STATUS_COLORS: Record<ProcStatus, string> = {
  de_comandat: '#FF9800',
  comandat: '#2196F3',
  in_tranzit: '#9C27B0',
  livrat_partial: '#FFC107',
  receptionat: '#4CAF50',
};

const UNIT_OPTIONS: ProcUnit[] = ['kg', 'buc', 'm', 'L', 'ml'];

export default function ProcurementTab({ projectId, contractId }: ProcurementTabProps) {
  const [items, setItems] = useState<ProcItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ProcItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<ProcStatus | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showTransportModal, setShowTransportModal] = useState<boolean>(false);
  const [showPartialModal, setShowPartialModal] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<ProcItem | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    qty: string;
    unit: ProcUnit;
    supplier: string;
    price_estimate: string;
    assignee: string;
    due_date: string;
    status: ProcStatus;
    po_number: string;
    attachment_url: string;
  }>({
    name: '',
    qty: '',
    unit: 'buc',
    supplier: '',
    price_estimate: '',
    assignee: '',
    due_date: '',
    status: 'de_comandat',
    po_number: '',
    attachment_url: '',
  });

  const [transportData, setTransportData] = useState<{
    type: TransportType;
    vehicle_number: string;
    cmr_awb: string;
    eta: string;
  }>({
    type: 'propriu',
    vehicle_number: '',
    cmr_awb: '',
    eta: '',
  });

  const [partialQty, setPartialQty] = useState<string>('');

  useEffect(() => {
    loadItems();
  }, [projectId]);

  useEffect(() => {
    filterItems();
  }, [items, searchQuery, statusFilter]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = contractId 
      ? await fakeApi.procItems.getByContractId(contractId)
      : await fakeApi.procItems.getByProjectId(projectId!);
      setItems(data);
    } catch (error) {
      console.error('Error loading procurement items:', error);
      Alert.alert('Eroare', 'Nu s-au putut încărca materialele');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...items];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.supplier?.toLowerCase().includes(query) ||
        item.assignee?.toLowerCase().includes(query)
      );
    }

    setFilteredItems(filtered);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      qty: '',
      unit: 'buc',
      supplier: '',
      price_estimate: '',
      assignee: '',
      due_date: '',
      status: 'de_comandat',
      po_number: '',
      attachment_url: '',
    });
  };

  const handleAddItem = async () => {
    if (!formData.name.trim() || !formData.qty.trim()) {
      Alert.alert('Eroare', 'Numele și cantitatea sunt obligatorii');
      return;
    }

    const qty = parseFloat(formData.qty);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Eroare', 'Cantitatea trebuie să fie un număr pozitiv');
      return;
    }

    try {
      await fakeApi.procItems.create({
        project_id: projectId,
        name: formData.name,
        qty,
        unit: formData.unit,
        supplier: formData.supplier || undefined,
        price_estimate: formData.price_estimate ? parseFloat(formData.price_estimate) : undefined,
        assignee: formData.assignee || undefined,
        due_date: formData.due_date || undefined,
        status: formData.status,
        po_number: formData.po_number || undefined,
        attachment_url: formData.attachment_url || undefined,
      });

      await loadItems();
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating item:', error);
      Alert.alert('Eroare', 'Nu s-a putut adăuga materialul');
    }
  };

  const handleUpdateStatus = async (item: ProcItem, newStatus: ProcStatus) => {
    if (newStatus === 'in_tranzit') {
      setSelectedItem(item);
      setShowTransportModal(true);
      return;
    }

    if (newStatus === 'livrat_partial') {
      setSelectedItem(item);
      setPartialQty('');
      setShowPartialModal(true);
      return;
    }

    try {
      await fakeApi.procItems.update(item.id, { status: newStatus });
      await loadItems();
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Eroare', 'Nu s-a putut actualiza statusul');
    }
  };

  const handleSaveTransport = async () => {
    if (!selectedItem) return;

    try {
      await fakeApi.procItems.update(selectedItem.id, {
        status: 'in_tranzit',
        transport: {
          type: transportData.type,
          vehicle_number: transportData.vehicle_number || undefined,
          cmr_awb: transportData.cmr_awb || undefined,
          eta: transportData.eta || undefined,
        },
      });

      await loadItems();
      setShowTransportModal(false);
      setSelectedItem(null);
      setTransportData({
        type: 'propriu',
        vehicle_number: '',
        cmr_awb: '',
        eta: '',
      });
    } catch (error) {
      console.error('Error saving transport:', error);
      Alert.alert('Eroare', 'Nu s-au putut salva datele de transport');
    }
  };

  const handleSavePartial = async () => {
    if (!selectedItem) return;

    const qty = parseFloat(partialQty);
    if (isNaN(qty) || qty <= 0 || qty > selectedItem.qty) {
      Alert.alert('Eroare', 'Cantitatea primită trebuie să fie între 0 și cantitatea comandată');
      return;
    }

    try {
      await fakeApi.procItems.update(selectedItem.id, {
        status: qty === selectedItem.qty ? 'receptionat' : 'livrat_partial',
        qty_received: qty,
      });

      await loadItems();
      setShowPartialModal(false);
      setSelectedItem(null);
      setPartialQty('');
    } catch (error) {
      console.error('Error saving partial delivery:', error);
      Alert.alert('Eroare', 'Nu s-au putut salva datele');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Caută material..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              statusFilter === 'all' && styles.filterChipActive,
            ]}
            onPress={() => setStatusFilter('all')}
          >
            <Text
              style={[
                styles.filterChipText,
                statusFilter === 'all' && styles.filterChipTextActive,
              ]}
            >
              Toate
            </Text>
          </TouchableOpacity>

          {(Object.keys(STATUS_LABELS) as ProcStatus[]).map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                statusFilter === status && styles.filterChipActive,
              ]}
              onPress={() => setStatusFilter(status)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  statusFilter === status && styles.filterChipTextActive,
                ]}
              >
                {STATUS_LABELS[status]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={20} color="#fff" />
          <Text style={styles.addButtonText}>Material</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={48} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>
              {searchQuery || statusFilter !== 'all'
                ? 'Nu s-au găsit materiale'
                : 'Nu există materiale adăugate'}
            </Text>
          </View>
        ) : (
          filteredItems.map(item => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{item.name}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: STATUS_COLORS[item.status] },
                  ]}
                >
                  <Text style={styles.statusBadgeText}>
                    {STATUS_LABELS[item.status]}
                  </Text>
                </View>
              </View>

              <View style={styles.itemDetails}>
                <Text style={styles.itemDetailText}>
                  Cantitate: {item.qty} {item.unit}
                  {item.qty_received && ` (Primit: ${item.qty_received} ${item.unit})`}
                </Text>
                {item.supplier && (
                  <Text style={styles.itemDetailText}>
                    Furnizor: {item.supplier}
                  </Text>
                )}
                {item.price_estimate && (
                  <Text style={styles.itemDetailText}>
                    Preț estimat: {item.price_estimate.toFixed(2)} EUR
                  </Text>
                )}
                {item.assignee && (
                  <Text style={styles.itemDetailText}>
                    Responsabil: {item.assignee}
                  </Text>
                )}
                {item.po_number && (
                  <Text style={styles.itemDetailText}>
                    PO: {item.po_number}
                  </Text>
                )}
                {item.due_date && (
                  <Text style={styles.itemDetailText}>
                    Termen: {formatDateToDisplay(item.due_date)}
                  </Text>
                )}
              </View>

              {item.transport && (
                <View style={styles.transportInfo}>
                  <Truck size={16} color={colors.primary} />
                  <View style={styles.transportDetails}>
                    <Text style={styles.transportText}>
                      Transport: {item.transport.type === 'propriu' ? 'Propriu' : 'Extern'}
                    </Text>
                    {item.transport.vehicle_number && (
                      <Text style={styles.transportText}>
                        Vehicul: {item.transport.vehicle_number}
                      </Text>
                    )}
                    {item.transport.cmr_awb && (
                      <Text style={styles.transportText}>
                        CMR/AWB: {item.transport.cmr_awb}
                      </Text>
                    )}
                    {item.transport.eta && (
                      <Text style={styles.transportText}>
                        ETA: {formatDateToDisplay(item.transport.eta)}
                      </Text>
                    )}
                  </View>
                </View>
              )}

              <View style={styles.itemActions}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {(Object.keys(STATUS_LABELS) as ProcStatus[]).map(status => {
                    if (status === item.status) return null;
                    return (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.actionButton,
                          { borderColor: STATUS_COLORS[status] },
                        ]}
                        onPress={() => handleUpdateStatus(item, status)}
                      >
                        <Text
                          style={[
                            styles.actionButtonText,
                            { color: STATUS_COLORS[status] },
                          ]}
                        >
                          {STATUS_LABELS[status]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Material nou</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Nume material *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={text => setFormData({ ...formData, name: text })}
                placeholder="ex: Țeavă inox Ø42mm"
                placeholderTextColor={colors.textSecondary}
              />

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Cantitate *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.qty}
                    onChangeText={text => setFormData({ ...formData, qty: text })}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Unitate</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {UNIT_OPTIONS.map(unit => (
                      <TouchableOpacity
                        key={unit}
                        style={[
                          styles.unitButton,
                          formData.unit === unit && styles.unitButtonActive,
                        ]}
                        onPress={() => setFormData({ ...formData, unit })}
                      >
                        <Text
                          style={[
                            styles.unitButtonText,
                            formData.unit === unit && styles.unitButtonTextActive,
                          ]}
                        >
                          {unit}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <Text style={styles.label}>Furnizor</Text>
              <TextInput
                style={styles.input}
                value={formData.supplier}
                onChangeText={text => setFormData({ ...formData, supplier: text })}
                placeholder="ex: Inox Distribution SRL"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.label}>Preț estimat (EUR)</Text>
              <TextInput
                style={styles.input}
                value={formData.price_estimate}
                onChangeText={text => setFormData({ ...formData, price_estimate: text })}
                placeholder="0.00"
                keyboardType="numeric"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.label}>Responsabil</Text>
              <TextInput
                style={styles.input}
                value={formData.assignee}
                onChangeText={text => setFormData({ ...formData, assignee: text })}
                placeholder="ex: Ion Vasile"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.label}>Număr PO</Text>
              <TextInput
                style={styles.input}
                value={formData.po_number}
                onChangeText={text => setFormData({ ...formData, po_number: text })}
                placeholder="ex: PO-2025-001"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.label}>Status</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {(Object.keys(STATUS_LABELS) as ProcStatus[]).map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      formData.status === status && styles.statusButtonActive,
                      formData.status === status && {
                        backgroundColor: STATUS_COLORS[status],
                      },
                    ]}
                    onPress={() => setFormData({ ...formData, status })}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        formData.status === status && styles.statusButtonTextActive,
                      ]}
                    >
                      {STATUS_LABELS[status]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Anulează</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddItem}
              >
                <Text style={styles.saveButtonText}>Adaugă</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showTransportModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTransportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalii transport</Text>
              <TouchableOpacity onPress={() => setShowTransportModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Tip transport</Text>
              <View style={styles.row}>
                <TouchableOpacity
                  style={[
                    styles.transportTypeButton,
                    transportData.type === 'propriu' && styles.transportTypeButtonActive,
                  ]}
                  onPress={() => setTransportData({ ...transportData, type: 'propriu' })}
                >
                  <Text
                    style={[
                      styles.transportTypeButtonText,
                      transportData.type === 'propriu' && styles.transportTypeButtonTextActive,
                    ]}
                  >
                    Propriu
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.transportTypeButton,
                    transportData.type === 'extern' && styles.transportTypeButtonActive,
                  ]}
                  onPress={() => setTransportData({ ...transportData, type: 'extern' })}
                >
                  <Text
                    style={[
                      styles.transportTypeButtonText,
                      transportData.type === 'extern' && styles.transportTypeButtonTextActive,
                    ]}
                  >
                    Extern
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Număr vehicul / Camion</Text>
              <TextInput
                style={styles.input}
                value={transportData.vehicle_number}
                onChangeText={text => setTransportData({ ...transportData, vehicle_number: text })}
                placeholder="ex: B-123-ABC"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.label}>CMR / AWB</Text>
              <TextInput
                style={styles.input}
                value={transportData.cmr_awb}
                onChangeText={text => setTransportData({ ...transportData, cmr_awb: text })}
                placeholder="ex: CMR-2025-0042"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.label}>ETA (DD-MM-YYYY)</Text>
              <TextInput
                style={styles.input}
                value={transportData.eta}
                onChangeText={text => setTransportData({ ...transportData, eta: text })}
                placeholder="ex: 15-01-2025"
                placeholderTextColor={colors.textSecondary}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowTransportModal(false);
                  setSelectedItem(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Anulează</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveTransport}
              >
                <Text style={styles.saveButtonText}>Salvează</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showPartialModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPartialModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Livrare parțială</Text>
              <TouchableOpacity onPress={() => setShowPartialModal(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {selectedItem && (
                <>
                  <Text style={styles.partialInfoText}>
                    Material: {selectedItem.name}
                  </Text>
                  <Text style={styles.partialInfoText}>
                    Cantitate comandată: {selectedItem.qty} {selectedItem.unit}
                  </Text>

                  <Text style={styles.label}>Cantitate primită</Text>
                  <TextInput
                    style={styles.input}
                    value={partialQty}
                    onChangeText={setPartialQty}
                    placeholder={`0 - ${selectedItem.qty}`}
                    keyboardType="numeric"
                    placeholderTextColor={colors.textSecondary}
                  />
                </>
              )}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowPartialModal(false);
                  setSelectedItem(null);
                  setPartialQty('');
                }}
              >
                <Text style={styles.cancelButtonText}>Anulează</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSavePartial}
              >
                <Text style={styles.saveButtonText}>Salvează</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    gap: 12,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.text,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
  },
  itemDetails: {
    gap: 4,
  },
  itemDetailText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  transportInfo: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  transportDetails: {
    flex: 1,
    gap: 2,
  },
  transportText: {
    fontSize: 13,
    color: colors.text,
  },
  itemActions: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
  },
  modalBody: {
    padding: 16,
    maxHeight: 500,
  },
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  unitButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.text,
  },
  unitButtonTextActive: {
    color: '#fff',
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  statusButtonActive: {
    borderColor: 'transparent',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.text,
  },
  statusButtonTextActive: {
    color: '#fff',
  },
  transportTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  transportTypeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  transportTypeButtonText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: colors.text,
  },
  transportTypeButtonTextActive: {
    color: '#fff',
  },
  partialInfoText: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
});
