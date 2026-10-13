package com.veil.servlet;

import com.veil.config.DatabaseConfig;
import com.veil.util.JsonUtil;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Public health check and keep-alive endpoint for cloud monitoring and cron-job pingers.
 */
@WebServlet(urlPatterns = {"/api/health"})
public class HealthServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("database", DatabaseConfig.getActiveEngineName());
        health.put("timestamp", System.currentTimeMillis());
        JsonUtil.sendSuccess(resp, "VEIL system operational", health);
    }
}
