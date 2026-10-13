# ==============================================================================
# VEIL - Multi-Stage Production Dockerfile (PAT 4 University Defense)
# ==============================================================================
# Multi-stage Dockerfile:
# Stage 1 builds the war using Maven 3.8 and Java 11.
# Stage 2 deploys the war to Apache Tomcat 9 (JRE 11).
# Compatible with Docker, Render, Railway, Fly.io, and AWS.
# ==============================================================================

# --- Stage 1: Build Application ---
FROM maven:3.8.8-eclipse-temurin-11 AS builder
WORKDIR /app

# Cache Maven dependencies layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Compile and package WAR
COPY src ./src
RUN mvn clean package -DskipTests

# --- Stage 2: Production Tomcat Runtime ---
FROM tomcat:9.0-jre11-temurin
WORKDIR /usr/local/tomcat

# Clean default webapps
RUN rm -rf webapps/*

# Deploy VEIL as ROOT webapp (accessible directly at /)
COPY --from=builder /app/target/veil.war webapps/ROOT.war

# Default HTTP port
EXPOSE 8080

# Environment variables for zero-hardcoding database connection
ENV VEIL_DB_DRIVER="oracle.jdbc.OracleDriver"
ENV VEIL_DB_URL=""
ENV VEIL_DB_USER=""
ENV VEIL_DB_PASSWORD=""

# Support dynamic cloud port binding (Render/Railway/Heroku injects $PORT)
CMD ["sh", "-c", "if [ -n \"$PORT\" ]; then sed -i \"s/port=\\\"8080\\\"/port=\\\"$PORT\\\"/g\" conf/server.xml; fi && catalina.sh run"]
