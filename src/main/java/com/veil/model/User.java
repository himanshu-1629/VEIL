package com.veil.model;

import java.io.Serializable;
import java.sql.Timestamp;

/**
 * Represents an authenticated operator or analyst within VEIL.
 */
public class User implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long userId;
    private String userName;
    private String email;
    private transient String passwordHash; // excluded from direct public serialization
    private String role; // 'ADMIN' or 'USER'
    private String accountStatus; // 'ACTIVE', 'INACTIVE', 'SUSPENDED'
    private Timestamp createdAt;

    public User() {}

    public User(Long userId, String userName, String email, String passwordHash, String role, String accountStatus, Timestamp createdAt) {
        this.userId = userId;
        this.userName = userName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.accountStatus = accountStatus;
        this.createdAt = createdAt;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getAccountStatus() {
        return accountStatus;
    }

    public void setAccountStatus(String accountStatus) {
        this.accountStatus = accountStatus;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isAdmin() {
        return "ADMIN".equalsIgnoreCase(this.role);
    }
}
