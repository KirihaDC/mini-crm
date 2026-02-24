import { defineStore } from 'pinia';
import api from '../api';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user') || 'null'),
        accessToken: localStorage.getItem('accessToken'),
        refreshToken: localStorage.getItem('refreshToken'),
    }),
    getters: {
        isAuthenticated: (state) => !!state.accessToken,
        isAdmin: (state) => state.user?.role === 'ADMIN',
    },
    actions: {
        async login(email: string, password: string) {
            const { data } = await api.post('/auth/login', { email, password });
            this.accessToken = data.accessToken;
            this.refreshToken = data.refreshToken;

            const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
            this.user = {
                id: payload.sub,
                email: payload.email,
                role: payload.role,
            };

            localStorage.setItem('accessToken', this.accessToken!);
            localStorage.setItem('refreshToken', this.refreshToken!);
            localStorage.setItem('user', JSON.stringify(this.user));
        },
        async register(email: string, password: string, nombre: string, role?: string) {
            await api.post('/auth/register', { email, password, nombre, role });
        },
        logout() {
            this.user = null;
            this.accessToken = null;
            this.refreshToken = null;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
    }
});
