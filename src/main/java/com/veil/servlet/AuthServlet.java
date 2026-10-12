package com.veil.servlet;

import com.google.gson.JsonObject;
import com.veil.filter.AuthenticationFilter;
import com.veil.model.User;
import com.veil.service.AuthService;
import com.veil.util.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.BufferedReader;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Handles authentication operations: login, logout, and current session inspection.
 */
@WebServlet(urlPatterns = {"/api/auth/login", "/api/auth/logout", "/api/auth/me"})
public class AuthServlet extends HttpServlet {

    private final AuthService authService = new AuthService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String path = req.getServletPath();
        if ("/api/auth/me".equals(path)) {
            handleMe(req, resp);
        } else {
            JsonUtil.sendError(resp, HttpServletResponse.SC_METHOD_NOT_ALLOWED, "Method Not Allowed");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String path = req.getServletPath();
        if ("/api/auth/login".equals(path)) {
            handleLogin(req, resp);
        } else if ("/api/auth/logout".equals(path)) {
            handleLogout(req, resp);
        } else {
            JsonUtil.sendError(resp, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
        }
    }

    private void handleLogin(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String email = null;
        String password = null;

        // Support both JSON body and application/x-www-form-urlencoded
        String contentType = req.getContentType();
        if (contentType != null && contentType.contains("application/json")) {
            StringBuilder sb = new StringBuilder();
            try (BufferedReader reader = req.getReader()) {
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
            }
            try {
                JsonObject json = JsonUtil.fromJson(sb.toString(), JsonObject.class);
                if (json != null) {
                    if (json.has("email")) email = json.get("email").getAsString();
                    if (json.has("password")) password = json.get("password").getAsString();
                }
            } catch (Exception e) {
                JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Malformed JSON request body.");
                return;
            }
        } else {
            email = req.getParameter("email");
            password = req.getParameter("password");
        }

        try {
            User authenticatedUser = authService.authenticate(email, password);

            // Invalidate existing session to prevent session fixation, then create fresh session
            HttpSession oldSession = req.getSession(false);
            if (oldSession != null) {
                oldSession.invalidate();
            }

            HttpSession session = req.getSession(true);
            session.setMaxInactiveInterval(30 * 60); // 30 minutes
            session.setAttribute(AuthenticationFilter.SESSION_USER_KEY, authenticatedUser);

            String csrfToken = UUID.randomUUID().toString();
            session.setAttribute(AuthenticationFilter.CSRF_TOKEN_KEY, csrfToken);

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("userId", authenticatedUser.getUserId());
            responseData.put("userName", authenticatedUser.getUserName());
            responseData.put("email", authenticatedUser.getEmail());
            responseData.put("role", authenticatedUser.getRole());
            responseData.put("csrfToken", csrfToken);

            JsonUtil.sendSuccess(resp, "Authentication successful. Welcome to VEIL.", responseData);

        } catch (AuthService.AuthenticationException e) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_UNAUTHORIZED, e.getMessage());
        } catch (Exception e) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Authentication service error: " + e.getMessage());
        }
    }

    private void handleLogout(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        HttpSession session = req.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        JsonUtil.sendSuccess(resp, "Session ended. You have been safely logged out.", null);
    }

    private void handleMe(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        HttpSession session = req.getSession(false);
        if (session == null || session.getAttribute(AuthenticationFilter.SESSION_USER_KEY) == null) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Unauthenticated");
            return;
        }

        User user = (User) session.getAttribute(AuthenticationFilter.SESSION_USER_KEY);
        String csrfToken = (String) session.getAttribute(AuthenticationFilter.CSRF_TOKEN_KEY);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("userId", user.getUserId());
        responseData.put("userName", user.getUserName());
        responseData.put("email", user.getEmail());
        responseData.put("role", user.getRole());
        responseData.put("csrfToken", csrfToken);

        JsonUtil.sendSuccess(resp, "Active session verified", responseData);
    }
}
