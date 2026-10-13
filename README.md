# VEIL — Cybersecurity Management System

> 🌐 **Live Public Deployment:** [https://veil-v8gx.onrender.com](https://veil-v8gx.onrender.com)  
> ⚡ **Cloud Latency Notice:** Deployed on Render Free Tier + Cloud Supabase PostgreSQL 17. If inactive for >15 minutes, Render spins down container to preserve resources; initial access takes ~30–50 seconds on cold start. Once awake, performance is instantaneous and preserved by an automated 10-minute background keep-alive daemon.  
> 👨‍🏫 **Faculty Guide:** Dr. A. Swaminathan Sir  
> 🎓 **Author:** Himanshu Singh (PAT 4 Web Application Development Laboratory Experiment)  
> 🛡️ **Brand Expansion:** Visualize. Evaluate. Investigate. Lock.  
> 🔒 **Brand Tagline:** *"See beyond the surface. Secure what matters."*  
> ⚙️ **Architecture:** Java Servlets (Java EE 8 / Tomcat 9) + JDBC + Cloud Supabase PostgreSQL / Oracle 23ai  

---

## 1. Project Title & Brand Identity

**VEIL** is a specialized cybersecurity incident management workspace engineered for security operations centers (SOCs) and incident response teams. It consolidates anomaly ingestion, quantitative risk scoring, threat investigation, and containment workflows into a single, cohesive interface.

- **Primary Identity:** VEIL
- **Academic Descriptor:** CYBERSECURITY MANAGEMENT SYSTEM
- **Brand Expansion:** VISUALIZE. EVALUATE. INVESTIGATE. LOCK.
- **Tagline:** SEE BEYOND THE SURFACE. SECURE WHAT MATTERS.

---

## 2. Brand Description

Modern enterprises suffer from fragmented telemetry across disconnected monitoring tools. VEIL provides an editorial, calm, and technically rigorous terminal where security engineers can record detected signals, apply authoritative severity matrices, track investigation progress, and lock compromised attack vectors before lateral movement occurs.

---

## 3. Problem Statement

During cybersecurity incidents, seconds count. Traditional security management systems frequently suffer from:
1. **Cognitive Overload:** Cluttered, dark-mode terminal templates with neon text that impair legibility during long incident response shifts.
2. **Inconsistent Triage:** Subjective risk assessment rather than a centralized, rule-based evaluation matrix.
3. **Database Decoupling:** Client-side prototypes that simulate state rather than enforcing relational database integrity, foreign keys, and atomic transactions.
4. **Weak Access Controls:** Missing server-side authorization checks on administrative operations.

VEIL directly addresses these challenges by pairing an art-directed, high-contrast light-mode design with a layered Java/JDBC architecture backed by Oracle Database constraints.

---

## 4. Objectives

1. Implement a complete, working web application fulfilling PAT 4 requirements.
2. Deliver Oracle Database persistence using standard JDBC `PreparedStatement` and sequence-driven primary keys.
3. Provide an authoritative rule-based severity evaluation engine (1–10).
4. Establish secure session-based authentication with BCrypt hashing and CSRF defenses.
5. Create an original, editorial aesthetic adhering strictly to the user's Cyprus and Sand visual identity.
6. Provide comprehensive technical documentation and test cases for viva examination defense.

---

## 5. Key Features

- **Live Security Dashboard:** Real-time metrics calculating total signals, actionable open threats, critical incidents, and containment ratios directly from Oracle.
- **Featured Priority Threat:** Algorithmically highlights the highest-severity unresolved incident from database records.
- **Interactive Severity Matrix:** Dynamic client-side preview matched with authoritative server-side evaluation.
- **Filterable Incident Register:** Multi-criteria search (title, system, reporter), category filtering, severity segmentation, and instant workflow transitions.
- **Role-Based User Management:** Administrator-only terminal to provision analysts, rotate passwords, and manage operational scopes.
- **Graceful Offline Fallback:** An embedded Oracle-compatible JDBC engine activates if an external Oracle server is unreachable, ensuring flawless PAT 4 demonstrations anywhere.

---

## 6. Technology Stack

| Layer | Component | Version / Specification | Details |
|---|---|---|---|
| **Frontend Structure** | Semantic HTML5 | HTML5 Living Standard | W3C compliant, semantic tags, zero external UI libraries |
| **Frontend Styling** | Vanilla CSS3 | Custom Properties | Strict Cyprus (`#004741`) & Sand (`#F0EDE6`) Light Mode |
| **Frontend Dynamics** | Vanilla JavaScript | ES6+ Modern JS | Native Fetch API, Dynamic DOM, zero dependencies |
| **3D Visual Core** | CSS 3D Transforms | Hardware-Accelerated | Rotating 4-facet cybersecurity crystal core with status glow |
| **Backend Framework** | Java Servlets | Java EE 8 (Servlet 4.0 API) | Multi-tier REST controllers (`/api/auth`, `/api/incidents`, etc.) |
| **Application Server** | Apache Tomcat | Tomcat 9.0 (JRE 11) | Eclipse Temurin 11 runtime containerized with Maven 3.8 |
| **Persistence Engine** | JDBC Thin Architecture | Standard `java.sql` | `PreparedStatement`, atomic commits, connection decoupling |
| **Cloud Database (24/7)** | Cloud Supabase | PostgreSQL 17.11 | Hosted 24/7 on AWS Sydney; accessed via IPv4 Transaction Pooler (Port 6543) |
| **Lab/On-Prem Database** | Oracle Database | Oracle 23ai / 19c / 11g | Supported via `ojdbc8` thin driver (`localhost:1521/FREEPDB1`) |
| **Fallback Engine** | Embedded JDBC | In-Memory Oracle Mode H2 | Auto-boots if no external DB reachable, guaranteeing zero viva failures |
| **Password Cryptography** | jBCrypt | BCrypt Cost Factor 10 | Irreversible salted hashing for all user accounts |
| **Data Interchange** | Google Gson | 2.10.1 | Strict standardized API response envelopes (`{success, data, message}`) |
| **Cloud Deployment** | Render.com PaaS | Multi-Stage Dockerfile | Deployed at `https://veil-v8gx.onrender.com` with dynamic `$PORT` binding |
| **Availability Daemon** | KeepAliveListener | Java ScheduledExecutor | Automatic 10-minute self-ping to prevent Render 15-minute idle spin-down |

---

## 7. Architecture Diagram

```
+---------------------------------------------------------------------------------+
|                                 CLIENT TIER                                     |
|   HTML5 Semantic DOM  <--->  CSS3 Editorial Design  <--->  Vanilla JS Engine    |
|   (Cyprus & Sand)            (70% Edit / 20% Tactile)       (Fetch API / DOM)   |
+---------------------------------------------------------------------------------+
                                       |
                                       | HTTPS / JSON (HTTP 1.1)
                                       v
+---------------------------------------------------------------------------------+
|                            SERVLET CONTAINER (TOMCAT)                           |
|  +---------------------------------------------------------------------------+  |
|  | FILTER PIPELINE: CorsAndSecurityFilter -> AuthenticationFilter -> Session |  |
|  +---------------------------------------------------------------------------+  |
|                                       |                                         |
|  +---------------------------------------------------------------------------+  |
|  | SERVLETS:  AuthServlet | DashboardServlet | IncidentServlet | UserServlet |  |
|  +---------------------------------------------------------------------------+  |
|                                       |                                         |
|  +---------------------------------------------------------------------------+  |
|  | SERVICES:  AuthService | IncidentService | SeverityService | UserService  |  |
|  +---------------------------------------------------------------------------+  |
|                                       |                                         |
|  +---------------------------------------------------------------------------+  |
|  | DAO LAYER: UserDao | IncidentDao (Parameterized PreparedStatements)       |  |
|  +---------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------+
                                       |
                                       | JDBC Thin Driver (ojdbc8)
                                       v
+---------------------------------------------------------------------------------+
|                            ORACLE DATABASE TIER                                 |
|  Tables:       SYSTEM_USERS <====== FK (ON DELETE CASCADE) ======> INCIDENT     |
|  Constraints:  PK, UNIQUE, NOT NULL, CHECK (SEVERITY 1..10), CHECK (STATUS)    |
|  Sequences:    USER_SEQ (1001+) | INCIDENT_SEQ (5001+)                          |
|  Indexes:      B-Tree Indexes on STATUS, SEVERITY, EMAIL, USER_ID               |
+---------------------------------------------------------------------------------+
```

---

## 8. Project Structure

```text
VEIL/
├── README.md                           # Master Project Documentation
├── pom.xml                             # Maven Build Configuration
├── .gitignore                          # Build & Secret Exclusion Rules
├── mvnw                                # Maven Wrapper (UNIX)
├── mvnw.cmd                            # Maven Wrapper (Windows)
├── .mvn/                               # Wrapper Configuration
├── docs/
│   ├── DATABASE_SCHEMA.md              # Oracle ER & Constraint Specs
│   ├── API_DOCUMENTATION.md            # Servlet REST Contracts
│   ├── TEST_CASES.md                   # Verification & Viva Test Matrices
│   └── INSTALLATION.md                 # Deployment & Setup Walkthrough
├── database/
│   ├── 01_schema.sql                   # Oracle DDL (Tables, Constraints, Indexes)
│   ├── 02_sequences.sql                # Oracle Sequences & Triggers
│   ├── 03_seed_data.sql                # Seed Data with BCrypt Hashes
│   ├── 04_sample_dml.sql               # Viva Aggregation & CRUD Queries
│   └── 05_verification.sql             # SQL*Plus Verification Script
└── src/
    ├── main/
    │   ├── java/
    │   │   └── com/veil/
    │   │       ├── config/
    │   │       │   └── DatabaseConfig.java
    │   │       ├── model/
    │   │       │   ├── User.java
    │   │       │   ├── Incident.java
    │   │       │   ├── SeverityInfo.java
    │   │       │   └── DashboardSummary.java
    │   │       ├── dao/
    │   │       │   ├── UserDao.java
    │   │       │   └── IncidentDao.java
    │   │       ├── service/
    │   │       │   ├── AuthService.java
    │   │       │   ├── IncidentService.java
    │   │       │   ├── UserService.java
    │   │       │   └── SeverityService.java
    │   │       ├── servlet/
    │   │       │   ├── AuthServlet.java
    │   │       │   ├── DashboardServlet.java
    │   │       │   ├── IncidentServlet.java
    │   │       │   └── UserServlet.java
    │   │       ├── filter/
    │   │       │   ├── CorsAndSecurityFilter.java
    │   │       │   └── AuthenticationFilter.java
    │   │       └── util/
    │   │           ├── JsonUtil.java
    │   │           ├── PasswordUtil.java
    │   │           └── ValidationUtil.java
    │   └── webapp/
    │       ├── index.html              # Main Application Workspace
    │       ├── login.html              # Editorial Split-Screen Authentication
    │       ├── assets/
    │       │   ├── css/
    │       │   │   └── style.css       # Master Design System (Cyprus & Sand)
    │       │   ├── js/
    │       │   │   └── app.js          # REST Client & Controller Logic
    │       │   └── fonts/
    │       │       └── README.md       # Font Assets & Licensing Guide
    │       └── WEB-INF/
    │           └── web.xml             # Tomcat Deployment Descriptor
    └── test/
        └── java/
            └── com/veil/
                ├── SeverityServiceTest.java
                ├── ValidationUtilTest.java
                └── PasswordUtilTest.java
```

---

## 9. Prerequisites

Before running VEIL, verify your local development tools:
- **Java**: JDK 11, 17, or 21 (`java -version`)
- **Maven**: Version 3.8+ or use `./mvnw`
- **Oracle Database**: Oracle 11g XE, 12c, 19c, or 21c
- **Tomcat**: Apache Tomcat 9.0.x

---

## 10. Java Installation & Verification

Verify your active JDK:
```bash
java -version
javac -version
```
Output should indicate OpenJDK or Oracle JDK 11 or higher.

---

## 11. Maven Configuration

VEIL includes the standard Maven Wrapper. To verify:
```bash
./mvnw -v
```

---

## 12. Oracle Database Setup

1. Start your Oracle Database service (`XE` or `ORCL`).
2. Ensure the TNS listener is running:
   ```bash
   lsnrctl status
   ```

---

## 13. SQL*Plus Connection

Connect to Oracle via SQL*Plus:
```bash
sqlplus system/oracle@localhost:1521/XE
```

---

## 14. JDBC Driver Installation & Configuration

The Oracle JDBC driver (`ojdbc8`) is configured directly in `pom.xml`:
```xml
<dependency>
    <groupId>com.oracle.database.jdbc</groupId>
    <artifactId>ojdbc8</artifactId>
    <version>19.3.0.0</version>
</dependency>
```
`ojdbc8` is fully backward compatible with Oracle Database 11g R2, 12c, 18c, 19c, and 21c.

---

## 15. Environment Variables

Configure database connection strings if using non-default credentials:

```bash
export VEIL_DB_URL="jdbc:oracle:thin:@localhost:1521:XE"
export VEIL_DB_USER="system"
export VEIL_DB_PASSWORD="oracle"
export VEIL_DB_DRIVER="oracle.jdbc.OracleDriver"
```

---

## 16. DDL Execution

In SQL*Plus, run the schema creation script:
```sql
@database/01_schema.sql;
@database/02_sequences.sql;
```

---

## 17. DML and Sample Data

Load realistic security incident telemetry and initial user accounts:
```sql
@database/03_seed_data.sql;
```

---

## 18. Secure Administrator Initialization

VEIL creates an initial Administrator account during seeding:
- **Email:** `admin@veil.sec`
- **Password:** `admin123`
- **Role:** `ADMIN`

An operational analyst account is also provisioned:
- **Email:** `analyst@veil.sec`
- **Password:** `analyst123`
- **Role:** `USER`

Passwords are saved using BCrypt (`$2a$10$...`).

---

## 19. Build Commands

Compile, execute unit test suites, and package the WAR:
```bash
# Clean, test, and package
./mvnw clean package
```
This produces `target/veil.war`.

---

## 20. Tomcat Setup

1. Download and extract **Apache Tomcat 9.0.x**.
2. Set permissions on scripts (macOS/Linux):
   ```bash
   chmod +x /path/to/tomcat/bin/*.sh
   ```

---

## 21. WAR Deployment

Copy `target/veil.war` into Tomcat's `webapps/` directory:
```bash
cp target/veil.war /path/to/tomcat/webapps/
```
Start Tomcat:
```bash
/path/to/tomcat/bin/startup.sh
```

---

## 22. Application URL

Access the system in your browser:
```text
http://localhost:8080/veil/
```
Unauthenticated users are automatically routed to the editorial sign-in page.

---

## 23. Functional Workflow

1. **Authentication:** The operator signs in with email/password; the server rotates session ID, validates BCrypt hash, and sets an `HttpOnly` session cookie with a CSRF token.
2. **Dashboard Review:** Live database metrics populate total, open, critical, and resolved counts alongside the algorithmically selected featured incident.
3. **Incident Reporting:** The analyst fills the reporting form; moving the severity slider provides real-time matrix feedback. Submitting the form commits the record to Oracle via sequence `INCIDENT_SEQ.NEXTVAL`.
4. **Register & Triage:** Analysts search, filter by severity, and transition incident status (`Open` &rarr; `In Progress` &rarr; `Resolved`).
5. **Administration:** Administrators access User Management to provision analysts and inspect personnel.

---

## 24. Severity Rules

| Score | Classification | Suggested Response Playbook |
|---|---|---|
| **1–3** | Low | Record and monitor |
| **4–6** | Medium | Investigate and assess impact |
| **7–8** | High | Prioritize investigation |
| **9–10** | Critical | Immediate attention |

---

## 25. Database Schema & Relationships

See [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) for full ER diagrams, constraint names, and data dictionaries.

---

## 26. API Documentation

See [API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) for detailed JSON payloads, headers, and status code specifications.

---

## 27. Security Measures

- **No Plaintext Passwords:** Strict BCrypt hashing with 10 salt rounds.
- **SQL Injection Prevention:** 100% of SQL statements utilize parameterized `PreparedStatement`.
- **Session ID Rotation:** Session fixation prevented by invalidating existing session on login.
- **Role Enforcement:** Server-side authorization checks on all `/api/users` endpoints.
- **XSS Defense:** Client-side HTML entity escaping utility (`ValidationUtil.escapeHtml`).
- **Security Headers:** `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Content-Security-Policy`.

---

## 28. Testing Instructions

Run the automated backend test suite:
```bash
./mvnw test
```
See [TEST_CASES.md](docs/TEST_CASES.md) for full viva test matrices.

---

## 29. Troubleshooting

- **ORA-00942: table or view does not exist:** Ensure `database/01_schema.sql` was executed in the correct Oracle schema.
- **ORA-12541: TNS:no listener:** Start Oracle listener using `lsnrctl start`.
- **Tomcat Port 8080 Conflict:** Modify `conf/server.xml` to change the connector port (e.g., `8088`).

---

## 30. Known Limitations

- Real-time threat feeds require manual refresh or tab switching; WebSockets are not enabled in this Servlet 4.0 implementation.
- Exporting incident logs to STIX/TAXII format is reserved for future versions.

---

## 31. Future Improvements

- Automated SIEM log ingestion adapters (Syslog / Splunk forwarders).
- Multi-factor authentication (TOTP RFC 6238).
- Role permissions matrix editor.

---

## 32. Font Installation & Licensing Notes

VEIL's editorial art direction is built around two reference typefaces:
- **Bootzy:** Bold / Gritty expressive display font.
- **AQUIRE:** Sharp, technical, precise headings and annotations.

Place font files in `src/main/webapp/assets/fonts/`:
- `Bootzy.woff2` / `Bootzy.ttf`
- `AQUIRE.woff2` / `AQUIRE.otf`

High-precision geometric fallbacks are automatically active if font files are absent. See [assets/fonts/README.md](src/main/webapp/assets/fonts/README.md).

---

## 33. Exact Design Tokens & Color Values

VEIL is strictly **Light Mode**:

```css
:root {
  /* Immutable brand colors */
  --cyprus: #004741;
  --sand: #F0EDE6;

  /* Light surfaces */
  --paper: #F0EDE6;
  --surface: #FAF8F3;
  --surface-raised: #FFFDF8;
  --surface-white: #FFFFFF;

  /* Typography */
  --ink: #202522;
  --muted: #68716B;
  --muted-strong: #4E5952;

  /* Borders and separators */
  --border: #D9DCD4;
  --border-strong: #BFC8BF;

  /* Cyprus tints */
  --cyprus-soft: #E1EBE6;
  --cyprus-mid: #AFC9BE;
  --cyprus-deep: #003B36;

  /* Semantic states */
  --danger: #B83B34;
  --danger-soft: #F7E8E5;
  --warning: #8A5B13;
  --warning-soft: #F7EEDB;
  --success: #286747;
  --success-soft: #E4F0E7;
  --info: #285F70;
  --info-soft: #E5F0F3;
}
```

---

## 34. Online Deployment & Remote SQL*Plus / JDBC / ODBC Architecture

VEIL satisfies production and university evaluation criteria with **zero hardcoded credentials**:

1. **Online Public Web Application**: Deployed via the root [Dockerfile](Dockerfile) on Render, Railway, or Fly.io with dynamic `$PORT` binding.
2. **Online Database Access**:
   - **Remote SQL\*Plus**: Accessible over the internet via `sqlplus <USER>/<PASSWORD>@<HOST>:<PORT>/<SERVICE>` (e.g. `sqlplus system/oracle123@1.tcp.ngrok.io:12345/FREEPDB1`).
   - **Remote JDBC**: Accessible over the internet via `jdbc:oracle:thin:@<HOST>:<PORT>/<SERVICE>`.
   - **Remote ODBC**: Accessible via standard Oracle ODBC driver with host, port, and service parameters.
3. **Zero Hardcoded Credentials**: Configured 100% via environment variables:
   - `VEIL_DB_DRIVER`
   - `VEIL_DB_URL`
   - `VEIL_DB_USER`
   - `VEIL_DB_PASSWORD`

See [docs/ONLINE_DEPLOYMENT.md](docs/ONLINE_DEPLOYMENT.md) for step-by-step instructions.

---

## 35. Academic Attribution & PAT 4 Credits

- **Developer:** Himanshu Singh
- **Faculty Guide:** Dr. A. Swaminathan Sir
- **Academic Context:** PAT 4 Web Application Development Laboratory Experiment
- **Evaluation Criteria:** Relational Constraints, Multi-Tier Java Servlets, PreparedStatements, Session RBAC, Zero-Hardcode Config, Remote Oracle SQL*Plus & JDBC Validation.

---

## 36. Complete Database Operations Catalog (DDL, DML, DQL, TCL)

VEIL implements a comprehensive catalog of relational database commands across both Oracle Database 23ai/19c and Cloud Supabase PostgreSQL 17.

### A. Data Definition Language (DDL)

```sql
-- 1. Sequence Creation (Auto-increment surrogate keys)
CREATE SEQUENCE USER_SEQ START WITH 1004 INCREMENT BY 1;
CREATE SEQUENCE INCIDENT_SEQ START WITH 5011 INCREMENT BY 1;

-- 2. System Users Table with Domain Constraints
CREATE TABLE SYSTEM_USERS (
    USER_ID BIGINT PRIMARY KEY,
    USER_NAME VARCHAR(50) NOT NULL,
    EMAIL VARCHAR(100) UNIQUE NOT NULL,
    PASSWORD_HASH VARCHAR(255) NOT NULL,
    ROLE VARCHAR(10) NOT NULL CHECK (ROLE IN ('ADMIN', 'USER')),
    ACCOUNT_STATUS VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL CHECK (ACCOUNT_STATUS IN ('ACTIVE', 'SUSPENDED')),
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Security Incident Table with Referential Integrity & Range Constraints
CREATE TABLE SECURITY_INCIDENT (
    INCIDENT_ID BIGINT PRIMARY KEY,
    USER_ID BIGINT NOT NULL,
    THREAT VARCHAR(200) NOT NULL,
    INCIDENT_TYPE VARCHAR(50) NOT NULL,
    AFFECTED_SYSTEM VARCHAR(100) NOT NULL,
    DESCRIPTION VARCHAR(2000) NOT NULL,
    SEVERITY SMALLINT NOT NULL CHECK (SEVERITY BETWEEN 1 AND 10),
    STATUS VARCHAR(20) DEFAULT 'Open' NOT NULL CHECK (STATUS IN ('Open', 'In Progress', 'Resolved')),
    REPORTED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UPDATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT FK_INCIDENT_USER FOREIGN KEY (USER_ID) REFERENCES SYSTEM_USERS(USER_ID) ON DELETE CASCADE
);
```

### B. Data Manipulation Language (DML)

```sql
-- 1. User Ingestion (Insert with BCrypt Hash)
INSERT INTO SYSTEM_USERS (USER_ID, USER_NAME, EMAIL, PASSWORD_HASH, ROLE, ACCOUNT_STATUS, CREATED_AT)
VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);

-- 2. Security Incident Ingestion (Atomic INSERT)
INSERT INTO SECURITY_INCIDENT (
    INCIDENT_ID, USER_ID, THREAT, INCIDENT_TYPE, AFFECTED_SYSTEM, DESCRIPTION, SEVERITY, STATUS, REPORTED_AT, UPDATED_AT
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3. Incident State Modification (Full Update)
UPDATE SECURITY_INCIDENT SET 
    THREAT = ?, INCIDENT_TYPE = ?, AFFECTED_SYSTEM = ?, DESCRIPTION = ?, 
    SEVERITY = ?, STATUS = ?, UPDATED_AT = CURRENT_TIMESTAMP 
WHERE INCIDENT_ID = ?;

-- 4. Workflow Transition (Fast Status Triage)
UPDATE SECURITY_INCIDENT SET 
    STATUS = ?, UPDATED_AT = CURRENT_TIMESTAMP 
WHERE INCIDENT_ID = ?;

-- 5. User Account Modification
UPDATE SYSTEM_USERS SET 
    USER_NAME = ?, EMAIL = ?, ROLE = ?, ACCOUNT_STATUS = ? 
WHERE USER_ID = ?;

-- 6. User Password Rotation
UPDATE SYSTEM_USERS SET 
    PASSWORD_HASH = ? 
WHERE USER_ID = ?;

-- 7. Incident Deletion
DELETE FROM SECURITY_INCIDENT WHERE INCIDENT_ID = ?;

-- 8. User Deletion (Cascades automatically to incidents)
DELETE FROM SYSTEM_USERS WHERE USER_ID = ?;
```

### C. Data Query Language (DQL)

```sql
-- 1. Dynamic Multi-Criteria Search & Filtering (with Numeric Incident ID Parsing)
SELECT i.INCIDENT_ID, i.USER_ID, u.USER_NAME, u.EMAIL, i.THREAT, i.INCIDENT_TYPE,
       i.AFFECTED_SYSTEM, i.DESCRIPTION, i.SEVERITY, i.STATUS, i.REPORTED_AT, i.UPDATED_AT
FROM SECURITY_INCIDENT i
LEFT JOIN SYSTEM_USERS u ON i.USER_ID = u.USER_ID
WHERE 1=1
  AND (LOWER(i.THREAT) LIKE ? 
       OR LOWER(i.AFFECTED_SYSTEM) LIKE ? 
       OR LOWER(u.USER_NAME) LIKE ? 
       OR LOWER(i.INCIDENT_TYPE) LIKE ? 
       OR LOWER(i.DESCRIPTION) LIKE ? 
       OR i.INCIDENT_ID = ? 
       OR CAST(i.INCIDENT_ID AS VARCHAR(30)) LIKE ?)
  AND i.STATUS = ?
  AND i.SEVERITY >= ? AND i.SEVERITY <= ?
ORDER BY i.REPORTED_AT DESC;

-- 2. Real-Time Aggregate Dashboard Analytics
SELECT 
    COUNT(*) AS TOTAL,
    COUNT(CASE WHEN STATUS = 'Open' THEN 1 END) AS OPEN_CNT,
    COUNT(CASE WHEN STATUS = 'In Progress' THEN 1 END) AS IN_PROG_CNT,
    COUNT(CASE WHEN STATUS = 'Resolved' THEN 1 END) AS RESOLVED_CNT,
    COUNT(CASE WHEN SEVERITY BETWEEN 7 AND 8 THEN 1 END) AS HIGH_CNT,
    COUNT(CASE WHEN SEVERITY BETWEEN 9 AND 10 THEN 1 END) AS CRITICAL_CNT
FROM SECURITY_INCIDENT;

-- 3. Severity Distribution Segmentation (Categorical Aggregation)
SELECT 
  CASE 
    WHEN SEVERITY BETWEEN 1 AND 3 THEN 'Low (1-3)'
    WHEN SEVERITY BETWEEN 4 AND 6 THEN 'Medium (4-6)'
    WHEN SEVERITY BETWEEN 7 AND 8 THEN 'High (7-8)'
    WHEN SEVERITY BETWEEN 9 AND 10 THEN 'Critical (9-10)'
  END AS SEV_CAT, COUNT(*) AS CNT
FROM SECURITY_INCIDENT
GROUP BY CASE 
  WHEN SEVERITY BETWEEN 1 AND 3 THEN 'Low (1-3)'
  WHEN SEVERITY BETWEEN 4 AND 6 THEN 'Medium (4-6)'
  WHEN SEVERITY BETWEEN 7 AND 8 THEN 'High (7-8)'
  WHEN SEVERITY BETWEEN 9 AND 10 THEN 'Critical (9-10)'
END;

-- 4. Featured Critical Incident Selection (Filtered by Severity & Date)
SELECT i.INCIDENT_ID, i.USER_ID, u.USER_NAME, u.EMAIL, i.THREAT, i.INCIDENT_TYPE,
       i.AFFECTED_SYSTEM, i.DESCRIPTION, i.SEVERITY, i.STATUS, i.REPORTED_AT, i.UPDATED_AT
FROM SECURITY_INCIDENT i
LEFT JOIN SYSTEM_USERS u ON i.USER_ID = u.USER_ID
WHERE i.STATUS IN ('Open', 'In Progress')
ORDER BY i.SEVERITY DESC, i.REPORTED_AT ASC;
```

### D. Transaction Control Language (TCL)

Implemented via Java JDBC Connection API:
```java
// Atomic multi-statement sequence generation and insertion
conn.setAutoCommit(false);
try {
    // 1. Fetch sequence nextval
    // 2. Insert record
    conn.commit();
} catch (SQLException ex) {
    conn.rollback();
    throw ex;
} finally {
    conn.setAutoCommit(true);
}
```

---

## 37. Live Cloud Deployment & Performance Telemetry

- **Live URL:** [https://veil-v8gx.onrender.com](https://veil-v8gx.onrender.com)
- **Primary Database:** Cloud Supabase (PostgreSQL 17.11) via IPv4 Transaction Pooler (`aws-0-ap-southeast-2.pooler.supabase.com:6543`)
- **Container Runtime:** Apache Tomcat 9.0 on Eclipse Temurin OpenJDK 11
- **Latency / Cold-Start Behavior:**
  - Render Free Tier instances enter an idle sleep state after 15 minutes of zero traffic.
  - Initial cold-start takes approximately **30–50 seconds** while the container starts.
  - Once started, all subsequent requests respond with low latency (~50–150ms).
  - To minimize sleep occurrences, VEIL runs an internal background [`KeepAliveListener`](src/main/java/com/veil/listener/KeepAliveListener.java) that sends self-heartbeat pings every 10 minutes.


