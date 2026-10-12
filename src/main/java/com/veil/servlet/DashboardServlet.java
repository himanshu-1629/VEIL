package com.veil.servlet;

import com.veil.model.DashboardSummary;
import com.veil.service.IncidentService;
import com.veil.util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Delivers real-time Oracle-backed security metrics and active incident telemetry.
 */
@WebServlet(urlPatterns = {"/api/dashboard/summary"})
public class DashboardServlet extends HttpServlet {

    private final IncidentService incidentService = new IncidentService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        try {
            DashboardSummary summary = incidentService.getDashboardSummary();
            JsonUtil.sendSuccess(resp, "Dashboard metrics loaded", summary);
        } catch (Exception e) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to load dashboard metrics: " + e.getMessage());
        }
    }
}
