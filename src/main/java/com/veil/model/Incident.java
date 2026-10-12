package com.veil.model;

import java.io.Serializable;
import java.sql.Timestamp;

/**
 * Represents a security incident record with full lifecycle details.
 */
public class Incident implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long incidentId;
    private Long userId;
    private String reporterName;
    private String reporterEmail;
    private String threat;
    private String incidentType;
    private String affectedSystem;
    private String description;
    private int severity;
    private SeverityInfo severityInfo;
    private String status; // 'Open', 'In Progress', 'Resolved'
    private Timestamp reportedAt;
    private Timestamp updatedAt;

    public Incident() {}

    public Long getIncidentId() {
        return incidentId;
    }

    public void setIncidentId(Long incidentId) {
        this.incidentId = incidentId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getReporterName() {
        return reporterName;
    }

    public void setReporterName(String reporterName) {
        this.reporterName = reporterName;
    }

    public String getReporterEmail() {
        return reporterEmail;
    }

    public void setReporterEmail(String reporterEmail) {
        this.reporterEmail = reporterEmail;
    }

    public String getThreat() {
        return threat;
    }

    public void setThreat(String threat) {
        this.threat = threat;
    }

    public String getIncidentType() {
        return incidentType;
    }

    public void setIncidentType(String incidentType) {
        this.incidentType = incidentType;
    }

    public String getAffectedSystem() {
        return affectedSystem;
    }

    public void setAffectedSystem(String affectedSystem) {
        this.affectedSystem = affectedSystem;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getSeverity() {
        return severity;
    }

    public void setSeverity(int severity) {
        this.severity = severity;
        if (severity >= 1 && severity <= 10) {
            this.severityInfo = SeverityInfo.evaluate(severity);
        }
    }

    public SeverityInfo getSeverityInfo() {
        if (severityInfo == null && severity >= 1 && severity <= 10) {
            this.severityInfo = SeverityInfo.evaluate(severity);
        }
        return severityInfo;
    }

    public void setSeverityInfo(SeverityInfo severityInfo) {
        this.severityInfo = severityInfo;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Timestamp getReportedAt() {
        return reportedAt;
    }

    public void setReportedAt(Timestamp reportedAt) {
        this.reportedAt = reportedAt;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }
}
