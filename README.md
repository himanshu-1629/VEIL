# VEIL — Cybersecurity Management System

> **Brand Expansion:** Visualize. Evaluate. Investigate. Lock.  
> **Brand Tagline:** *"See beyond the surface. Secure what matters."*  
> **Academic Purpose:** PAT 4 Web Application Development  
> **Backend Architecture:** Java Servlets (Java EE / Jakarta EE) + JDBC  
> **Database:** Oracle Database 11g / 12c / 19c / 21c  
> **Frontend:** HTML5 &bull; CSS3 &bull; Vanilla JavaScript (Fetch API)  
> **Application Server:** Apache Tomcat 9.0  
> **Build System:** Apache Maven 3.8+ / Maven Wrapper  

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

| Layer | Component | Version / Specification |
|---|---|---|
| **Frontend Structure** | Semantic HTML5 | W3C Validated, Accessible |
| **Frontend Styling** | Vanilla CSS3 | Custom Properties, Subtle Morphism, Light Mode Only |
| **Frontend Logic** | Vanilla JavaScript (ES6+) | Fetch API, REST Integration, No frameworks |
| **Backend Engine** | Java Servlets | Java EE 8 (Servlet 4.0 API) |
| **Persistence** | JDBC (Java Database Connectivity) | `PreparedStatement`, Connection Pooling, Transactions |
| **Database** | Oracle Database | Oracle 11g XE / 12c / 19c Enterprise |
| **Security / Crypto** | jBCrypt | BCrypt cost factor 10 |
| **Data Interchange** | Google Gson | 2.10.1 (Strict JSON envelopes) |
| **Application Server** | Apache Tomcat | 9.0.x |
| **Build Automation** | Apache Maven | Maven 3.10 / `./mvnw` Wrapper |

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
