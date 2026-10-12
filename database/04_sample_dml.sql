-- ============================================================================
-- VEIL - Cybersecurity Management System
-- PAT 4 Web Application Development | Database Script 04: Sample DML Operations
-- Target: Oracle Database 11g / 12c / 19c / 21c
-- ============================================================================

-- ============================================================================
-- 1. AGGREGATE DASHBOARD QUERIES
-- Used by /api/dashboard/summary to deliver real-time operational posture.
-- ============================================================================

-- Metrics summary: total, open, in-progress, resolved, high (7-8), critical (9-10)
SELECT 
    COUNT(*) AS TOTAL_INCIDENTS,
    COUNT(CASE WHEN STATUS = 'Open' THEN 1 END) AS OPEN_INCIDENTS,
    COUNT(CASE WHEN STATUS = 'In Progress' THEN 1 END) AS IN_PROGRESS_INCIDENTS,
    COUNT(CASE WHEN STATUS = 'Resolved' THEN 1 END) AS RESOLVED_INCIDENTS,
    COUNT(CASE WHEN SEVERITY BETWEEN 7 AND 8 THEN 1 END) AS HIGH_SEVERITY_INCIDENTS,
    COUNT(CASE WHEN SEVERITY BETWEEN 9 AND 10 THEN 1 END) AS CRITICAL_INCIDENTS
FROM SECURITY_INCIDENT;

-- Highest priority unresolved incident (Featured Incident on Dashboard)
-- Priority Rule: Highest Severity DESC, oldest unresolved reported date ASC
SELECT *
FROM (
    SELECT 
        i.INCIDENT_ID,
        i.THREAT,
        i.INCIDENT_TYPE,
        i.AFFECTED_SYSTEM,
        i.SEVERITY,
        i.STATUS,
        i.REPORTED_AT,
        u.USER_NAME AS REPORTER_NAME
    FROM SECURITY_INCIDENT i
    JOIN SYSTEM_USERS u ON i.USER_ID = u.USER_ID
    WHERE i.STATUS IN ('Open', 'In Progress')
    ORDER BY i.SEVERITY DESC, i.REPORTED_AT ASC
)
WHERE ROWNUM = 1;

-- Severity distribution (Rule-based groups: Low 1-3, Medium 4-6, High 7-8, Critical 9-10)
SELECT 
    CASE 
        WHEN SEVERITY BETWEEN 1 AND 3 THEN 'Low'
        WHEN SEVERITY BETWEEN 4 AND 6 THEN 'Medium'
        WHEN SEVERITY BETWEEN 7 AND 8 THEN 'High'
        WHEN SEVERITY BETWEEN 9 AND 10 THEN 'Critical'
    END AS SEVERITY_GROUP,
    COUNT(*) AS INCIDENT_COUNT
FROM SECURITY_INCIDENT
GROUP BY 
    CASE 
        WHEN SEVERITY BETWEEN 1 AND 3 THEN 'Low'
        WHEN SEVERITY BETWEEN 4 AND 6 THEN 'Medium'
        WHEN SEVERITY BETWEEN 7 AND 8 THEN 'High'
        WHEN SEVERITY BETWEEN 9 AND 10 THEN 'Critical'
    END
ORDER BY 
    MIN(SEVERITY) DESC;

-- Status distribution
SELECT STATUS, COUNT(*) AS STATUS_COUNT
FROM SECURITY_INCIDENT
GROUP BY STATUS
ORDER BY 
    CASE STATUS
        WHEN 'Open' THEN 1
        WHEN 'In Progress' THEN 2
        WHEN 'Resolved' THEN 3
        ELSE 4
    END;

-- ============================================================================
-- 2. INCIDENT REGISTER RETRIEVAL & FILTERING
-- Dynamic filters applied with parameterized JDBC statements.
-- ============================================================================

-- Search incidents with text filter, severity range, and status filter
SELECT 
    i.INCIDENT_ID,
    i.USER_ID,
    u.USER_NAME AS REPORTER_NAME,
    u.EMAIL AS REPORTER_EMAIL,
    i.THREAT,
    i.INCIDENT_TYPE,
    i.AFFECTED_SYSTEM,
    i.DESCRIPTION,
    i.SEVERITY,
    i.STATUS,
    i.REPORTED_AT,
    i.UPDATED_AT
FROM SECURITY_INCIDENT i
JOIN SYSTEM_USERS u ON i.USER_ID = u.USER_ID
WHERE 1 = 1
  AND (LOWER(i.THREAT) LIKE LOWER('%SSH%') OR LOWER(i.AFFECTED_SYSTEM) LIKE LOWER('%SSH%'))
  AND i.STATUS = 'Open'
  AND i.SEVERITY >= 7
ORDER BY i.SEVERITY DESC, i.REPORTED_AT DESC;

-- ============================================================================
-- 3. INSERT NEW INCIDENT
-- Explicit sequence usage for Oracle 11g compatibility
-- ============================================================================
INSERT INTO SECURITY_INCIDENT (
    INCIDENT_ID, USER_ID, THREAT, INCIDENT_TYPE, AFFECTED_SYSTEM, DESCRIPTION, SEVERITY, STATUS, REPORTED_AT, UPDATED_AT
) VALUES (
    INCIDENT_SEQ.NEXTVAL,
    1002,
    'Unusual Outbound TLS Traffic on Port 8443',
    'Suspicious Login Activity',
    'Database Node 02',
    'Periodic 2MB encrypted payload dumps observed every 15 minutes to external VPS IP 198.51.100.23.',
    7,
    'Open',
    SYSDATE,
    SYSDATE
);
COMMIT;

-- ============================================================================
-- 4. UPDATE INCIDENT STATUS & SEVERITY
-- ============================================================================
UPDATE SECURITY_INCIDENT
SET STATUS = 'In Progress',
    UPDATED_AT = SYSDATE
WHERE INCIDENT_ID = 5001;
COMMIT;

UPDATE SECURITY_INCIDENT
SET STATUS = 'Resolved',
    DESCRIPTION = DESCRIPTION || ' [Resolution: Root cause patched and credentials revoked]',
    UPDATED_AT = SYSDATE
WHERE INCIDENT_ID = 5002;
COMMIT;

-- ============================================================================
-- 5. USER MANAGEMENT DML (Admin Operations)
-- ============================================================================
-- Create new user account
INSERT INTO SYSTEM_USERS (USER_ID, USER_NAME, EMAIL, PASSWORD_HASH, ROLE, ACCOUNT_STATUS, CREATED_AT)
VALUES (
    USER_SEQ.NEXTVAL,
    'Sarah Chen',
    'schen@veil.sec',
    '$2a$10$e88yUf.2lA6f0Uf7pZ9n0.vjH8D4s8h4q4a1y1c7pZ9n0.vjH8D4s',
    'USER',
    'ACTIVE',
    SYSDATE
);
COMMIT;

-- Update user role or status
UPDATE SYSTEM_USERS
SET ROLE = 'ADMIN',
    ACCOUNT_STATUS = 'ACTIVE'
WHERE USER_ID = 1002;
COMMIT;

-- Safe check before deletion
DELETE FROM SYSTEM_USERS
WHERE USER_ID = 1003
  AND NOT EXISTS (SELECT 1 FROM SECURITY_INCIDENT WHERE USER_ID = 1003);
-- If incidents exist, cascade delete or reassign is enforced by policy
