# Employee Certification Portal (Full Stack MERN)

A production-grade Full-Stack MERN (MongoDB, Express, React, Node.js) web application for enterprise certification voucher management, assignment, redemption, and audit tracking.

---

## 🚀 Quick Start & Setup Instructions

### Prerequisites
- **Node.js**: v18.x or higher
- **MongoDB**: Local MongoDB instance or MongoDB Atlas Cloud URI

### 1. Installation
Run the following command from the root directory to install all dependencies for root, backend (`server`), and frontend (`client`):

```bash
npm run install-all
```

### 2. Environment Configuration
Create or modify `server/.env` with your MongoDB URI (Local or MongoDB Atlas Cloud):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/voucher_portal
JWT_SECRET=super_secret_jwt_token_key_2026_aixperts
NODE_ENV=development
```

*(Note: For Cloud MongoDB Atlas, simply replace `MONGODB_URI` with your connection string, e.g., `mongodb+srv://user:pass@cluster.mongodb.net/voucher_portal`)*

### 3. Database Seeding (Recommended)
Seed the database with sample Manager and Employee demo accounts, initial active vouchers, expired vouchers, and audit logs:

```bash
npm run seed
```

#### Pre-configured Demo Accounts:
- **Manager Account**:
  - **Email**: `manager@company.com`
  - **Password**: `Password123`
- **Employee Account**:
  - **Email**: `john.doe@company.com`
  - **Password**: `Password123`

---

### 4. Running the Application
Start both the Backend API server (Port `5000`) and Vite Frontend development server (Port `3000`) concurrently with a single command:

```bash
npm start
```

Open your browser at: **`http://localhost:3000`**

---

### 5. Running Automated Test Suite
To run the automated integration test suite verifying all **8 Edge Cases**:

```bash
npm run test
```

---

## 🗄️ Database Choice Rationale (Section 6)

### Why MongoDB?
1. **Schema Flexibility for Evolving Voucher Metadata**: Certification providers (AWS, GCP, CompTIA, Microsoft) often introduce varying metadata fields (e.g., attempt limits, provider verification URLs). MongoDB's document-oriented model handles semi-structured data seamlessly.
2. **High-Performance Querying & Pagination**: MongoDB compound indexing (e.g., `{ status: 1, expiryDate: 1 }`, `{ assignedTo: 1, status: 1 }`) enables sub-millisecond lookups even when voucher inventories scale to hundreds of thousands of records.
3. **Atomic Operations**: Mongoose findOneAndUpdate and conditional updates guarantee atomic status transitions (`available` -> `assigned` -> `redeemed`), preventing race conditions where two employees or operations try to claim the same voucher simultaneously.

---

## 🔒 Security & Architecture Decisions (Section 10)

1. **Authentication & Role-Based Access Control (RBAC)**:
   - Stateless **JWT (JSON Web Tokens)** with encrypted payload (`id`, `role`).
   - Server-side middleware (`protect` & `authorize('manager')` / `authorize('employee')`) enforces endpoint authorization.
2. **Password Security**:
   - Passwords are salted and hashed using **bcryptjs** (cost factor 10).
   - Passwords are strictly excluded from Mongoose queries by default (`select: false`).
3. **Data Protection & Access Isolation**:
   - Employees are strictly restricted to querying vouchers assigned to their own `userId` (`assignedTo: req.user._id`).
   - Managers cannot revoke vouchers that have already been redeemed by employees.
4. **Input Sanitization & Error Handling**:
   - Centralized error handler catches Mongoose `CastError` (invalid ObjectIDs), `ValidationError`, and duplicate key errors without leaking internal stack traces or raw database errors.

---

## 🛡️ Handled Edge Cases (Section 7)

| Case # | Scenario | Status Code | Returned Error Message / Code |
|---|---|---|---|
| **Case 1** | Manager tries to assign an already assigned voucher | `400 Bad Request` | `VOUCHER_ALREADY_ASSIGNED` - Cannot assign voucher already assigned or revoked. |
| **Case 2** | Manager tries to assign an expired voucher | `400 Bad Request` | `VOUCHER_EXPIRED` - Cannot assign an expired voucher. |
| **Case 3** | Employee tries to redeem another employee's voucher | `403 Forbidden` | `UNAUTHORIZED_VOUCHER_REDEMPTION` - You can only redeem vouchers assigned to your account. |
| **Case 4** | Employee tries to redeem an already redeemed voucher | `400 Bad Request` | `VOUCHER_ALREADY_REDEEMED` - Voucher has already been redeemed previously. |
| **Case 5** | Employee tries to redeem an expired voucher | `400 Bad Request` | `VOUCHER_EXPIRED` - Cannot redeem an expired voucher. |
| **Case 6** | Manager tries to revoke an already redeemed voucher | `400 Bad Request` | `CANNOT_REVOKE_REDEEMED_VOUCHER` - Cannot revoke a voucher that has already been redeemed. |
| **Case 7** | Invalid employee or voucher ID provided | `400 Bad Request` | `INVALID_VOUCHER_ID` / `INVALID_EMPLOYEE_ID` - Invalid ObjectId format. |
| **Case 8** | Required information missing from request | `400 Bad Request` | `MISSING_REQUIRED_FIELDS` - Please provide required parameters. |

---

## 📈 High-Volume Dataset & Scalability Strategy (Section 8)

If the voucher inventory grows from thousands to **millions of records**:

1. **Redis Caching Layer**:
   - Cache total available voucher counts in Redis with atomic increment/decrement commands (`INCR`/`DECR`) to eliminate frequent `countDocuments()` queries.
2. **MongoDB Database Sharding & Indexing**:
   - Shard the `Vouchers` collection by `category` or `createdBy` company ID.
   - Maintain lean indexes: `{ status: 1, expiryDate: 1 }` and `{ assignedTo: 1 }`.
3. **Queue-Based Asynchronous Batch Processing**:
   - When purchasing large batches (e.g., 10,000 vouchers), offload creation to a background job queue (BullMQ / Redis or AWS SQS) to prevent HTTP timeout.
4. **Database Read Replicas**:
   - Direct read operations (dashboard search, filters, pagination) to secondary read replicas while routing assignment/redemption mutations to the primary node.

---

## 📁 Directory Structure

```
AixpertsTask/
├── server/
│   ├── config/          # db.js (MongoDB Connection)
│   ├── controllers/     # authController, voucherController, userController, historyController
│   ├── middleware/      # authMiddleware, errorHandler
│   ├── models/          # User.js, Voucher.js, AuditLog.js
│   ├── routes/          # authRoutes, voucherRoutes, userRoutes, historyRoutes
│   ├── tests/           # edgeCases.test.js (Automated Jest/Supertest suite)
│   ├── utils/           # seed.js (Database Seeder)
│   ├── server.js
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/  # Navbar, VoucherCard, AssignModal, CreateVoucherModal, AuditLogTable
│   │   ├── context/     # AuthContext.jsx
│   │   ├── pages/       # Login, ManagerDashboard, EmployeeDashboard
│   │   ├── services/    # api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── package.json         # Root workspace runner
├── README.md
└── AI_PROMPTS.md        # AI Usage Submission
```
