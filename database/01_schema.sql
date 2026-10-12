-- ============================================================================
-- VEIL - Cybersecurity Management System
-- PAT 4 Web Application Development | Database Script 01: Schema Definition
-- Target: Oracle Database 11g / 12c / 19c / 21c
-- ============================================================================

-- Clean previous objects if rebuilding (safe drop block)
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE SECURITY_INCIDENT CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN
      IF SQLCODE != -942 THEN RAISE; END IF;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE SYSTEM_USERS CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN
      IF SQLCODE != -942 THEN RAISE; END IF;
END;
/

-- ============================================================================
-- TABLE: SYSTEM_USERS
-- Manages system operators, security analysts, and administrators.
-- ============================================================================
CREATE TABLE SYSTEM_USERS (
    USER_ID         NUMBER,
    USER_NAME       VARCHAR2(50)  NOT NULL,
    EMAIL           VARCHAR2(100) NOT NULL,
    PASSWORD_HASH   VARCHAR2(255) NOT NULL,
    ROLE            VARCHAR2(10)  NOT NULL,
    ACCOUNT_STATUS  VARCHAR2(20)  DEFAULT 'ACTIVE' NOT NULL,
    CREATED_AT      DATE          DEFAULT SYSDATE NOT NULL,
    CONSTRAINT PK_SYSTEM_USERS PRIMARY KEY (USER_ID),
    CONSTRAINT UQ_SYSTEM_USERS_EMAIL UNIQUE (EMAIL),
    CONSTRAINT CK_SYSTEM_USERS_ROLE CHECK (ROLE IN ('ADMIN', 'USER')),
    CONSTRAINT CK_SYSTEM_USERS_STATUS CHECK (ACCOUNT_STATUS IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'))
);

-- ============================================================================
-- TABLE: SECURITY_INCIDENT
-- Stores security signals, vulnerability reports, and active intrusions.
-- ============================================================================
CREATE TABLE SECURITY_INCIDENT (
    INCIDENT_ID      NUMBER,
    USER_ID          NUMBER        NOT NULL,
    THREAT           VARCHAR2(200) NOT NULL,
    INCIDENT_TYPE    VARCHAR2(50)  NOT NULL,
    AFFECTED_SYSTEM  VARCHAR2(100) NOT NULL,
    DESCRIPTION      VARCHAR2(2000) NOT NULL,
    SEVERITY         NUMBER(2)     NOT NULL,
    STATUS           VARCHAR2(20)  DEFAULT 'Open' NOT NULL,
    REPORTED_AT      DATE          DEFAULT SYSDATE NOT NULL,
    UPDATED_AT       DATE          DEFAULT SYSDATE NOT NULL,
    CONSTRAINT PK_SECURITY_INCIDENT PRIMARY KEY (INCIDENT_ID),
    CONSTRAINT FK_INCIDENT_USER FOREIGN KEY (USER_ID)
        REFERENCES SYSTEM_USERS(USER_ID) ON DELETE CASCADE,
    CONSTRAINT CK_INCIDENT_SEVERITY CHECK (SEVERITY BETWEEN 1 AND 10),
    CONSTRAINT CK_INCIDENT_STATUS CHECK (STATUS IN ('Open', 'In Progress', 'Resolved')),
    CONSTRAINT CK_INCIDENT_TYPE CHECK (INCIDENT_TYPE IN (
        'Unauthorized Access',
        'Phishing',
        'Malware',
        'Data Exposure',
        'Suspicious Login Activity',
        'Denial of Service',
        'Policy Violation',
        'Other'
    ))
);

-- ============================================================================
-- PERFORMANCE & FILTER INDEXES
-- Note: Oracle automatically indexes EMAIL via UQ_SYSTEM_USERS_EMAIL
CREATE INDEX IDX_USERS_ROLE ON SYSTEM_USERS(ROLE);

CREATE INDEX IDX_INCIDENT_STATUS ON SECURITY_INCIDENT(STATUS);
CREATE INDEX IDX_INCIDENT_SEV ON SECURITY_INCIDENT(SEVERITY);
CREATE INDEX IDX_INCIDENT_USER ON SECURITY_INCIDENT(USER_ID);
CREATE INDEX IDX_INCIDENT_REPORTED ON SECURITY_INCIDENT(REPORTED_AT DESC);
CREATE INDEX IDX_INCIDENT_TYPE ON SECURITY_INCIDENT(INCIDENT_TYPE);

COMMENT ON TABLE SYSTEM_USERS IS 'Authorized personnel accessing the VEIL security workspace';
COMMENT ON COLUMN SYSTEM_USERS.USER_ID IS 'Unique numeric identifier generated via sequence';
COMMENT ON COLUMN SYSTEM_USERS.ROLE IS 'Access scope: ADMIN or USER';

COMMENT ON TABLE SECURITY_INCIDENT IS 'Operational log of cybersecurity threats and response tracking';
COMMENT ON COLUMN SECURITY_INCIDENT.SEVERITY IS 'Numeric impact rating strictly between 1 (minimal) and 10 (critical)';
COMMENT ON COLUMN SECURITY_INCIDENT.STATUS IS 'Workflow state: Open, In Progress, or Resolved';
