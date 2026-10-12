package com.veil.util;

import org.mindrot.jbcrypt.BCrypt;

/**
 * Enterprise password hashing and verification using jBCrypt.
 */
public class PasswordUtil {

    private static final int LOG_ROUNDS = 10;

    /**
     * Hashes plaintext password using BCrypt with salt rounds = 10.
     */
    public static String hashPassword(String plainPassword) {
        if (plainPassword == null || plainPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be blank.");
        }
        return BCrypt.hashpw(plainPassword, BCrypt.gensalt(LOG_ROUNDS));
    }

    /**
     * Verifies plain password against stored BCrypt hash.
     */
    public static boolean verifyPassword(String plainPassword, String storedHash) {
        if (plainPassword == null || storedHash == null || storedHash.trim().isEmpty()) {
            return false;
        }
        try {
            return BCrypt.checkpw(plainPassword, storedHash);
        } catch (Exception e) {
            return false;
        }
    }
}
