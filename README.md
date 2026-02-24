# Mini CRM - Prueba Técnica

Este es un sistema de gestión de clientes y órdenes desarrollado con **NestJS**, **Prisma**, **SQL Server** y **Vue 3**.

## 🚀 Tecnologías
- **Backend**: NestJS (Modular), Prisma ORM, JWT (Access + Refresh), Bcrypt, Helmet, AES-256-GCM.
- **Frontend**: Vue 3 (Composition API), Pinia (Store), Axios (Interceptors), TypeScript, Dark Glassmorphism UI.

---

## 🛠️ Instalación y Configuración

### 1. Requisitos
- Node.js lts/iron (v20 o superior).
- **SQL Server**: Debido a problemas de incompatibilidad detectados en Windows 11, se recomienda encarecidamente utilizar **Docker** para arrancar la base de datos:
  ```bash
  docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourStrongPassword123" -p 1433:1433 --name sqlserver -d mcr.microsoft.com/mssql/server:2022-latest
  ```

### 2. Backend
1. Entra a la carpeta `backend/`.
2. Crea tu archivo `.env` basado en `.env.example`.
3. Instala dependencias: `npm install`.
4. Ejecuta las migraciones para crear las tablas e índices:
   ```bash
   npx prisma migrate dev
   ```
5. Inicia el servidor: `npm run start:dev`. (Swagger disponible en `/docs`).

### 3. Frontend
1. Entra a la carpeta `frontend/`.
2. Crea tu archivo `.env` basado en `.env.example`.
3. Instala dependencias: `npm install`.
4. Inicia el cliente: `npm run dev`.

---

## 👤 Credenciales de Demo
Se pueden usar los siguientes usuarios para verificar la restricción de roles y visibilidad:

| Usuario | Email | Password | Rol |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@test.com` | `12345678` | ADMIN |
| **Usuario Normal** | `user@test.com` | `12345678` | USER |

---

## 🔒 Seguridad y Cifrado

### Cifrado de Datos Sensibles (AES-256-GCM)
Se protegen los campos `direccion`, `documentoFiscal` y `notasInternas`.
- **IV (Vector de Inicialización)**: Único por cada registro generado aleatoriamente.
- **Auth Tag**: Garantiza que el dato no ha sido manipulado.
- **RBAC**: Solo los `ADMIN` pueden ver los datos reales; los `USER` verán los datos enmascarados (`********`).

### Autenticación y JWT
- **Claims**: El payload incluye `sub`, `email` y `role`.
- **Refresh Token Rotation**: Implementada. Al renovar el acceso, el token anterior se invalida automáticamente en la DB.
- **Throttling**: Límite de 10 req/min para prevenir fuerza bruta.

---

## 📄 Endpoints Principales
- **Auth**: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/me`.
- **Clientes**: `/customers` (GET/POST), `/customers/:id` (GET/PATCH/DELETE - solo admin).
- **Órdenes**: `/orders` (GET - filtros), `/customers/:id/orders` (GET/POST), `/orders/:id/status` (PATCH - solo admin cancela).
