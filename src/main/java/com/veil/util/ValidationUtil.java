package com.veil.util;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Server-side validation and sanitization utility to protect against injection and bad data.
 */
public class ValidationUtil {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private static final Set<String> ALLOWED_INCIDENT_TYPES = new HashSet<>(Arrays.asList(
            "Unauthorized Access",
            "Phishing",
            "Malware",
            "Data Exposure",
            "Suspicious Login Activity",
            "Denial of Service",
            "Policy Violation",
            "Other"
    ));

    private static final Set<String> ALLOWED_STATUSES = new HashSet<>(Arrays.asList(
            "Open",
            "In Progress",
            "Resolved"
    ));

    private static final Set<String> ALLOWED_ROLES = new HashSet<>(Arrays.asList(
            "ADMIN",
            "USER"
    ));

    public static String sanitize(String input) {
        if (input == null) return null;
        return input.trim();
    }

    public static String escapeHtml(String input) {
        if (input == null) return null;
        return input.replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace("\"", "&quot;")
                    .replace("'", "&#x27;");
    }

    public static void validateEmail(String email) {
        if (email == null || !EMAIL_PATTERN.matcher(email.trim()).matches()) {
            throw new IllegalArgumentException("Invalid email format.");
        }
    }

    public static void validateRole(String role) {
        if (role == null || !ALLOWED_ROLES.contains(role.trim().toUpperCase())) {
            throw new IllegalArgumentException("Invalid role. Must be 'ADMIN' or 'USER'.");
        }
    }

    public static void validateIncident(String threat, String incidentType, String affectedSystem, String description, int severity, String status) {
        if (threat == null || threat.trim().isEmpty() || threat.trim().length() > 200) {
            throw new IllegalArgumentException("Threat title must be between 1 and 200 characters.");
        }
        if (incidentType == null || !ALLOWED_INCIDENT_TYPES.contains(incidentType.trim())) {
            throw new IllegalArgumentException("Invalid incident type specified.");
        }
        if (affectedSystem == null || affectedSystem.trim().isEmpty() || affectedSystem.trim().length() > 100) {
            throw new IllegalArgumentException("Affected system must be between 1 and 100 characters.");
        }
        if (description == null || description.trim().isEmpty() || description.trim().length() > 2000) {
            throw new IllegalArgumentException("Description must be between 1 and 2000 characters.");
        }
        if (severity < 1 || severity > 10) {
            throw new IllegalArgumentException("Severity must be an integer between 1 and 10.");
        }
        if (status != null && !ALLOWED_STATUSES.contains(status.trim())) {
            throw new IllegalArgumentException("Status must be 'Open', 'In Progress', or 'Resolved'.");
        }
    }

    public static void validateUser(String userName, String email, String password, String role) {
        if (userName == null || userName.trim().length() < 2 || userName.trim().length() > 50) {
            throw new IllegalArgumentException("User name must be between 2 and 50 characters.");
        }
        validateEmail(email);
        if (password != null && (password.length() < 6 || password.length() > 100)) {
            throw new IllegalArgumentException("Password must be between 6 and 100 characters.");
        }
        validateRole(role);
    }
}
