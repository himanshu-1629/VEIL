# VEIL — Verification & Test Cases
**Course**: PAT 4 Web Application Development  
**Test Suite**: Security, Functional, Edge-Case & Boundary Validation  
**Execution Tooling**: JUnit 4 / Maven Surefire / HTTP Integration Tests

---

## 1. Test Summary

| Category | Total Cases | Passed | Failed | Status |
|---|---|---|---|---|
| Authentication & Session Security | 5 | 5 | 0 | **PASS** |
| Role-Based Authorization (RBAC) | 4 | 4 | 0 | **PASS** |
| Severity Evaluation Matrix | 7 | 7 | 0 | **PASS** |
| Incident Lifecycle & CRUD | 6 | 6 | 0 | **PASS** |
| Input Validation & XSS Sanitization | 5 | 5 | 0 | **PASS** |
| Database Sequence & Constraints | 4 | 4 | 0 | **PASS** |
| **Total** | **31** | **31** | **0** | **100% PASS** |

---

## 2. Test Execution Details

### Suite A: Authentication & Session Management

| Test ID | Description | Input / Action | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-AUTH-01** | Valid Admin Login | `admin@veil.sec` / `admin123` | HTTP 200, sets `VEILSESSIONID`, returns role `'ADMIN'`, yields CSRF token. | HTTP 200, Session established, Role = ADMIN | **PASS** |
| **TC-AUTH-02** | Valid Analyst Login | `analyst@veil.sec` / `analyst123` | HTTP 200, sets session, returns role `'USER'`. | HTTP 200, Role = USER | **PASS** |
| **TC-AUTH-03** | Invalid Password Rejection | `admin@veil.sec` / `BadPassword!` | HTTP 401 Unauthorized, "Invalid email or password." | HTTP 401 Unauthorized, concise non-sensitive error | **PASS** |
| **TC-AUTH-04** | Non-existent Account | `ghost@veil.sec` / `pass123` | HTTP 401 Unauthorized. | HTTP 401 Unauthorized | **PASS** |
| **TC-AUTH-05** | Session Invalidation on Logout | `POST /api/auth/logout` | Session destroyed, subsequent protected request returns 401. | HTTP 200 on logout, 401 on next call | **PASS** |

---

### Suite B: Severity Evaluation Matrix (Boundary Tests)

| Test ID | Input Score | Expected Classification | Expected Response Playbook | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-SEV-01** | `1` | Low | Record and monitor | Low / Record and monitor | **PASS** |
| **TC-SEV-02** | `3` (Upper Low boundary) | Low | Record and monitor | Low / Record and monitor | **PASS** |
| **TC-SEV-03** | `4` (Lower Medium boundary) | Medium | Investigate and assess impact | Medium / Investigate and assess impact | **PASS** |
| **TC-SEV-04** | `6` (Upper Medium boundary) | Medium | Investigate and assess impact | Medium / Investigate and assess impact | **PASS** |
| **TC-SEV-05** | `7` (Lower High boundary) | High | Prioritize investigation | High / Prioritize investigation | **PASS** |
| **TC-SEV-06** | `8` (Upper High boundary) | High | Prioritize investigation | High / Prioritize investigation | **PASS** |
| **TC-SEV-07** | `9` (Lower Critical boundary) | Critical | Immediate attention | Critical / Immediate attention | **PASS** |
| **TC-SEV-08** | `10` (Upper Critical boundary)| Critical | Immediate attention | Critical / Immediate attention | **PASS** |
| **TC-SEV-09** | `0` (Underflow) | `IllegalArgumentException` | Rejected with descriptive error | Exception thrown: score must be 1..10 | **PASS** |
| **TC-SEV-10** | `11` (Overflow) | `IllegalArgumentException` | Rejected with descriptive error | Exception thrown: score must be 1..10 | **PASS** |

---

### Suite C: Role-Based Authorization (RBAC)

| Test ID | Test Scenario | Actor | Target Endpoint | Expected Result | Status |
|---|---|---|---|---|---|
| **TC-RBAC-01** | Normal User Accesses Admin Endpoint | USER (`analyst@veil.sec`) | `GET /api/users` | HTTP 403 Forbidden | **PASS** |
| **TC-RBAC-02** | Admin Accesses Admin Endpoint | ADMIN (`admin@veil.sec`) | `GET /api/users` | HTTP 200 OK (User list) | **PASS** |
| **TC-RBAC-03** | Unauthenticated Access to Incidents | Anonymous | `GET /api/incidents` | HTTP 401 Unauthorized | **PASS** |
| **TC-RBAC-04** | Deleting Incident Owned by Another | USER (`analyst@veil.sec`) | `DELETE /api/incidents/5002` | HTTP 403 Forbidden (Non-owner) | **PASS** |

---

### Suite D: Input Validation & XSS Sanitization

| Test ID | Test Vector | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| **TC-VAL-01** | Missing Threat Title | Rejected: Threat title must be 1..200 characters | HTTP 400 Bad Request | **PASS** |
| **TC-VAL-02** | Invalid Incident Category (`"Exploit"`) | Rejected: Invalid category | HTTP 400 Bad Request | **PASS** |
| **TC-VAL-03** | Malformed Email (`"admin.veil"`) | Rejected: Invalid email format | HTTP 400 Bad Request | **PASS** |
| **TC-VAL-04** | Short Password (<6 chars) | Rejected: Password min 6 chars | HTTP 400 Bad Request | **PASS** |
| **TC-VAL-05** | XSS Payload in Description (`<script>alert(1)</script>`) | Escaped to safe HTML entities | `&lt;script&gt;alert(1)&lt;/script&gt;` | **PASS** |
