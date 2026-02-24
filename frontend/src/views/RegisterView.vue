<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <h1>Registro</h1>
      <p>Crea tu cuenta administradora</p>
      
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label>Nombre Completo</label>
          <input v-model="form.nombre" type="text" class="form-control" required />
        </div>

        <div class="form-group">
          <label>Email</label>
          <input v-model="form.email" type="email" class="form-control" required />
        </div>
        
        <div class="form-group">
          <label>Contraseña</label>
          <input v-model="form.password" type="password" class="form-control" minlength="6" required />
        </div>

        <div class="form-group">
          <label>Rol</label>
          <select v-model="form.role" class="form-control">
            <option value="ADMIN">Administrador</option>
            <option value="USER">Usuario</option>
          </select>
        </div>

        <div v-if="error" class="badge badge-danger" style="display: block; width: 100%; margin-bottom: 1rem; text-align: center;">
          {{ error }}
        </div>

        <button :disabled="loading" class="btn btn-primary">
          {{ loading ? 'Registrando...' : 'Registrarme' }}
        </button>
      </form>

      <div class="auth-footer">
        ¿Ya tienes cuenta? <router-link to="/login">Inicia sesión</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const form = reactive({
  nombre: '',
  email: '',
  password: '',
  role: 'ADMIN'
});

const loading = ref(false);
const error = ref('');

const handleRegister = async () => {
  loading.value = true;
  error.value = '';
  try {
    await auth.register(form.email, form.password, form.nombre, form.role);
    router.push({ name: 'login' });
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al registrarse';
    if (Array.isArray(error.value)) error.value = error.value[0];
  } finally {
    loading.value = false;
  }
};
</script>
