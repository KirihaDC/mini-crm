import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/LoginView.vue'),
            meta: { public: true }
        },
        {
            path: '/register',
            name: 'register',
            component: () => import('../views/RegisterView.vue'),
            meta: { public: true }
        },
        {
            path: '/',
            component: () => import('../views/LayoutView.vue'),
            children: [
                {
                    path: '',
                    name: 'dashboard',
                    component: () => import('../views/DashboardView.vue'),
                },
                {
                    path: 'customers',
                    name: 'customers',
                    component: () => import('../views/CustomersView.vue'),
                },
                {
                    path: 'orders',
                    name: 'orders',
                    component: () => import('../views/OrdersView.vue'),
                }
            ]
        }
    ]
});

router.beforeEach((to, _from, next) => {
    const auth = useAuthStore();
    if (!to.meta.public && !auth.isAuthenticated) {
        next({ name: 'login' });
    } else if (to.meta.public && auth.isAuthenticated) {
        next({ name: 'dashboard' });
    } else {
        next();
    }
});

export default router;
