# VEIL — Oracle Database Schema Specification
**Course**: PAT 4 Web Application Development  
**Target Systems**: Oracle Database 11g Express (XE) / Oracle 12c / 19c / 21c Enterprise  
**Design Philosophy**: Strictly normalized, sequence-driven, constraint-enforced relational model.

---

## 1. Schema Overview

VEIL utilizes an Oracle-compliant schema designed to record, categorize, investigate, and mitigate cybersecurity incidents within enterprise architectures.

```
       +-------------------------------------------------------+
       |                     SYSTEM_USERS                      |
       +-------------------------------------------------------+
       | PK  USER_ID         NUMBER                            |
       | UQ  EMAIL           VARCHAR2(100)                     |
       |     USER_NAME       VARCHAR2(50)                      |
       |     PASSWORD_HASH   VARCHAR2(255)                     |
       | CK  ROLE            VARCHAR2(10) ['ADMIN', 'USER']     |
       | CK  ACCOUNT_STATUS  VARCHAR2(20) ['ACTIVE', ...]      |
       |     CREATED_AT      DATE (DEFAULT SYSDATE)            |
       +-------------------------------------------------------+
                                  |
                                  | 1
                                  |
                                  | N (CASCADE DELETE)
                                  v
       +-------------------------------------------------------+
       |                  SECURITY_INCIDENT                    |
       +-------------------------------------------------------+
       | PK  INCIDENT_ID     NUMBER                            |
       | FK  USER_ID         NUMBER                            |
       |     THREAT          VARCHAR2(200)                     |
       | CK  INCIDENT_TYPE   VARCHAR2(50)                      |
       |     AFFECTED_SYSTEM VARCHAR2(100)                     |
       |     DESCRIPTION     VARCHAR2(2000)                    |
       | CK  SEVERITY        NUMBER(2) [1 .. 10]               |
       | CK  STATUS          VARCHAR2(20) ['Open', ...]        |
       |     REPORTED_AT     DATE (DEFAULT SYSDATE)            |
       |     UPDATED_AT      DATE (DEFAULT SYSDATE)            |
       +-------------------------------------------------------+
```

---

## 2. Table Definitions

### 2.1 Table: `SYSTEM_USERS`

Stores credentials and role assignments for security personnel.

| Column | Type | Nullable | Constraints & Description |
|---|---|---|---|
| `USER_ID` | `NUMBER` | No | **PRIMARY KEY**. Generated via sequence `USER_SEQ`. |
| `USER_NAME` | `VARCHAR2(50)` | No | Full display name of the operator. |
| `EMAIL` | `VARCHAR2(100)` | No | **UNIQUE**. RFC-compliant work email identifier. |
| `PASSWORD_HASH` | `VARCHAR2(255)` | No | Standard BCrypt hash (cost 10). Plaintext is never stored. |
| `ROLE` | `VARCHAR2(10)` | No | **CHECK**: `ROLE IN ('ADMIN', 'USER')`. |
| `ACCOUNT_STATUS` | `VARCHAR2(20)` | No | **CHECK**: `ACCOUNT_STATUS IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')`. Default: `'ACTIVE'`. |
| `CREATED_AT` | `DATE` | No | Timestamp of account provisioning. Default: `SYSDATE`. |

### 2.2 Table: `SECURITY_INCIDENT`

Logs detected threat vectors, anomalous indicators, and investigation lifecycles.

| Column | Type | Nullable | Constraints & Description |
|---|---|---|---|
| `INCIDENT_ID` | `NUMBER` | No | **PRIMARY KEY**. Generated via sequence `INCIDENT_SEQ`. |
| `USER_ID` | `NUMBER` | No | **FOREIGN KEY** referencing `SYSTEM_USERS(USER_ID)` on delete cascade. |
| `THREAT` | `VARCHAR2(200)` | No | Title or attack vector descriptor. |
| `INCIDENT_TYPE` | `VARCHAR2(50)` | No | **CHECK**: Restricted to 8 standard categories. |
| `AFFECTED_SYSTEM`| `VARCHAR2(100)` | No | Hostname, cluster, CIDR, or asset tag. |
| `DESCRIPTION` | `VARCHAR2(2000)`| No | Detailed forensic evidence and narrative. |
| `SEVERITY` | `NUMBER(2)` | No | **CHECK**: `SEVERITY BETWEEN 1 AND 10`. |
| `STATUS` | `VARCHAR2(20)` | No | **CHECK**: `STATUS IN ('Open', 'In Progress', 'Resolved')`. Default: `'Open'`. |
| `REPORTED_AT` | `DATE` | No | Signal creation timestamp. Default: `SYSDATE`. |
| `UPDATED_AT` | `DATE` | No | Last modification timestamp. Default: `SYSDATE`. |

---

## 3. Sequences & Triggers

To maintain strict backward compatibility with Oracle Database 11g Release 2 (which lacks the Oracle 12c `IDENTITY` clause), explicit sequences are utilized:

- **`USER_SEQ`**: `START WITH 1001 INCREMENT BY 1 NOCACHE;`
- **`INCIDENT_SEQ`**: `START WITH 5001 INCREMENT BY 1 NOCACHE;`

Pre-insert triggers (`TRG_USERS_BI`, `TRG_INCIDENT_BI`) ensure primary keys and dates are automatically populated if omitted by direct SQL tools.

---

## 4. Performance Indexes

- `IDX_USERS_EMAIL` on `SYSTEM_USERS(EMAIL)`: Fast O(1) login lookup.
- `IDX_USERS_ROLE` on `SYSTEM_USERS(ROLE)`: Administrative authorization checks.
- `IDX_INCIDENT_STATUS` on `SECURITY_INCIDENT(STATUS)`: High-frequency dashboard filtering.
- `IDX_INCIDENT_SEV` on `SECURITY_INCIDENT(SEVERITY)`: Prioritization ranking and metrics.
- `IDX_INCIDENT_USER` on `SECURITY_INCIDENT(USER_ID)`: Fast foreign-key joins.
- `IDX_INCIDENT_REPORTED` on `SECURITY_INCIDENT(REPORTED_AT DESC)`: Timeline feeds.
