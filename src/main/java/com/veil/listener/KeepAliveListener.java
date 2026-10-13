package com.veil.listener;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

/**
 * Background daemon that periodically sends a keep-alive ping to the public
 * Render URL to prevent the cloud container from sleeping due to inactivity.
 */
@WebListener
public class KeepAliveListener implements ServletContextListener {

    private static final Logger LOGGER = Logger.getLogger(KeepAliveListener.class.getName());
    private ScheduledExecutorService scheduler;

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        String renderUrl = System.getenv("RENDER_EXTERNAL_URL");
        if (renderUrl == null || renderUrl.trim().isEmpty()) {
            renderUrl = "https://veil-v8gx.onrender.com";
        }

        final String target = renderUrl.endsWith("/") ? renderUrl : renderUrl + "/";

        scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "veil-keepalive-thread");
            t.setDaemon(true);
            return t;
        });

        // Ping every 10 minutes to prevent Render's 15-minute inactivity idle sleep
        scheduler.scheduleAtFixedRate(() -> {
            try {
                URL u = new URL(target);
                HttpURLConnection conn = (HttpURLConnection) u.openConnection();
                conn.setRequestMethod("GET");
                conn.setConnectTimeout(10000);
                conn.setReadTimeout(10000);
                conn.setRequestProperty("User-Agent", "VEIL-KeepAlive-Daemon/1.0");
                int code = conn.getResponseCode();
                LOGGER.info("VEIL KeepAlive heartbeat sent to " + target + " -> HTTP " + code);
                conn.disconnect();
            } catch (Exception e) {
                LOGGER.warning("VEIL KeepAlive heartbeat error: " + e.getMessage());
            }
        }, 5, 10, TimeUnit.MINUTES);

        LOGGER.info("VEIL KeepAlive heartbeat daemon activated targeting: " + target);
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        if (scheduler != null) {
            scheduler.shutdownNow();
            LOGGER.info("VEIL KeepAlive daemon shutdown.");
        }
    }
}
