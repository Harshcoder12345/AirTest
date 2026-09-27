# Mandatory AI Submission - Prompts & Workflow Log (Section 12)

This document details the AI tools, prompts, debugging steps, and testing prompts used during the development of the **Employee Certification Portal** practical assessment.

---

## 1. AI Tool Used
- **AI Assistant**: Antigravity AI (Powered by Gemini 3.6 Flash)

---

## 2. Requirement Analysis & Architecture Prompts

### Prompt 1: Initial Requirement Analysis & Database Schema Design
> **User Prompt**:
> *"I need to do test Task Its is related to MERN stack for DB part i will use mongo clound that i will provide you later , I need frontend and backend both in same folder also implement each and every part along with that i will check the testing of each case..."*
>
> **Intent & AI Action**:
> Analyzed business scenarios (Manager voucher creation, assignment, revocation; Employee redemption; audit history tracking) and established schema models for `User`, `Voucher`, and `AuditLog` with explicit status indexes and Mongoose references.

---

## 3. Coding & Implementation Prompts

### Prompt 2: Core Business Rule & Edge Case Implementation (Cases 1-8)
> **Goal**:
> Implement controller logic in `voucherController.js` and `authController.js` enforcing all 8 business validation edge cases:
> - **Case 1**: Prevent re-assigning an already assigned voucher (`400 Bad Request`).
> - **Case 2**: Prevent assigning an expired voucher (`400 Bad Request`).
> - **Case 3**: Prevent redeeming another employee's voucher (`403 Forbidden`).
> - **Case 4**: Prevent redeeming an already redeemed voucher (`400 Bad Request`).
> - **Case 5**: Prevent redeeming an expired voucher (`400 Bad Request`).
> - **Case 6**: Prevent revoking a redeemed voucher (`400 Bad Request`).
> - **Case 7**: Handle invalid ID format gracefully (`400 Bad Request`).
> - **Case 8**: Handle missing request parameters (`400 Bad Request`).

---

## 4. Debugging & Error-Fixing Prompts

### Debugging Prompt 1: PowerShell Command Syntax Error
> **User Log / Error**:
> `mkdir : A positional parameter cannot be found that accepts argument 'client'.`
>
> **Prompt & Fix**:
> *"Fix PowerShell directory creation error when initializing server and client folders."*
> **Resolution**: Switched command from `mkdir server client` to PowerShell native `New-Item -ItemType Directory -Path server, client -Force`.

---

### Debugging Prompt 2: MongoDB Cloud Atlas Authentication Error
> **User Log / Error**:
> `Seeding error: MongoServerError: bad auth : authentication failed (code: 8000, codeName: 'AtlasError')`
>
> **Prompt & Fix**:
> *"How to resolve MongoDB Atlas authentication failed error during npm run seed?"*
> **Resolution**: Identified incorrect username/password in `server/.env`. Provided instructions to update MongoDB Atlas Database Access credentials, URL-encode special characters, and configure IP Access Whitelist (`0.0.0.0/0`).

---

### Debugging Prompt 3: Handling 404 vs 403 on Unowned Voucher Redemption
> **User Log / Error**:
> `HTTP 404 Bad Request: Voucher not found when testing Case 3`
>
> **Prompt & Fix**:
> *"Ensure Case 3 UI test button queries active assigned vouchers belonging to other users to return HTTP 403 Forbidden."*
> **Resolution**: Refactored `testRedeemAnotherEmployeeVoucher()` in `EmployeeDashboard.jsx` to dynamically retrieve a valid assigned voucher belonging to another employee, guaranteeing HTTP 403 response.

---

## 5. Testing & Verification Prompts

### Testing Prompt 1: Automated Edge Cases Integration Suite
> **Goal**:
> Create a zero-dependency automated Jest + Supertest integration suite (`server/tests/edgeCases.test.js`) backed by `mongodb-memory-server` to run automated verification of Cases 1 through 8.
>
> **Execution Command**:
> `npm run test` -> Passed 8/8 tests.

---

### Testing Prompt 2: Interactive 1-Click UI Test Buttons
> **User Prompt**:
> *"how to test case 6 from here?" / "How to test case 7?" / "Now how can i test case 8"*
>
> **Goal**:
> Add dedicated 1-click test buttons directly in the React UI for all edge cases so the evaluator can trigger HTTP errors visually without needing Postman:
> - `⚠️ Test Re-Assign` (Case 1)
> - `⚠️ Test Assign Expired` (Case 2)
> - `🛡️ Test Redeem Other's` (Case 3)
> - `Already Redeemed (Test Again)` (Case 4)
> - `⚠️ Test Redeem Expired` (Case 5)
> - `⚠️ Test Revoke Redeemed` (Case 6)
> - `⚠️ Test Invalid ID` (Case 7)
> - `⚠️ Test Missing Fields` (Case 8)

---

## 6. Optimization Prompts

### Optimization Prompt 1: Mobile Responsiveness & Layout Fixes
> **User Prompt**:
> *"make UI mobile response too currenlty i am using right scrollkb ar for it"*
>
> **Goal**:
> Add comprehensive mobile & tablet CSS `@media (max-width: 768px)` media queries to `index.css` to eliminate horizontal scrollbars and ensure cards, headers, and modals fit 100% of mobile viewports.

---

## 7. Generated vs. Modified vs. Rejected Code Summary

| Component | Status | Details |
|---|---|---|
| **Mongoose Models (`User`, `Voucher`, `AuditLog`)** | **Generated & Enhanced** | Generated basic fields; added compound indexes (`{ status: 1, expiryDate: 1 }`) for high-volume dataset requirements (Section 8). |
| **Error Handling Middleware (`errorHandler.js`)** | **Generated & Customized** | Tailored Mongoose `CastError`, `ValidationError`, and `11000` duplicate key handlers to output standard JSON `{ success: false, error, code }`. |
| **Automated Edge Case Tests (`edgeCases.test.js`)** | **Generated** | Authored Supertest suites specifically targeting Cases 1 through 8. |
| **React Glassmorphic UI (`index.css` & Components)** | **Generated & Customized** | Customized button themes, badge colors, pagination controls, and mobile responsive breakpoints. |
| **Inline Dummy Fallbacks** | **Rejected** | Rejected raw error swallowing or returning dummy success messages; implemented strict database validation instead. |
