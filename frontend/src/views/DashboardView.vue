<template>
  <div class="dashboard">
    <div class="welcome-section" style="margin-bottom: 2.5rem;">
      <h1>Bienvenido, {{ auth.user?.nombre }}</h1>
      <p class="text-muted">Aquí tienes un resumen de la actividad del Mini CRM.</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <span class="label">Total Clientes</span>
        <span class="value">{{ stats.customers }}</span>
      </div>
      <div class="stat-card">
        <span class="label">Órdenes Activas</span>
        <span class="value">{{ stats.activeOrders }}</span>
      </div>
      <div class="stat-card">
        <span class="label">Total Ventas (MXN)</span>
        <span class="value">${{ stats.totalSales.toFixed(2) }}</span>
      </div>
      <div class="stat-card">
        <span class="label">Rol de Usuario</span>
        <div style="margin-top: 0.5rem;">
          <span class="badge badge-primary">{{ auth.user?.role }}</span>
        </div>
      </div>
    </div>

    <div class="grid" style="display: grid; grid-template-columns: 1fr; gap: 2rem;">
      <div class="card">
        <div class="card-header">
          <h3>Órdenes Recientes</h3>
          <router-link :to="{ name: 'orders' }" class="btn btn-secondary" style="width: auto; font-size: 0.8rem;">Ver todas</router-link>
        </div>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Folio</th>
                <th>Cliente</th>
                <th>Monto</th>
                <th>Estatus</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in recentOrders" :key="order.id">
                <td><strong>{{ order.folio }}</strong></td>
                <td>{{ order.customer?.nombre }}</td>
                <td>{{ order.moneda }} {{ order.monto }}</td>
                <td>
                  <span class="badge" :class="statusClass(order.estatus)">{{ order.estatus }}</span>
                </td>
              </tr>
              <tr v-if="recentOrders.length === 0">
                <td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-muted);">No hay órdenes recientes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useAuthStore } from '../stores/auth';
import api from '../api';

const auth = useAuthStore();
const recentOrders = ref<any[]>([]);
const stats = reactive({
  customers: 0,
  activeOrders: 0,
  totalSales: 0
});

const statusClass = (status: string) => {
  if (status === 'PAGADA') return 'badge-success';
  if (status === 'CANCELADA') return 'badge-danger';
  return 'badge-warning';
};

const fetchData = async () => {
  try {
    const [custRes, orderRes] = await Promise.all([
      api.get('/customers'),
      api.get('/orders')
    ]);

    const customers = custRes.data.data || [];
    const orders = orderRes.data.data || [];

    stats.customers = customers.length;
    stats.activeOrders = orders.filter((o: any) => o.estatus === 'CREADA').length;
    stats.totalSales = orders
      .filter((o: any) => o.estatus === 'PAGADA' && o.moneda === 'MXN')
      .reduce((acc: number, o: any) => acc + Number(o.monto), 0);

    recentOrders.value = orders.slice(0, 5);
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
  }
};

onMounted(fetchData);
</script>

<style scoped>
.dashboard {
  animation: fadeIn 0.5s ease-out;
}

h1 {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(90deg, #818cf8, #c084fc);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
