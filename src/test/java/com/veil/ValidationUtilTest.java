package com.veil;

import com.veil.util.ValidationUtil;
import org.junit.Test;

import static org.junit.Assert.*;

public class ValidationUtilTest {

    @Test
    public void testValidEmails() {
        ValidationUtil.validateEmail("analyst@veil.sec");
        ValidationUtil.validateEmail("admin.officer@domain.co.in");
    }

    @Test(expected = IllegalArgumentException.class)
    public void testInvalidEmailMissingAt() {
        ValidationUtil.validateEmail("notanemail.com");
    }

    @Test(expected = IllegalArgumentException.class)
    public void testInvalidEmailBlank() {
        ValidationUtil.validateEmail("");
    }

    @Test
    public void testValidRoles() {
        ValidationUtil.validateRole("ADMIN");
        ValidationUtil.validateRole("USER");
        ValidationUtil.validateRole("admin");
    }

    @Test(expected = IllegalArgumentException.class)
    public void testInvalidRole() {
        ValidationUtil.validateRole("SUPERUSER");
    }

    @Test
    public void testValidIncident() {
        ValidationUtil.validateIncident(
                "Active Brute Force",
                "Unauthorized Access",
                "Gateway Server 01",
                "High frequency failed root logins observed.",
                8,
                "Open"
        );
    }

    @Test(expected = IllegalArgumentException.class)
    public void testIncidentMissingThreat() {
        ValidationUtil.validateIncident(
                "",
                "Unauthorized Access",
                "Server 01",
                "Desc",
                5,
                "Open"
        );
    }

    @Test(expected = IllegalArgumentException.class)
    public void testIncidentInvalidSeverity() {
        ValidationUtil.validateIncident(
                "Threat",
                "Phishing",
                "Server",
                "Desc",
                15,
                "Open"
        );
    }

    @Test
    public void testHtmlEscaping() {
        String unsafe = "<script>alert('xss')</script> & \"quote\"";
        String escaped = ValidationUtil.escapeHtml(unsafe);
        assertFalse(escaped.contains("<script>"));
        assertTrue(escaped.contains("&lt;script&gt;"));
        assertTrue(escaped.contains("&amp;"));
    }
}
