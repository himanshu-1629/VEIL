package com.veil.dao;

import com.veil.config.DatabaseConfig;
import com.veil.model.DashboardSummary;
import com.veil.model.Incident;

import java.sql.*;
import java.util.*;

/**
 * Data Access Object for SECURITY_INCIDENT using prepared JDBC statements.
 */
public class IncidentDao {

    public Incident createIncident(Incident incident) throws SQLException {
        String seqSql = "SELECT INCIDENT_SEQ.NEXTVAL FROM DUAL";
        long newId;

        try (Connection conn = DatabaseConfig.getConnection()) {
            conn.setAutoCommit(false);
            try {
                try (PreparedStatement seqPs = conn.prepareStatement(seqSql);
                     ResultSet seqRs = seqPs.executeQuery()) {
                    if (seqRs.next()) {
                        newId = seqRs.getLong(1);
                    } else {
                        newId = System.currentTimeMillis();
                    }
                }

                String insertSql = "INSERT INTO SECURITY_INCIDENT (" +
                        "INCIDENT_ID, USER_ID, THREAT, INCIDENT_TYPE, AFFECTED_SYSTEM, DESCRIPTION, SEVERITY, STATUS, REPORTED_AT, UPDATED_AT" +
                        ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";

                try (PreparedStatement ps = conn.prepareStatement(insertSql)) {
                    ps.setLong(1, newId);
                    ps.setLong(2, incident.getUserId());
                    ps.setString(3, incident.getThreat().trim());
                    ps.setString(4, incident.getIncidentType().trim());
                    ps.setString(5, incident.getAffectedSystem().trim());
                    ps.setString(6, incident.getDescription().trim());
                    ps.setInt(7, incident.getSeverity());
                    ps.setString(8, incident.getStatus() != null ? incident.getStatus().trim() : "Open");
                    ps.executeUpdate();
                }

                conn.commit();
                incident.setIncidentId(newId);
                incident.setReportedAt(new Timestamp(System.currentTimeMillis()));
                incident.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
                return incident;
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            } finally {
                conn.setAutoCommit(true);
            }
        }
    }

