<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <h2>Gestión de Clientes</h2>
      <button @click="showModal = true" class="btn btn-primary" style="width: auto;">+ Nuevo Cliente</button>
    </div>

    <div class="card">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Dirección</th>
              <th>Documento Fiscal</th>
              <th style="text-align: right;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in customers" :key="c.id">
              <td style="font-weight: 500;">{{ c.nombre }}</td>
              <td>{{ c.email }}</td>
              <td class="text-muted">{{ c.direccion }}</td>
              <td><code>{{ c.documentoFiscal }}</code></td>
              <td style="text-align: right; display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button @click="editCustomer(c)" class="btn btn-secondary" style="width: auto; padding: 0.5rem;">Editar</button>
                <button v-if="auth.isAdmin" @click="deleteCustomer(c.id)" class="btn btn-secondary" style="width: auto; padding: 0.5rem; color: var(--danger);">Borrar</button>
              </td>
            </tr>
            <tr v-if="customers.length === 0 && !loading">
              <td colspan="5" style="text-align: center; padding: 3rem; color: var(--text-muted);">No hay clientes registrados</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Simple Modal for Create/Edit -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="auth-card" style="max-width: 500px;">
        <h3>{{ isEditing ? 'Editar Cliente' : 'Nuevo Cliente' }}</h3>
        <form @submit.prevent="saveCustomer" style="margin-top: 1.5rem;">
          <div class="form-group">
            <label>Nombre</label>
            <input v-model="form.nombre" type="text" class="form-control" required />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="form.email" type="email" class="form-control" required />
          </div>
          <div class="form-group">
            <label>Dirección (Será encriptada)</label>
            <input v-model="form.direccion" type="text" class="form-control" required />
          </div>
          <div class="form-group">
            <label>Documento Fiscal (Será encriptado)</label>
            <input v-model="form.documentoFiscal" type="text" class="form-control" required />
          </div>

          <div style="display: flex; gap: 1rem;">
            <button type="button" @click="closeModal" class="btn btn-secondary">Cancelar</button>
            <button type="submit" class="btn btn-primary">{{ isEditing ? 'Guardar Cambios' : 'Crear Registro' }}</button>
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
const customers = ref<any[]>([]);
const loading = ref(true);
const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref('');

const form = reactive({
  nombre: '',
  email: '',
  direccion: '',
  documentoFiscal: ''
});

const fetchCustomers = async () => {
  loading.value = true;
  try {
    const { data } = await api.get('/customers');
    customers.value = data.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const saveCustomer = async () => {
  try {
    if (isEditing.value) {
      await api.patch(`/customers/${editingId.value}`, form);
    } else {
      await api.post('/customers', form);
    }
    fetchCustomers();
    closeModal();
  } catch (err) {
    alert('Error al guardar cliente');
  }
};

const editCustomer = (c: any) => {
  isEditing.value = true;
  editingId.value = c.id;
  form.nombre = c.nombre;
  form.email = c.email;
  form.direccion = c.direccion;
  form.documentoFiscal = c.documentoFiscal;
  showModal.value = true;
};

const deleteCustomer = async (id: string) => {
  if (!confirm('¿Seguro que deseas eliminar este cliente?')) return;
  try {
    await api.delete(`/customers/${id}`);
    fetchCustomers();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Error al eliminar');
  }
};

const closeModal = () => {
  showModal.value = false;
  isEditing.value = false;
  Object.keys(form).forEach(k => (form as any)[k] = '');
};

onMounted(fetchCustomers);
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
  animation: fadeIn 0.3s ease;
}
</style>
