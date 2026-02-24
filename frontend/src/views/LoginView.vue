<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <h1>Mini CRM</h1>
      <p>Bienvenido de nuevo, ingresa tus credenciales</p>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Email</label>
          <input 
            v-model="email" 
            type="email" 
            class="form-control" 
            placeholder="ejemplo@test.com"
            required
          />
        </div>
        
        <div class="form-group">
          <label>Contraseña</label>
          <input 
            v-model="password" 
            type="password" 
            class="form-control" 
            placeholder="••••••••"
            required
          />
        </div>

        <div v-if="error" class="badge badge-danger" style="display: block; width: 100%; margin-bottom: 1rem; text-align: center;">
          {{ error }}
        </div>

        <button :disabled="loading" class="btn btn-primary">
          {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
        </button>
      </form>

      <div class="auth-footer">
        ¿No tienes cuenta? <router-link to="/register">Regístrate</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  try {
    await auth.login(email.value, password.value);
    router.push({ name: 'dashboard' });
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al iniciar sesión';
    if (Array.isArray(error.value)) error.value = error.value[0];
  } finally {
    loading.value = false;
  }
};
</script>
