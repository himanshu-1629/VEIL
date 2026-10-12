package com.veil;

import com.veil.util.PasswordUtil;
import org.junit.Test;

import static org.junit.Assert.*;

public class PasswordUtilTest {

    @Test
    public void testHashAndVerifyPassword() {
        String plain = "SecOps2026!Strict";
        String hash = PasswordUtil.hashPassword(plain);

        assertNotNull(hash);
        assertTrue(hash.startsWith("$2a$10$"));

        assertTrue(PasswordUtil.verifyPassword(plain, hash));
        assertFalse(PasswordUtil.verifyPassword("WrongPassword", hash));
    }

    @Test(expected = IllegalArgumentException.class)
    public void testHashBlankPasswordThrows() {
        PasswordUtil.hashPassword("   ");
    }

    @Test
    public void testVerifyNullOrBlank() {
        assertFalse(PasswordUtil.verifyPassword(null, "somehash"));
        assertFalse(PasswordUtil.verifyPassword("pass", null));
        assertFalse(PasswordUtil.verifyPassword("pass", ""));
    }
}
