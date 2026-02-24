<template>
  <div class="layout">
    <nav class="navbar">
      <div class="nav-logo">Mini CRM</div>
      <div class="nav-links">
        <router-link :to="{ name: 'dashboard' }" class="nav-link" active-class="active">Dashboard</router-link>
        <router-link :to="{ name: 'customers' }" class="nav-link" active-class="active">Clientes</router-link>
        <router-link :to="{ name: 'orders' }" class="nav-link" active-class="active">Órdenes</router-link>
      </div>
      <div class="user-info" style="display: flex; align-items: center; gap: 1rem;">
        <span class="badge badge-primary">{{ auth.user?.role }}</span>
        <button @click="handleLogout" class="btn btn-secondary" style="width: auto; padding: 0.5rem 1rem;">Salir</button>
      </div>
    </nav>

    <main class="view-container">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  auth.logout();
  router.push({ name: 'login' });
};
</script>

<style scoped>
.layout {
  min-height: 100vh;
}
</style>
