<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <h2>Control de Órdenes</h2>
      <button @click="showModal = true" class="btn btn-primary" style="width: auto;">+ Nueva Orden</button>
    </div>

    <!-- Filters -->
    <div class="card" style="margin-bottom: 2rem; padding: 1rem; flex-direction: row; gap: 1rem;">
      <div style="display: flex; gap: 1rem; align-items: flex-end;">
        <div class="form-group" style="margin-bottom: 0;">
          <label>Estatus</label>
          <select v-model="filters.status" class="form-control" style="width: 150px;">
            <option value="">Todos</option>
            <option value="CREADA">CREADA</option>
            <option value="PAGADA">PAGADA</option>
            <option value="CANCELADA">CANCELADA</option>
          </select>
        </div>
        <button @click="fetchOrders" class="btn btn-secondary" style="width: auto;">Filtrar</button>
      </div>
    </div>

    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Folio</th>
              <th>Cliente</th>
              <th>Monto</th>
              <th>Estatus</th>
              <th>Fecha</th>
              <th style="text-align: right;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in orders" :key="o.id">
              <td><strong>{{ o.folio }}</strong></td>
              <td>{{ o.customer?.nombre }}</td>
              <td>{{ o.moneda }} {{ o.monto }}</td>
              <td>
                <span class="badge" :class="statusClass(o.estatus)">{{ o.estatus }}</span>
              </td>
              <td class="text-muted">{{ new Date(o.createdAt).toLocaleDateString() }}</td>
              <td style="text-align: right; display: flex; gap: 0.5rem; justify-content: flex-end;">
                <select v-if="o.estatus !== 'CANCELADA'" 
                  @change="updateStatus(o.id, $event)" 
                  class="form-control" 
                  style="width: 120px; padding: 0.25rem 0.5rem; font-size: 0.8rem;"
                >
                  <option disabled selected>Cambiar...</option>
                  <option value="PAGADA">PAGADA</option>
                  <option v-if="auth.isAdmin" value="CANCELADA">CANCELADA</option>
                </select>
                <button v-if="auth.isAdmin" @click="deleteOrder(o.id)" class="btn btn-secondary" style="width: auto; padding: 0.5rem; color: var(--danger);">Borrar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Order Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="auth-card" style="max-width: 500px;">
        <h3>Registrar Nueva Orden</h3>
        <form @submit.prevent="createOrder" style="margin-top: 1.5rem;">
          <div class="form-group">
            <label>Cliente</label>
            <select v-model="form.clienteId" class="form-control" required>
              <option v-for="c in customers" :key="c.id" :value="c.id">{{ c.nombre }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Folio</label>
            <input v-model="form.folio" type="text" class="form-control" required placeholder="ORD-001" />
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label>Monto</label>
              <input v-model="form.monto" type="number" step="0.01" class="form-control" required />
            </div>
            <div class="form-group">
              <label>Moneda</label>
              <select v-model="form.moneda" class="form-control">
                <option value="MXN">MXN</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Notas Internas (Se encriptarán)</label>
            <textarea v-model="form.notasInternas" class="form-control" rows="2"></textarea>
          </div>

          <div style="display: flex; gap: 1rem;">
            <button type="button" @click="closeModal" class="btn btn-secondary">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="creating">Generar Orden</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import api from '../api';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const orders = ref<any[]>([]);
const customers = ref<any[]>([]);
const showModal = ref(false);
const creating = ref(false);

const filters = reactive({
  status: ''
});

const form = reactive({
  clienteId: '',
  folio: '',
  monto: 0,
  moneda: 'MXN',
  notasInternas: ''
});

const fetchOrders = async () => {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    const { data } = await api.get(`/orders?${params.toString()}`);
    orders.value = data.data;
  } catch (err) {
    console.error(err);
  }
};

const fetchCustomers = async () => {
  const { data } = await api.get('/customers');
  customers.value = data.data;
};

const createOrder = async () => {
  creating.value = true;
  try {
    await api.post(`/orders/customer/${form.clienteId}`, {
      folio: form.folio,
      monto: Number(form.monto),
      moneda: form.moneda,
      notasInternas: form.notasInternas
    });
    fetchOrders();
    closeModal();
  } catch (err) {
    alert('Error al crear orden');
  } finally {
    creating.value = false;
  }
};

const updateStatus = async (id: string, event: any) => {
  const newStatus = event.target.value;
  try {
    await api.patch(`/orders/${id}/status`, { estatus: newStatus });
    fetchOrders();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Error al actualizar status');
  }
};

const deleteOrder = async (id: string) => {
  if (!confirm('¿Seguro que deseas eliminar esta orden?')) return;
  try {
    await api.delete(`/orders/${id}`);
    fetchOrders();
  } catch (err) {
    alert('Error al eliminar');
  }
};

const statusClass = (status: string) => {
  if (status === 'PAGADA') return 'badge-success';
  if (status === 'CANCELADA') return 'badge-danger';
  return 'badge-warning';
};

const closeModal = () => {
  showModal.value = false;
  form.clienteId = '';
  form.folio = '';
  form.monto = 0;
  form.notasInternas = '';
};

onMounted(() => {
  fetchOrders();
  fetchCustomers();
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}
</style>
