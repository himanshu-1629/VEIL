# VEIL — RESTful API Specification
**Protocol**: HTTP/1.1  
**Data Format**: JSON (`application/json;charset=UTF-8`)  
**Authentication**: HTTP Cookie Session (`VEILSESSIONID`) + CSRF Token Header (`X-CSRF-Token`)

---

## 1. Authentication Endpoints (`/api/auth/*`)

### `POST /api/auth/login`
Authenticates credentials against Oracle DB, invalidates old session, establishes new session, and yields CSRF token.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "admin@veil.sec",
    "password": "admin123"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Authentication successful. Welcome to VEIL.",
    "data": {
      "userId": 1001,
      "userName": "Chief Security Officer",
      "email": "admin@veil.sec",
      "role": "ADMIN",
      "csrfToken": "b47c0f1a-8289-4b62-b91c-76d3f2824e93"
    }
  }
  ```
- **Error Response (401 Unauthorized)**:
  ```json
  {
    "success": false,
    "message": "Invalid email or password."
  }
  ```

---

### `POST /api/auth/logout`
Destroys server-side session and invalidates session cookie.
- **Access**: Authenticated Session
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Session ended. You have been safely logged out."
  }
  ```

---

### `GET /api/auth/me`
Inspects currently active session identity and CSRF token.
- **Access**: Public / Session inspection
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Active session verified",
    "data": {
      "userId": 1001,
      "userName": "Chief Security Officer",
      "email": "admin@veil.sec",
      "role": "ADMIN",
      "csrfToken": "b47c0f1a-8289-4b62-b91c-76d3f2824e93"
    }
  }
  ```

---

## 2. Dashboard Telemetry Endpoints (`/api/dashboard/*`)

### `GET /api/dashboard/summary`
Calculates live aggregation statistics directly from Oracle Database tables.
- **Access**: Authenticated (ADMIN or USER)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Dashboard metrics loaded",
    "data": {
      "totalIncidents": 10,
      "openIncidents": 3,
      "inProgressIncidents": 3,
      "resolvedIncidents": 4,
      "highSeverityIncidents": 2,
      "criticalIncidents": 2,
      "databaseEngine": "Oracle Database 11g Express Edition",
      "featuredIncident": {
        "incidentId": 5001,
        "threat": "Ransomware Stage-2 Dropper in Core SAN",
        "incidentType": "Malware",
        "affectedSystem": "Storage Area Network (SAN-01)",
        "severity": 10,
        "status": "Open",
        "reportedAt": "2026-10-12 11:30:00"
      },
      "severityDistribution": {
        "Critical (9-10)": 2,
        "High (7-8)": 2,
        "Medium (4-6)": 3,
        "Low (1-3)": 3
      },
      "statusDistribution": {
        "Open": 3,
        "In Progress": 3,
        "Resolved": 4
      },
      "operationalPosture": "Elevated Risk: 2 critical threat vector(s) active. Immediate response advised."
    }
  }
  ```

---

## 3. Incident Management Endpoints (`/api/incidents/*`)

### `GET /api/incidents`
Lists incidents with optional search parameters and filters.
- **Parameters**:
  - `search` (string): substring search on threat, asset, reporter, category.
  - `status` (string): `Open`, `In Progress`, `Resolved`.
  - `minSev` (int 1-10): minimum severity score.
  - `maxSev` (int 1-10): maximum severity score.
  - `sortBy` (string): `date`, `severity`, `threat`, `id`.
  - `sortOrder` (string): `ASC` or `DESC`.
- **Response (200 OK)**: List of matching incidents.

---

### `GET /api/incidents/{id}`
Returns full record and response playbook for an individual incident.
- **Response (200 OK)**: Single incident object.

---

### `POST /api/incidents`
Records a new security signal into Oracle via sequence generation.
- **Request Body**:
  ```json
  {
    "threat": "Active Distributed SSH Brute Force Campaign",
    "incidentType": "Unauthorized Access",
    "affectedSystem": "Edge Bastion (bastion-east-01)",
    "description": "Over 14,000 authentication failures from 38 distinct ASNs.",
    "severity": 9,
    "status": "Open"
  }
  ```
- **Response (201 Created)**: Saved incident record with generated `incidentId`.

---

### `POST /api/incidents/{id}/status`
Transitions the operational workflow state of an incident.
- **Request Body**:
  ```json
  {
    "status": "In Progress"
  }
  ```

---

### `DELETE /api/incidents/{id}`
Permanently removes an incident record from Oracle.
- **Authorization**: ADMIN or original reporting USER only.

---

## 4. User Provisioning Endpoints (`/api/users/*`)

All `/api/users` endpoints strictly enforce the **ADMIN** role on the server side.

### `GET /api/users`
Lists all registered personnel (passwords strictly masked).

### `POST /api/users`
Provisions a new operator with BCrypt hashed password and assigned role.

### `PUT /api/users/{id}`
Updates operator profile, role, status, or rotates password.

### `DELETE /api/users/{id}`
Revokes operator account.
