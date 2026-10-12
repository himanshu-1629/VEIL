package com.veil.service;

import com.veil.dao.UserDao;
import com.veil.model.User;
import com.veil.util.PasswordUtil;
import com.veil.util.ValidationUtil;

import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

/**
 * Service for administrative user provisioning, role assignments, and status updates.
 */
public class UserService {

    private final UserDao userDao;

    public UserService() {
        this.userDao = new UserDao();
    }

    public UserService(UserDao userDao) {
        this.userDao = userDao;
    }

    public List<User> getAllUsers(User actingAdmin) throws SQLException {
        ensureAdmin(actingAdmin);
        return userDao.findAll();
    }

    public Optional<User> getUserById(Long userId, User actingAdmin) throws SQLException {
        ensureAdmin(actingAdmin);
        return userDao.findById(userId);
    }

    public User createUser(User newUser, String plainPassword, User actingAdmin) throws SQLException {
        ensureAdmin(actingAdmin);

        ValidationUtil.validateUser(newUser.getUserName(), newUser.getEmail(), plainPassword, newUser.getRole());

        if (userDao.findByEmail(newUser.getEmail()).isPresent()) {
            throw new IllegalArgumentException("A user with this email address already exists.");
        }

        newUser.setPasswordHash(PasswordUtil.hashPassword(plainPassword));
        return userDao.createUser(newUser);
    }

    public boolean updateUser(User updatedUser, String newPassword, User actingAdmin) throws SQLException {
        ensureAdmin(actingAdmin);

        ValidationUtil.validateUser(updatedUser.getUserName(), updatedUser.getEmail(), newPassword, updatedUser.getRole());

        Optional<User> existing = userDao.findById(updatedUser.getUserId());
        if (!existing.isPresent()) {
            throw new IllegalArgumentException("User not found: " + updatedUser.getUserId());
        }

        // Email uniqueness check if email was altered
        if (!existing.get().getEmail().equalsIgnoreCase(updatedUser.getEmail())) {
            Optional<User> byEmail = userDao.findByEmail(updatedUser.getEmail());
            if (byEmail.isPresent() && !byEmail.get().getUserId().equals(updatedUser.getUserId())) {
                throw new IllegalArgumentException("Email is already taken by another user.");
            }
        }

        if (newPassword != null && !newPassword.trim().isEmpty()) {
            updatedUser.setPasswordHash(PasswordUtil.hashPassword(newPassword));
        } else {
            updatedUser.setPasswordHash(existing.get().getPasswordHash());
        }

        return userDao.updateUser(updatedUser);
    }

    public boolean deleteUser(Long userId, User actingAdmin) throws SQLException {
        ensureAdmin(actingAdmin);

        if (actingAdmin.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Administrators cannot delete their own active session account.");
        }

        return userDao.deleteUser(userId);
    }

    private void ensureAdmin(User user) {
        if (user == null || !user.isAdmin()) {
            throw new SecurityException("Access Denied: Administrator role required for user management.");
        }
    }
}