    public Optional<Incident> findById(Long incidentId) throws SQLException {
        String sql = "SELECT i.INCIDENT_ID, i.USER_ID, u.USER_NAME, u.EMAIL, i.THREAT, i.INCIDENT_TYPE, " +
                     "i.AFFECTED_SYSTEM, i.DESCRIPTION, i.SEVERITY, i.STATUS, i.REPORTED_AT, i.UPDATED_AT " +
                     "FROM SECURITY_INCIDENT i " +
                     "LEFT JOIN SYSTEM_USERS u ON i.USER_ID = u.USER_ID " +
                     "WHERE i.INCIDENT_ID = ?";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, incidentId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRow(rs));
                }
            }
        }
        return Optional.empty();
    }

    public List<Incident> findAll(String search, String status, Integer minSev, Integer maxSev, String sortBy, String sortOrder) throws SQLException {
        List<Incident> list = new ArrayList<>();
        StringBuilder sql = new StringBuilder(
                "SELECT i.INCIDENT_ID, i.USER_ID, u.USER_NAME, u.EMAIL, i.THREAT, i.INCIDENT_TYPE, " +
                "i.AFFECTED_SYSTEM, i.DESCRIPTION, i.SEVERITY, i.STATUS, i.REPORTED_AT, i.UPDATED_AT " +
                "FROM SECURITY_INCIDENT i " +
                "LEFT JOIN SYSTEM_USERS u ON i.USER_ID = u.USER_ID " +
                "WHERE 1=1 "
        );

        List<Object> params = new ArrayList<>();

        if (search != null && !search.trim().isEmpty()) {
            String likePattern = "%" + search.trim().toLowerCase() + "%";
            sql.append("AND (LOWER(i.THREAT) LIKE ? OR LOWER(i.AFFECTED_SYSTEM) LIKE ? OR LOWER(u.USER_NAME) LIKE ? OR LOWER(i.INCIDENT_TYPE) LIKE ?) ");
            params.add(likePattern);
            params.add(likePattern);
            params.add(likePattern);
            params.add(likePattern);
        }

        if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
            sql.append("AND i.STATUS = ? ");
            params.add(status.trim());
        }

        if (minSev != null && minSev > 0) {
            sql.append("AND i.SEVERITY >= ? ");
            params.add(minSev);
        }

        if (maxSev != null && maxSev > 0) {
            sql.append("AND i.SEVERITY <= ? ");
            params.add(maxSev);
        }

        // Safe sort mapping to avoid SQL injection
        String orderColumn = "i.REPORTED_AT";
        if ("severity".equalsIgnoreCase(sortBy)) {
            orderColumn = "i.SEVERITY";
        } else if ("threat".equalsIgnoreCase(sortBy)) {
            orderColumn = "i.THREAT";
        } else if ("status".equalsIgnoreCase(sortBy)) {
            orderColumn = "i.STATUS";
        } else if ("id".equalsIgnoreCase(sortBy)) {
            orderColumn = "i.INCIDENT_ID";
        }

        String direction = "DESC";
        if ("ASC".equalsIgnoreCase(sortOrder)) {
            direction = "ASC";
        }

        sql.append("ORDER BY ").append(orderColumn).append(" ").append(direction);

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) {
                Object p = params.get(i);
                if (p instanceof String) {
                    ps.setString(i + 1, (String) p);
                } else if (p instanceof Integer) {
                    ps.setInt(i + 1, (Integer) p);
                } else if (p instanceof Long) {
                    ps.setLong(i + 1, (Long) p);
                }
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRow(rs));
                }
            }
        }
        return list;
    }

    public boolean updateIncident(Incident incident) throws SQLException {
        String sql = "UPDATE SECURITY_INCIDENT SET " +
                     "THREAT = ?, INCIDENT_TYPE = ?, AFFECTED_SYSTEM = ?, DESCRIPTION = ?, " +
                     "SEVERITY = ?, STATUS = ?, UPDATED_AT = CURRENT_TIMESTAMP " +
                     "WHERE INCIDENT_ID = ?";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, incident.getThreat().trim());
            ps.setString(2, incident.getIncidentType().trim());
            ps.setString(3, incident.getAffectedSystem().trim());
            ps.setString(4, incident.getDescription().trim());
            ps.setInt(5, incident.getSeverity());
            ps.setString(6, incident.getStatus().trim());
            ps.setLong(7, incident.getIncidentId());
            return ps.executeUpdate() > 0;
        }
    }

    public boolean updateStatus(Long incidentId, String status) throws SQLException {
        String sql = "UPDATE SECURITY_INCIDENT SET STATUS = ?, UPDATED_AT = CURRENT_TIMESTAMP WHERE INCIDENT_ID = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status.trim());
            ps.setLong(2, incidentId);
            return ps.executeUpdate() > 0;
        }
    }

    public boolean deleteIncident(Long incidentId) throws SQLException {
        String sql = "DELETE FROM SECURITY_INCIDENT WHERE INCIDENT_ID = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, incidentId);
            return ps.executeUpdate() > 0;
        }
    }

    public DashboardSummary getDashboardSummary() throws SQLException {
        DashboardSummary summary = new DashboardSummary();
        summary.setDatabaseEngine(DatabaseConfig.getActiveEngineName());

        // 1. Overall counts
        String countsSql = "SELECT " +
                "COUNT(*) AS TOTAL, " +
                "COUNT(CASE WHEN STATUS = 'Open' THEN 1 END) AS OPEN_CNT, " +
                "COUNT(CASE WHEN STATUS = 'In Progress' THEN 1 END) AS IN_PROG_CNT, " +
                "COUNT(CASE WHEN STATUS = 'Resolved' THEN 1 END) AS RESOLVED_CNT, " +
                "COUNT(CASE WHEN SEVERITY BETWEEN 7 AND 8 THEN 1 END) AS HIGH_CNT, " +
                "COUNT(CASE WHEN SEVERITY BETWEEN 9 AND 10 THEN 1 END) AS CRITICAL_CNT " +
                "FROM SECURITY_INCIDENT";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(countsSql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                summary.setTotalIncidents(rs.getInt("TOTAL"));
                summary.setOpenIncidents(rs.getInt("OPEN_CNT"));
                summary.setInProgressIncidents(rs.getInt("IN_PROG_CNT"));
                summary.setResolvedIncidents(rs.getInt("RESOLVED_CNT"));
                summary.setHighSeverityIncidents(rs.getInt("HIGH_CNT"));
                summary.setCriticalIncidents(rs.getInt("CRITICAL_CNT"));
            }
        }

        // 2. Featured highest-priority unresolved incident
        String featuredSql = "SELECT i.INCIDENT_ID, i.USER_ID, u.USER_NAME, u.EMAIL, i.THREAT, i.INCIDENT_TYPE, " +
                "i.AFFECTED_SYSTEM, i.DESCRIPTION, i.SEVERITY, i.STATUS, i.REPORTED_AT, i.UPDATED_AT " +
                "FROM SECURITY_INCIDENT i " +
                "LEFT JOIN SYSTEM_USERS u ON i.USER_ID = u.USER_ID " +
                "WHERE i.STATUS IN ('Open', 'In Progress') " +
                "ORDER BY i.SEVERITY DESC, i.REPORTED_AT ASC";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(featuredSql)) {
            ps.setMaxRows(1);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    summary.setFeaturedIncident(mapRow(rs));
                }
            }
        }

        // 3. Severity Distribution
        Map<String, Integer> sevDist = new LinkedHashMap<>();
        sevDist.put("Low (1-3)", 0);
        sevDist.put("Medium (4-6)", 0);
        sevDist.put("High (7-8)", 0);
        sevDist.put("Critical (9-10)", 0);

        String sevDistSql = "SELECT " +
                "CASE " +
                "  WHEN SEVERITY BETWEEN 1 AND 3 THEN 'Low (1-3)' " +
                "  WHEN SEVERITY BETWEEN 4 AND 6 THEN 'Medium (4-6)' " +
                "  WHEN SEVERITY BETWEEN 7 AND 8 THEN 'High (7-8)' " +
                "  WHEN SEVERITY BETWEEN 9 AND 10 THEN 'Critical (9-10)' " +
                "END AS SEV_CAT, COUNT(*) AS CNT " +
                "FROM SECURITY_INCIDENT " +
                "GROUP BY CASE " +
                "  WHEN SEVERITY BETWEEN 1 AND 3 THEN 'Low (1-3)' " +
                "  WHEN SEVERITY BETWEEN 4 AND 6 THEN 'Medium (4-6)' " +
                "  WHEN SEVERITY BETWEEN 7 AND 8 THEN 'High (7-8)' " +
                "  WHEN SEVERITY BETWEEN 9 AND 10 THEN 'Critical (9-10)' " +
                "END";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sevDistSql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                String cat = rs.getString("SEV_CAT");
                if (cat != null) {
                    sevDist.put(cat, rs.getInt("CNT"));
                }
            }
        }
        summary.setSeverityDistribution(sevDist);

        // 4. Status Distribution
        Map<String, Integer> statusDist = new LinkedHashMap<>();
        statusDist.put("Open", summary.getOpenIncidents());
        statusDist.put("In Progress", summary.getInProgressIncidents());
        statusDist.put("Resolved", summary.getResolvedIncidents());
        summary.setStatusDistribution(statusDist);

        // 5. Recent 5 incidents
        summary.setRecentIncidents(findAll(null, null, null, null, "date", "DESC"));
        if (summary.getRecentIncidents().size() > 5) {
            summary.setRecentIncidents(summary.getRecentIncidents().subList(0, 5));
        }

        // 6. Operational Posture Narrative
        int unresolved = summary.getOpenIncidents() + summary.getInProgressIncidents();
        if (summary.getCriticalIncidents() > 0) {
            summary.setOperationalPosture("Elevated Risk: " + summary.getCriticalIncidents() + " critical threat vector(s) active. Immediate response advised.");
        } else if (unresolved > 5) {
            summary.setOperationalPosture("Moderate Workload: " + unresolved + " open items pending analyst evaluation.");
        } else {
            summary.setOperationalPosture("Stable: Threat posture under controlled containment and monitoring.");
        }

        return summary;
    }

    private Incident mapRow(ResultSet rs) throws SQLException {
        Incident i = new Incident();
        i.setIncidentId(rs.getLong("INCIDENT_ID"));
        i.setUserId(rs.getLong("USER_ID"));
        i.setReporterName(rs.getString("USER_NAME"));
        i.setReporterEmail(rs.getString("EMAIL"));
        i.setThreat(rs.getString("THREAT"));
        i.setIncidentType(rs.getString("INCIDENT_TYPE"));
        i.setAffectedSystem(rs.getString("AFFECTED_SYSTEM"));
        i.setDescription(rs.getString("DESCRIPTION"));
        i.setSeverity(rs.getInt("SEVERITY"));
        i.setStatus(rs.getString("STATUS"));
        i.setReportedAt(rs.getTimestamp("REPORTED_AT"));
        i.setUpdatedAt(rs.getTimestamp("UPDATED_AT"));
        return i;
    }
}
