-- ==============================================================================
-- VEIL — Cloud PostgreSQL / Supabase Schema & Seed Data
-- ==============================================================================
-- 100% Compatible with Supabase SQL Editor
-- Tables: SYSTEM_USERS, SECURITY_INCIDENT
-- Sequences: USER_SEQ, INCIDENT_SEQ
-- ==============================================================================

-- Drop existing tables/sequences if recreating
DROP TABLE IF EXISTS SECURITY_INCIDENT CASCADE;
DROP TABLE IF EXISTS SYSTEM_USERS CASCADE;
DROP SEQUENCE IF EXISTS USER_SEQ;
DROP SEQUENCE IF EXISTS INCIDENT_SEQ;

-- 1. Sequences
CREATE SEQUENCE USER_SEQ START WITH 1004 INCREMENT BY 1;
CREATE SEQUENCE INCIDENT_SEQ START WITH 5011 INCREMENT BY 1;

-- 2. System Users Table
CREATE TABLE SYSTEM_USERS (
    USER_ID BIGINT PRIMARY KEY,
    USER_NAME VARCHAR(50) NOT NULL,
    EMAIL VARCHAR(100) UNIQUE NOT NULL,
    PASSWORD_HASH VARCHAR(255) NOT NULL,
    ROLE VARCHAR(10) NOT NULL CHECK (ROLE IN ('ADMIN', 'USER')),
    ACCOUNT_STATUS VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL CHECK (ACCOUNT_STATUS IN ('ACTIVE', 'SUSPENDED')),
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Security Incident Table
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

-- 4. Initial Seed Users (BCrypt password: admin123 / analyst123)
-- Hash for 'admin123': $2a$10$w09ZlMsq2E1P7pE6b7Z68uHqK3s9W.e5M3hI4qV.2w9k8.nSFehJ4c
INSERT INTO SYSTEM_USERS (USER_ID, USER_NAME, EMAIL, PASSWORD_HASH, ROLE, ACCOUNT_STATUS, CREATED_AT) VALUES
(1001, 'Chief Security Officer', 'admin@veil.sec', '$2a$10$w09ZlMsq2E1P7pE6b7Z68uHqK3s9W.e5M3hI4qV.2w9k8.nSFehJ4c', 'ADMIN', 'ACTIVE', CURRENT_TIMESTAMP),
(1002, 'Elena Vance', 'analyst@veil.sec', '$2a$10$w09ZlMsq2E1P7pE6b7Z68uHqK3s9W.e5M3hI4qV.2w9k8.nSFehJ4c', 'USER', 'ACTIVE', CURRENT_TIMESTAMP),
(1003, 'Marcus Kane', 'officer@veil.sec', '$2a$10$w09ZlMsq2E1P7pE6b7Z68uHqK3s9W.e5M3hI4qV.2w9k8.nSFehJ4c', 'USER', 'ACTIVE', CURRENT_TIMESTAMP);

-- 5. Initial Seed Security Incidents
INSERT INTO SECURITY_INCIDENT (INCIDENT_ID, USER_ID, THREAT, INCIDENT_TYPE, AFFECTED_SYSTEM, DESCRIPTION, SEVERITY, STATUS, REPORTED_AT, UPDATED_AT) VALUES
(5001, 1002, 'Ransomware Stage-2 Dropper in Core SAN', 'Malware', 'Storage Area Network (SAN-01)', 'EDR agents flagged anomalous bulk file encryption attempts targeting volume /mnt/core-datastore. Host quarantined.', 10, 'Open', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5002, 1001, 'Active Distributed SSH Brute Force Campaign', 'Unauthorized Access', 'Edge Bastion (bastion-east-01)', 'Over 14,000 authentication failures from 38 distinct ASNs in 10 minutes targeting root accounts.', 9, 'Open', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5003, 1003, 'Targeted Spear-Phishing Campaign Against Finance Team', 'Phishing', 'Corporate Exchange Mailboxes', 'Sophisticated email masquerading as CFO payroll revision with embedded malicious macro attachment.', 8, 'In Progress', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5004, 1002, 'Volumetric SYN Flood Disrupting Checkout Service', 'Denial of Service', 'API Gateway (Kong Cluster)', 'Peak ingress hit 48 Gbps flooding TCP state tables. Upstream BGP route scrubbing engaged.', 8, 'In Progress', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5005, 1001, 'Cloud Blob Storage Public Read Policy Leak', 'Data Exposure', 'AWS S3 Bucket: audit-archive-prod', 'Misconfigured bucket ACL allowed unauthenticated GET requests. Restricted within 12 minutes.', 7, 'Resolved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5006, 1003, 'Repeated MFA Fatigue Attacks on Domain Controller Admin', 'Suspicious Login Activity', 'Active Directory / Okta SSO', 'User reported 18 push notifications between 02:00 and 03:30 AM local time. Tokens revoked.', 6, 'Resolved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5007, 1002, 'Suspicious DNS Tunneling Anomalies Detected', 'Other', 'Internal Resolvers (bind-dns-02)', 'High frequency TXT record lookups toward base32 subdomains indicative of C2 channel.', 5, 'In Progress', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5008, 1003, 'Vulnerable Log4j Library on Staging Service', 'Other', 'Staging Application Server', 'Static vulnerability scanner discovered log4j-core-2.14.1 in container. Patch scheduled.', 4, 'Open', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5009, 1001, 'Unencrypted Removable Media Policy Violation', 'Policy Violation', 'Workstation WS-ENG-88', 'USB storage device plugged without encryption authorization. DLP intercepted file transfers.', 3, 'Resolved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5010, 1002, 'Internal Port Scan Originating from Dev Workstation', 'Unauthorized Access', 'Lab Subnet VLAN-40', 'Nmap SYN stealth scan sweeps detected across port 445 and 3389.', 2, 'Resolved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
