package com.veil.service;

import com.veil.dao.IncidentDao;
import com.veil.model.DashboardSummary;
import com.veil.model.Incident;
import com.veil.model.User;
import com.veil.util.ValidationUtil;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

/**
 * Service managing cybersecurity incident creation, search, status transitions, and metrics.
 */
public class IncidentService {

    private final IncidentDao incidentDao;

    public IncidentService() {
        this.incidentDao = new IncidentDao();
    }

    public IncidentService(IncidentDao incidentDao) {
        this.incidentDao = incidentDao;
    }

    public Incident createIncident(Incident incident, User currentUser) throws SQLException {
        if (currentUser == null) {
            throw new SecurityException("User session required to file an incident.");
        }

        ValidationUtil.validateIncident(
                incident.getThreat(),
                incident.getIncidentType(),
                incident.getAffectedSystem(),
                incident.getDescription(),
                incident.getSeverity(),
                incident.getStatus()
        );

        incident.setUserId(currentUser.getUserId());
        if (incident.getStatus() == null || incident.getStatus().trim().isEmpty()) {
            incident.setStatus("Open");
        }

        return incidentDao.createIncident(incident);
    }

    public Optional<Incident> getIncidentById(Long id) throws SQLException {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Invalid incident ID.");
        }
        return incidentDao.findById(id);
    }

    public List<Incident> getAllIncidents(String search, String status, Integer minSev, Integer maxSev, String sortBy, String sortOrder) throws SQLException {
        return incidentDao.findAll(search, status, minSev, maxSev, sortBy, sortOrder);
    }

    public boolean updateIncident(Incident incident, User currentUser) throws SQLException {
        if (currentUser == null) {
            throw new SecurityException("Authentication required.");
        }

        ValidationUtil.validateIncident(
                incident.getThreat(),
                incident.getIncidentType(),
                incident.getAffectedSystem(),
                incident.getDescription(),
                incident.getSeverity(),
                incident.getStatus()
        );

        Optional<Incident> existing = incidentDao.findById(incident.getIncidentId());
        if (!existing.isPresent()) {
            throw new IllegalArgumentException("Incident not found: " + incident.getIncidentId());
        }

        // Authorization check: Admin or the original reporter can edit
        if (!currentUser.isAdmin() && !currentUser.getUserId().equals(existing.get().getUserId())) {
            throw new SecurityException("You do not have permission to modify this incident record.");
        }

        return incidentDao.updateIncident(incident);
    }

    public boolean updateStatus(Long incidentId, String status, User currentUser) throws SQLException {
        if (currentUser == null) {
            throw new SecurityException("Authentication required.");
        }
        if (status == null || (!status.equals("Open") && !status.equals("In Progress") && !status.equals("Resolved"))) {
            throw new IllegalArgumentException("Invalid status: must be Open, In Progress, or Resolved.");
        }

        Optional<Incident> existing = incidentDao.findById(incidentId);
        if (!existing.isPresent()) {
            throw new IllegalArgumentException("Incident not found: " + incidentId);
        }

        // Authorization check: Only Admin or the original reporter can change status
        if (!currentUser.isAdmin() && !currentUser.getUserId().equals(existing.get().getUserId())) {
            throw new SecurityException("You do not have permission to modify the status of this incident record.");
        }

        return incidentDao.updateStatus(incidentId, status);
    }

    public boolean deleteIncident(Long incidentId, User currentUser) throws SQLException {
        if (currentUser == null) {
            throw new SecurityException("Authentication required.");
        }

        Optional<Incident> existing = incidentDao.findById(incidentId);
        if (!existing.isPresent()) {
            throw new IllegalArgumentException("Incident not found: " + incidentId);
        }

        // Only ADMIN or the original reporter may delete
        if (!currentUser.isAdmin() && !currentUser.getUserId().equals(existing.get().getUserId())) {
            throw new SecurityException("Only administrators or the original reporter can delete an incident.");
        }

        return incidentDao.deleteIncident(incidentId);
    }

    public DashboardSummary getDashboardSummary() throws SQLException {
        return incidentDao.getDashboardSummary();
    }
}
