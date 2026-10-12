package com.veil.servlet;

import com.google.gson.JsonObject;
import com.veil.filter.AuthenticationFilter;
import com.veil.model.Incident;
import com.veil.model.User;
import com.veil.service.IncidentService;
import com.veil.util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.BufferedReader;
import java.io.IOException;
import java.util.List;
import java.util.Optional;

/**
 * RESTful Servlet managing the lifecycle of security incidents.
 */
@WebServlet(urlPatterns = {"/api/incidents", "/api/incidents/*"})
public class IncidentServlet extends HttpServlet {

    private final IncidentService incidentService = new IncidentService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();

        if (pathInfo == null || pathInfo.equals("/")) {
            // List incidents with filters
            String search = req.getParameter("search");
            String status = req.getParameter("status");
            String sortBy = req.getParameter("sortBy");
            String sortOrder = req.getParameter("sortOrder");

            Integer minSev = parseInteger(req.getParameter("minSev"));
            Integer maxSev = parseInteger(req.getParameter("maxSev"));

            try {
                List<Incident> list = incidentService.getAllIncidents(search, status, minSev, maxSev, sortBy, sortOrder);
                JsonUtil.sendSuccess(resp, "Incidents retrieved", list);
            } catch (Exception e) {
                JsonUtil.sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error retrieving incidents: " + e.getMessage());
            }
        } else {
            // Retrieve single incident by ID
            Long id = parseIdFromPath(pathInfo);
            if (id == null) {
                JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid incident ID in URI path.");
                return;
            }

            try {
                Optional<Incident> incident = incidentService.getIncidentById(id);
                if (incident.isPresent()) {
                    JsonUtil.sendSuccess(resp, "Incident details retrieved", incident.get());
                } else {
                    JsonUtil.sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Incident not found: " + id);
                }
            } catch (Exception e) {
                JsonUtil.sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Database error: " + e.getMessage());
            }
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();
        User currentUser = getCurrentUser(req);

        // Check if this is a status update subpath (e.g., /api/incidents/{id}/status)
        if (pathInfo != null && pathInfo.matches("/\\d+/status")) {
            handleStatusUpdate(req, resp, pathInfo, currentUser);
            return;
        }

        // Incident creation
        JsonObject json = readJsonBody(req, resp);
        if (json == null) return;

        try {
            Incident incident = new Incident();
            if (json.has("threat")) incident.setThreat(json.get("threat").getAsString());
            if (json.has("incidentType")) incident.setIncidentType(json.get("incidentType").getAsString());
            if (json.has("affectedSystem")) incident.setAffectedSystem(json.get("affectedSystem").getAsString());
            if (json.has("description")) incident.setDescription(json.get("description").getAsString());
            if (json.has("severity")) incident.setSeverity(json.get("severity").getAsInt());
            if (json.has("status")) incident.setStatus(json.get("status").getAsString());

            Incident created = incidentService.createIncident(incident, currentUser);
            JsonUtil.sendCreated(resp, "Incident recorded successfully with ID #" + created.getIncidentId(), created);

        } catch (IllegalArgumentException | SecurityException e) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to persist incident: " + e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();
        Long id = parseIdFromPath(pathInfo);
        if (id == null) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Incident ID required in URI path.");
            return;
        }

        User currentUser = getCurrentUser(req);
        JsonObject json = readJsonBody(req, resp);
        if (json == null) return;

        try {
            Incident incident = new Incident();
            incident.setIncidentId(id);
            if (json.has("threat")) incident.setThreat(json.get("threat").getAsString());
            if (json.has("incidentType")) incident.setIncidentType(json.get("incidentType").getAsString());
            if (json.has("affectedSystem")) incident.setAffectedSystem(json.get("affectedSystem").getAsString());
            if (json.has("description")) incident.setDescription(json.get("description").getAsString());
            if (json.has("severity")) incident.setSeverity(json.get("severity").getAsInt());
            if (json.has("status")) incident.setStatus(json.get("status").getAsString());

            boolean updated = incidentService.updateIncident(incident, currentUser);
            if (updated) {
                JsonUtil.sendSuccess(resp, "Incident #" + id + " updated successfully", incident);
            } else {
                JsonUtil.sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Incident #" + id + " not found");
            }
        } catch (IllegalArgumentException | SecurityException e) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Update failed: " + e.getMessage());
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String pathInfo = req.getPathInfo();
        Long id = parseIdFromPath(pathInfo);
        if (id == null) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Incident ID required in URI path.");
            return;
        }

        User currentUser = getCurrentUser(req);

        try {
            boolean deleted = incidentService.deleteIncident(id, currentUser);
            if (deleted) {
                JsonUtil.sendSuccess(resp, "Incident #" + id + " deleted successfully", null);
            } else {
                JsonUtil.sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Incident #" + id + " not found");
            }
        } catch (IllegalArgumentException | SecurityException e) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_FORBIDDEN, e.getMessage());
        } catch (Exception e) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Deletion failed: " + e.getMessage());
        }
    }

    private void handleStatusUpdate(HttpServletRequest req, HttpServletResponse resp, String pathInfo, User currentUser) throws IOException {
        String[] parts = pathInfo.split("/");
        Long id = Long.parseLong(parts[1]);

        JsonObject json = readJsonBody(req, resp);
        if (json == null) return;

        if (!json.has("status")) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Missing 'status' parameter.");
            return;
        }

        String status = json.get("status").getAsString();
        try {
            boolean updated = incidentService.updateStatus(id, status, currentUser);
            if (updated) {
                JsonUtil.sendSuccess(resp, "Status updated to " + status + " for Incident #" + id, null);
            } else {
                JsonUtil.sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Incident #" + id + " not found");
            }
        } catch (Exception e) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        }
    }

    private JsonObject readJsonBody(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = req.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }
        try {
            return JsonUtil.fromJson(sb.toString(), JsonObject.class);
        } catch (Exception e) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid JSON payload: " + e.getMessage());
            return null;
        }
    }

    private Long parseIdFromPath(String pathInfo) {
        if (pathInfo == null || pathInfo.length() <= 1) return null;
        try {
            String trimmed = pathInfo.startsWith("/") ? pathInfo.substring(1) : pathInfo;
            if (trimmed.contains("/")) {
                trimmed = trimmed.substring(0, trimmed.indexOf("/"));
            }
            return Long.parseLong(trimmed);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Integer parseInteger(String val) {
        if (val == null || val.trim().isEmpty()) return null;
        try {
            return Integer.parseInt(val.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private User getCurrentUser(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        return (session != null) ? (User) session.getAttribute(AuthenticationFilter.SESSION_USER_KEY) : null;
    }
}
