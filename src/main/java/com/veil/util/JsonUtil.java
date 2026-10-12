package com.veil.util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

/**
 * Standard JSON serialization and HTTP response utility for VEIL.
 */
public class JsonUtil {

    private static final Gson GSON = new GsonBuilder()
            .setDateFormat("yyyy-MM-dd HH:mm:ss")
            .serializeNulls()
            .disableHtmlEscaping()
            .create();

    public static Gson getGson() {
        return GSON;
    }

    public static String toJson(Object obj) {
        return GSON.toJson(obj);
    }

    public static <T> T fromJson(String json, Class<T> clazz) {
        return GSON.fromJson(json, clazz);
    }

    public static void sendSuccess(HttpServletResponse resp, String message, Object data) throws IOException {
        sendResponse(resp, HttpServletResponse.SC_OK, true, message, data);
    }

    public static void sendCreated(HttpServletResponse resp, String message, Object data) throws IOException {
        sendResponse(resp, HttpServletResponse.SC_CREATED, true, message, data);
    }

    public static void sendError(HttpServletResponse resp, int statusCode, String message) throws IOException {
        sendResponse(resp, statusCode, false, message, null);
    }

    public static void sendResponse(HttpServletResponse resp, int statusCode, boolean success, String message, Object data) throws IOException {
        resp.setStatus(statusCode);
        resp.setContentType("application/json;charset=UTF-8");
        resp.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        resp.setHeader("Pragma", "no-cache");
        resp.setHeader("X-Content-Type-Options", "nosniff");

        Map<String, Object> payload = new HashMap<>();
        payload.put("success", success);
        payload.put("message", message);
        if (data != null) {
            payload.put("data", data);
        }

        try (PrintWriter writer = resp.getWriter()) {
            writer.write(GSON.toJson(payload));
            writer.flush();
        }
    }
}
