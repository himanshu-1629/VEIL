package com.veil.model;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * Encapsulates live database-backed metrics for the VEIL Security Dashboard.
 */
public class DashboardSummary implements Serializable {
    private static final long serialVersionUID = 1L;

    private int totalIncidents;
    private int openIncidents;
    private int inProgressIncidents;
    private int resolvedIncidents;
    private int highSeverityIncidents;
    private int criticalIncidents;
    private String databaseEngine;

    private Incident featuredIncident;
    private Map<String, Integer> severityDistribution;
    private Map<String, Integer> statusDistribution;
    private List<Incident> recentIncidents;
    private String operationalPosture;
    private String connectionError;
    private String targetUrl;

    public DashboardSummary() {}

    public int getTotalIncidents() {
        return totalIncidents;
    }

    public void setTotalIncidents(int totalIncidents) {
        this.totalIncidents = totalIncidents;
    }

    public int getOpenIncidents() {
        return openIncidents;
    }

    public void setOpenIncidents(int openIncidents) {
        this.openIncidents = openIncidents;
    }

    public int getInProgressIncidents() {
        return inProgressIncidents;
    }

    public void setInProgressIncidents(int inProgressIncidents) {
        this.inProgressIncidents = inProgressIncidents;
    }

    public int getResolvedIncidents() {
        return resolvedIncidents;
    }

    public void setResolvedIncidents(int resolvedIncidents) {
        this.resolvedIncidents = resolvedIncidents;
    }

    public int getHighSeverityIncidents() {
        return highSeverityIncidents;
    }

    public void setHighSeverityIncidents(int highSeverityIncidents) {
        this.highSeverityIncidents = highSeverityIncidents;
    }

    public int getCriticalIncidents() {
        return criticalIncidents;
    }

    public void setCriticalIncidents(int criticalIncidents) {
        this.criticalIncidents = criticalIncidents;
    }

    public String getDatabaseEngine() {
        return databaseEngine;
    }

    public void setDatabaseEngine(String databaseEngine) {
        this.databaseEngine = databaseEngine;
    }

    public Incident getFeaturedIncident() {
        return featuredIncident;
    }

    public void setFeaturedIncident(Incident featuredIncident) {
        this.featuredIncident = featuredIncident;
    }

    public Map<String, Integer> getSeverityDistribution() {
        return severityDistribution;
    }

    public void setSeverityDistribution(Map<String, Integer> severityDistribution) {
        this.severityDistribution = severityDistribution;
    }

    public Map<String, Integer> getStatusDistribution() {
        return statusDistribution;
    }

    public void setStatusDistribution(Map<String, Integer> statusDistribution) {
        this.statusDistribution = statusDistribution;
    }

    public List<Incident> getRecentIncidents() {
        return recentIncidents;
    }

    public void setRecentIncidents(List<Incident> recentIncidents) {
        this.recentIncidents = recentIncidents;
    }

    public String getOperationalPosture() {
        return operationalPosture;
    }

    public void setOperationalPosture(String operationalPosture) {
        this.operationalPosture = operationalPosture;
    }

    public String getConnectionError() {
        return connectionError;
    }

    public void setConnectionError(String connectionError) {
        this.connectionError = connectionError;
    }

    public String getTargetUrl() {
        return targetUrl;
    }

    public void setTargetUrl(String targetUrl) {
        this.targetUrl = targetUrl;
    }
}
