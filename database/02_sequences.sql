-- ============================================================================
-- VEIL - Cybersecurity Management System
-- PAT 4 Web Application Development | Database Script 02: Sequences
-- Target: Oracle Database 11g / 12c / 19c / 21c
-- ============================================================================

-- Clean previous sequences if rebuilding
BEGIN
   EXECUTE IMMEDIATE 'DROP SEQUENCE USER_SEQ';
EXCEPTION
   WHEN OTHERS THEN
      IF SQLCODE != -2289 THEN RAISE; END IF;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP SEQUENCE INCIDENT_SEQ';
EXCEPTION
   WHEN OTHERS THEN
      IF SQLCODE != -2289 THEN RAISE; END IF;
END;
/

-- Sequence for SYSTEM_USERS (starts after seed data at 1004)
CREATE SEQUENCE USER_SEQ
    START WITH 1004
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

-- Sequence for SECURITY_INCIDENT (starts after seed data at 5011)
CREATE SEQUENCE INCIDENT_SEQ
    START WITH 5011
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

-- Optional convenience triggers for automated ID generation if omitted in INSERT
CREATE OR REPLACE TRIGGER TRG_USERS_BI
BEFORE INSERT ON SYSTEM_USERS
FOR EACH ROW
BEGIN
    IF :NEW.USER_ID IS NULL THEN
        SELECT USER_SEQ.NEXTVAL INTO :NEW.USER_ID FROM DUAL;
    END IF;
    IF :NEW.CREATED_AT IS NULL THEN
        :NEW.CREATED_AT := SYSDATE;
    END IF;
END;
/

CREATE OR REPLACE TRIGGER TRG_INCIDENT_BI
BEFORE INSERT ON SECURITY_INCIDENT
FOR EACH ROW
BEGIN
    IF :NEW.INCIDENT_ID IS NULL THEN
        SELECT INCIDENT_SEQ.NEXTVAL INTO :NEW.INCIDENT_ID FROM DUAL;
    END IF;
    IF :NEW.REPORTED_AT IS NULL THEN
        :NEW.REPORTED_AT := SYSDATE;
    END IF;
    IF :NEW.UPDATED_AT IS NULL THEN
        :NEW.UPDATED_AT := SYSDATE;
    END IF;
END;
/
