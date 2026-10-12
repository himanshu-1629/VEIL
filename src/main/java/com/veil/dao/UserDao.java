package com.veil.dao;

import com.veil.config.DatabaseConfig;
import com.veil.model.User;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Data Access Object for SYSTEM_USERS using prepared JDBC statements.
 */
public class UserDao {

    public Optional<User> findByEmail(String email) throws SQLException {
        String sql = "SELECT USER_ID, USER_NAME, EMAIL, PASSWORD_HASH, ROLE, ACCOUNT_STATUS, CREATED_AT " +
                     "FROM SYSTEM_USERS WHERE LOWER(EMAIL) = LOWER(?)";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email.trim());
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRow(rs));
                }
            }
        }
        return Optional.empty();
    }

    public Optional<User> findById(Long userId) throws SQLException {
        String sql = "SELECT USER_ID, USER_NAME, EMAIL, PASSWORD_HASH, ROLE, ACCOUNT_STATUS, CREATED_AT " +
                     "FROM SYSTEM_USERS WHERE USER_ID = ?";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRow(rs));
                }
            }
        }
        return Optional.empty();
    }

    public List<User> findAll() throws SQLException {
        List<User> list = new ArrayList<>();
        String sql = "SELECT USER_ID, USER_NAME, EMAIL, PASSWORD_HASH, ROLE, ACCOUNT_STATUS, CREATED_AT " +
                     "FROM SYSTEM_USERS ORDER BY USER_ID ASC";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapRow(rs));
            }
        }
        return list;
    }

    public User createUser(User user) throws SQLException {
        // Oracle-compatible sequence fetch or insert
        String seqSql = "SELECT USER_SEQ.NEXTVAL FROM DUAL";
        long newId;

        try (Connection conn = DatabaseConfig.getConnection()) {
            conn.setAutoCommit(false);
            try {
                try (PreparedStatement seqPs = conn.prepareStatement(seqSql);
                     ResultSet seqRs = seqPs.executeQuery()) {
                    if (seqRs.next()) {
                        newId = seqRs.getLong(1);
                    } else {
                        newId = System.currentTimeMillis();
                    }
                }

                String insertSql = "INSERT INTO SYSTEM_USERS (USER_ID, USER_NAME, EMAIL, PASSWORD_HASH, ROLE, ACCOUNT_STATUS, CREATED_AT) " +
                                   "VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";

                try (PreparedStatement ps = conn.prepareStatement(insertSql)) {
                    ps.setLong(1, newId);
                    ps.setString(2, user.getUserName().trim());
                    ps.setString(3, user.getEmail().trim().toLowerCase());
                    ps.setString(4, user.getPasswordHash());
                    ps.setString(5, user.getRole().trim().toUpperCase());
                    ps.setString(6, user.getAccountStatus() != null ? user.getAccountStatus() : "ACTIVE");
                    ps.executeUpdate();
                }

                conn.commit();
                user.setUserId(newId);
                user.setCreatedAt(new Timestamp(System.currentTimeMillis()));
                return user;
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            } finally {
                conn.setAutoCommit(true);
            }
        }
    }

    public boolean updateUser(User user) throws SQLException {
        String sql = "UPDATE SYSTEM_USERS SET USER_NAME = ?, EMAIL = ?, ROLE = ?, ACCOUNT_STATUS = ? " +
                     (user.getPasswordHash() != null ? ", PASSWORD_HASH = ? " : "") +
                     "WHERE USER_ID = ?";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            int idx = 1;
            ps.setString(idx++, user.getUserName().trim());
            ps.setString(idx++, user.getEmail().trim().toLowerCase());
            ps.setString(idx++, user.getRole().trim().toUpperCase());
            ps.setString(idx++, user.getAccountStatus() != null ? user.getAccountStatus() : "ACTIVE");
            if (user.getPasswordHash() != null) {
                ps.setString(idx++, user.getPasswordHash());
            }
            ps.setLong(idx++, user.getUserId());

            return ps.executeUpdate() > 0;
        }
    }

    public boolean deleteUser(Long userId) throws SQLException {
        String sql = "DELETE FROM SYSTEM_USERS WHERE USER_ID = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, userId);
            return ps.executeUpdate() > 0;
        }
    }

    public int countUsers() throws SQLException {
        String sql = "SELECT COUNT(*) FROM SYSTEM_USERS";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                return rs.getInt(1);
            }
        }
        return 0;
    }

    private User mapRow(ResultSet rs) throws SQLException {
        return new User(
                rs.getLong("USER_ID"),
                rs.getString("USER_NAME"),
                rs.getString("EMAIL"),
                rs.getString("PASSWORD_HASH"),
                rs.getString("ROLE"),
                rs.getString("ACCOUNT_STATUS"),
                rs.getTimestamp("CREATED_AT")
        );
    }
}
