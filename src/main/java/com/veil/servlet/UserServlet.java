package com.veil.servlet;

import com.google.gson.JsonObject;
import com.veil.filter.AuthenticationFilter;
import com.veil.model.User;
import com.veil.service.UserService;
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
 * RESTful Servlet for administrator-only user management and provisioning.
 */
@WebServlet(urlPatterns = {"/api/users", "/api/users/*"})
public class UserServlet extends HttpServlet {

    private final UserService userService = new UserService();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        User currentUser = getCurrentUser(req);
        String pathInfo = req.getPathInfo();

        try {
            if (pathInfo == null || pathInfo.equals("/")) {
                List<User> users = userService.getAllUsers(currentUser);
                // Mask password hashes
                users.forEach(u -> u.setPasswordHash(null));
                JsonUtil.sendSuccess(resp, "Users retrieved", users);
            } else {
                Long id = parseIdFromPath(pathInfo);
                if (id == null) {
                    JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid user ID.");
                    return;
                }
                Optional<User> userOpt = userService.getUserById(id, currentUser);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    user.setPasswordHash(null);
                    JsonUtil.sendSuccess(resp, "User details retrieved", user);
                } else {
                    JsonUtil.sendError(resp, HttpServletResponse.SC_NOT_FOUND, "User not found: " + id);
                }
            }
        } catch (SecurityException e) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_FORBIDDEN, e.getMessage());
        } catch (Exception e) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Database error: " + e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        User currentUser = getCurrentUser(req);
        JsonObject json = readJsonBody(req, resp);
        if (json == null) return;

        try {
            User newUser = new User();
            if (json.has("userName")) newUser.setUserName(json.get("userName").getAsString());
            if (json.has("email")) newUser.setEmail(json.get("email").getAsString());
            if (json.has("role")) newUser.setRole(json.get("role").getAsString());
            if (json.has("accountStatus")) newUser.setAccountStatus(json.get("accountStatus").getAsString());

            String plainPassword = json.has("password") ? json.get("password").getAsString() : null;

            User created = userService.createUser(newUser, plainPassword, currentUser);
            created.setPasswordHash(null);
            JsonUtil.sendCreated(resp, "User created successfully with ID #" + created.getUserId(), created);

        } catch (IllegalArgumentException e) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        } catch (SecurityException e) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_FORBIDDEN, e.getMessage());
        } catch (Exception e) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to create user: " + e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        User currentUser = getCurrentUser(req);
        String pathInfo = req.getPathInfo();
        Long id = parseIdFromPath(pathInfo);
        if (id == null) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "User ID required in path.");
            return;
        }

        JsonObject json = readJsonBody(req, resp);
        if (json == null) return;

        try {
            User updatedUser = new User();
            updatedUser.setUserId(id);
            if (json.has("userName")) updatedUser.setUserName(json.get("userName").getAsString());
            if (json.has("email")) updatedUser.setEmail(json.get("email").getAsString());
            if (json.has("role")) updatedUser.setRole(json.get("role").getAsString());
            if (json.has("accountStatus")) updatedUser.setAccountStatus(json.get("accountStatus").getAsString());

            String newPassword = (json.has("password") && !json.get("password").isJsonNull())
                    ? json.get("password").getAsString() : null;

            boolean success = userService.updateUser(updatedUser, newPassword, currentUser);
            if (success) {
                updatedUser.setPasswordHash(null);
                JsonUtil.sendSuccess(resp, "User #" + id + " updated successfully", updatedUser);
            } else {
                JsonUtil.sendError(resp, HttpServletResponse.SC_NOT_FOUND, "User #" + id + " not found");
            }
        } catch (IllegalArgumentException e) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        } catch (SecurityException e) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_FORBIDDEN, e.getMessage());
        } catch (Exception e) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Update error: " + e.getMessage());
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        User currentUser = getCurrentUser(req);
        String pathInfo = req.getPathInfo();
        Long id = parseIdFromPath(pathInfo);
        if (id == null) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "User ID required in path.");
            return;
        }

        try {
            boolean deleted = userService.deleteUser(id, currentUser);
            if (deleted) {
                JsonUtil.sendSuccess(resp, "User #" + id + " deleted successfully", null);
            } else {
                JsonUtil.sendError(resp, HttpServletResponse.SC_NOT_FOUND, "User #" + id + " not found");
            }
        } catch (IllegalArgumentException e) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, e.getMessage());
        } catch (SecurityException e) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_FORBIDDEN, e.getMessage());
        } catch (Exception e) {
            JsonUtil.sendError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Deletion failed: " + e.getMessage());
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
            JsonUtil.sendError(resp, HttpServletResponse.SC_BAD_REQUEST, "Invalid JSON payload.");
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

    private User getCurrentUser(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        return (session != null) ? (User) session.getAttribute(AuthenticationFilter.SESSION_USER_KEY) : null;
    }
}
