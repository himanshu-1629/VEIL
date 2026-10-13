package com.veil.filter;

import com.veil.model.User;
import com.veil.util.JsonUtil;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

/**
 * Enforces session-based authentication and role-based authorization.
 */
@WebFilter("/api/*")
public class AuthenticationFilter implements Filter {

    public static final String SESSION_USER_KEY = "currentUser";
    public static final String CSRF_TOKEN_KEY = "csrfToken";

    @Override
    public void init(FilterConfig filterConfig) {}

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        String path = req.getRequestURI();
        String contextPath = req.getContextPath();
        String relativePath = path.substring(contextPath.length());

        // Allow public endpoints
        if (relativePath.equals("/api/auth/login") || relativePath.equals("/api/auth/me") || relativePath.equals("/api/health")) {
            chain.doFilter(request, response);
            return;
        }

        HttpSession session = req.getSession(false);
        User currentUser = (session != null) ? (User) session.getAttribute(SESSION_USER_KEY) : null;

        if (currentUser == null) {
            JsonUtil.sendError(res, HttpServletResponse.SC_UNAUTHORIZED, "Session expired or authentication required. Please log in.");
            return;
        }

        // Admin-only protection for /api/users
        if (relativePath.startsWith("/api/users")) {
            if (!currentUser.isAdmin()) {
                JsonUtil.sendError(res, HttpServletResponse.SC_FORBIDDEN, "Access denied. Administrator privileges required.");
                return;
            }
        }

        // Pass along
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {}
}
