# Mandatory AI Submission - Prompts & Workflow Log (Section 12)

This document details the AI tools and prompts used during the development of the **Employee Certification Portal** practical assessment.

---

## 1. AI Tool Used
- **AI Assistant**: Antigravity AI (Powered by Gemini 3.6 Flash)

---

## 2. Prompt Log & Intent Breakdown

### Prompt 1: Requirement Analysis & Database Schema Design
> **User Prompt**:
> "I need to do test Task Its is related to MERN stack for DB part i will use mongo clound that i will provide you later, I need frontend and backend both in same folder also implement each and every part along with that i will check the testing of each case..."
>
> **Intent**:
> Analyze business scenarios (Manager voucher creation, assignment, revocation; Employee redemption; audit history tracking) and establish schema models for `User`, `Voucher`, and `AuditLog` with explicit status indexes.

---

### Prompt 2: Core Business Rule & Edge Case Implementation (Cases 1-8)
> **Goal**:
> Implement controller logic in `voucherController.js` and `authController.js` enforcing all 8 business validation edge cases:
> - Case 1: Already assigned voucher assignment prevention.
> - Case 2: Expired voucher assignment prevention.
> - Case 3: Redeeming another user's voucher prevention (`403 Forbidden`).
> - Case 4: Repeat redemption prevention (`400 Bad Request`).
> - Case 5: Expired voucher redemption prevention.
> - Case 6: Revoking redeemed voucher prevention.
> - Case 7: Invalid ID format handling (`CastError`).
> - Case 8: Missing input fields validation.

---

### Prompt 3: Automated Test Suite Development
> **Goal**:
> Create Jest + Supertest integration test suite (`server/tests/edgeCases.test.js`) backed by `mongodb-memory-server` to run zero-dependency automated verification of all 8 cases.

---

### Prompt 4: Modern React Frontend UI & Quick Testing Presets
> **Goal**:
> Design a responsive dark glassmorphic UI using React, CSS variables, and Lucide icons. Include quick-login presets (`Manager` & `Employee`) on the login page for effortless assessment testing.

---

## 3. Generated vs. Modified vs. Rejected Code Summary

| Component | Status | Details |
|---|---|---|
| **Mongoose Models (`User`, `Voucher`, `AuditLog`)** | **Generated & Enhanced** | Generated basic fields; added compound indexes (`{ status: 1, expiryDate: 1 }`) for high-volume dataset requirements (Section 8). |
| **Error Handling Middleware (`errorHandler.js`)** | **Generated & Customized** | Tailored Mongoose `CastError`, `ValidationError`, and `11000` duplicate key handlers to output standard JSON `{ success: false, error, code }`. |
| **Automated Edge Case Tests (`edgeCases.test.js`)** | **Generated** | Authored Supertest suites specifically targeting Cases 1 through 8. |
| **React Glassmorphic UI (`index.css` & Components)** | **Generated & Customized** | Customized button themes, badge colors, pagination controls, and modal dialogs for high aesthetic quality. |
| **Inline Dummy Fallbacks** | **Rejected** | Rejected raw error swallowing or returning dummy success messages; implemented strict database validation instead. |
