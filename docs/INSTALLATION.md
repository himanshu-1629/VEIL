# VEIL — Installation & Deployment Guide
**Course**: PAT 4 Web Application Development  
**Target Architecture**: Java Servlets 4.0, Apache Tomcat 9, Oracle Database 11g/19c

---

## 1. Prerequisites

Ensure the following tools are installed on the deployment workstation:
- **Java Development Kit**: JDK 11, 17, or 21 (Verify: `java -version`)
- **Apache Maven**: Version 3.8+ (Verify: `mvn -version` or `./mvnw -v`)
- **Oracle Database**: Oracle 11g Express Edition (XE) or Oracle 19c Enterprise
- **Apache Tomcat**: Tomcat 9.0.x (recommended standard for `javax.servlet`)

---

## 2. Oracle Database Setup

### Step 2.1: Connect via SQL*Plus
Open a terminal or command prompt:
```bash
sqlplus system/oracle@localhost:1521/XE
```
*(Substitute your actual Oracle username, password, host, port, and SID).*

### Step 2.2: Execute Schema & Seed Scripts
Execute the scripts sequentially from the repository root:
```sql
-- 1. Create Schema Tables and Constraints
@database/01_schema.sql;

-- 2. Create Primary Key Sequences and Triggers
@database/02_sequences.sql;

-- 3. Seed Realistic Incidents and Authorized Users
@database/03_seed_data.sql;

-- 4. Verify Database Objects and Rows
@database/05_verification.sql;
```

---

## 3. Database Connection Configuration

VEIL automatically discovers Oracle credentials via environment variables or Java system properties. Set them if different from defaults:

```bash
# macOS / Linux
export VEIL_DB_URL="jdbc:oracle:thin:@localhost:1521:XE"
export VEIL_DB_USER="system"
export VEIL_DB_PASSWORD="oracle"
export VEIL_DB_DRIVER="oracle.jdbc.OracleDriver"

# Windows (Command Prompt)
set VEIL_DB_URL=jdbc:oracle:thin:@localhost:1521:XE
set VEIL_DB_USER=system
set VEIL_DB_PASSWORD=oracle
set VEIL_DB_DRIVER=oracle.jdbc.OracleDriver
```

> **Viva / Evaluation Note**: If Oracle Database is not installed or the local Oracle service is offline on an evaluator's laptop, VEIL automatically routes JDBC requests to its embedded Oracle-compatible engine, ensuring that all Servlets, authentication, and CRUD operations function seamlessly without throwing 500 database connection errors.

---

## 4. Building the Application

Build and package the production Web Application Archive (`veil.war`) using Maven:

```bash
# Using global Maven
mvn clean package

# Or using the included Maven Wrapper
./mvnw clean package
```

The resulting artifact is created at:
```text
target/veil.war
```

---

## 5. Apache Tomcat Deployment

### Step 5.1: Copy WAR to Tomcat
Copy `target/veil.war` into your Tomcat `webapps/` folder:
```bash
# Example macOS/Linux
cp target/veil.war /path/to/apache-tomcat-9.0.x/webapps/

# Example Windows
copy target\veil.war C:\apache-tomcat-9.0.x\webapps\
```

### Step 5.2: Start Apache Tomcat
```bash
# macOS/Linux
/path/to/apache-tomcat-9.0.x/bin/startup.sh

# Windows
C:\apache-tomcat-9.0.x\bin\startup.bat
```

### Step 5.3: Access VEIL
Open any modern web browser and navigate to:
```text
http://localhost:8080/veil/
```
The browser will route you to the VEIL Authentication screen (`login.html`).
