package com.voting.dao;

import com.voting.config.DBConnection;
import com.voting.model.User;
import com.voting.util.PasswordUtil;
import java.sql.*;
import java.util.Optional;

public class UserDAO {

    public boolean register(String fullName, String mobile, String email, String voterId,
                            String province, String district, String municipality, String password) throws SQLException {

        String sql = "INSERT INTO users(full_name, mobile, email, voter_id, province, district, municipality, password_hash) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection con = DBConnection.getConnection()) {
            ensureUserLocationColumns(con);

            try (PreparedStatement ps = con.prepareStatement(sql)) {
                ps.setString(1, fullName);
                ps.setString(2, mobile);
                ps.setString(3, email);
                ps.setString(4, voterId);
                ps.setString(5, province);
                ps.setString(6, district);
                ps.setString(7, municipality);
                ps.setString(8, PasswordUtil.hash(password));

                ps.executeUpdate();
            }
            return true;
        }
    }

    public Optional<User> login(String mobile, String password) throws SQLException {

        Optional<User> user = findByMobile(mobile);
        if (user.isEmpty() || !PasswordUtil.verify(password, user.get().getPasswordHash())) {
            return Optional.empty();
        }
        return user;
    }

    public Optional<User> adminLogin(String mobile, String password) throws SQLException {

        Optional<User> user = findByLoginIdentifier(mobile);
        if (user.isEmpty() || !PasswordUtil.verify(password, user.get().getPasswordHash()) || !isAdmin(user.get())) {
            return Optional.empty();
        }
        return user;
    }

    public Optional<User> findByMobile(String mobile) throws SQLException {

        String sql = userSelectColumns() + " FROM users WHERE mobile = ?";

        try (Connection con = DBConnection.getConnection()) {
            ensureUserLocationColumns(con);

            try (PreparedStatement ps = con.prepareStatement(sql)) {
                ps.setString(1, mobile);

                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        return Optional.of(mapUser(rs));
                    }
                }
            }
        }

        return Optional.empty();
    }

    public Optional<User> findByLoginIdentifier(String identifier) throws SQLException {

        String sql = userSelectColumns()
                + " FROM users "
                + "WHERE mobile = ? OR LOWER(email) = LOWER(?) OR LOWER(voter_id) = LOWER(?)";

        try (Connection con = DBConnection.getConnection()) {
            ensureUserLocationColumns(con);

            try (PreparedStatement ps = con.prepareStatement(sql)) {
                ps.setString(1, identifier);
                ps.setString(2, identifier);
                ps.setString(3, identifier);

                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        return Optional.of(mapUser(rs));
                    }
                }
            }
        }

        return Optional.empty();
    }

    private boolean isAdmin(User user) {
        String role = user.getRole();
        return role != null && "ADMIN".equalsIgnoreCase(role.trim());
    }

    public Optional<User> findById(int id) throws SQLException {

        String sql = userSelectColumns() + " FROM users WHERE id = ?";

        try (Connection con = DBConnection.getConnection()) {
            ensureUserLocationColumns(con);

            try (PreparedStatement ps = con.prepareStatement(sql)) {
                ps.setInt(1, id);

                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        return Optional.of(mapUser(rs));
                    }
                }
            }
        }

        return Optional.empty();
    }

    public int countUsers() throws SQLException {

        String sql = "SELECT COUNT(*) FROM users WHERE UPPER(TRIM(role)) = 'VOTER'";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            rs.next();
            return rs.getInt(1);
        }
    }

    public int countVotedUsers() throws SQLException {

        String sql = "SELECT COUNT(*) FROM users WHERE has_voted = true AND UPPER(TRIM(role)) = 'VOTER'";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            rs.next();
            return rs.getInt(1);
        }
    }

    public boolean castVote(int userId, int candidateId) throws SQLException {

        String lockUserSql = "SELECT has_voted, role, province, district, municipality FROM users WHERE id = ? FOR UPDATE";
        String candidateRegionSql = "SELECT province, district, municipality FROM candidates WHERE id = ?";
        String voteSql = "INSERT INTO votes(user_id, candidate_id) VALUES (?, ?)";
        String updateUserSql = "UPDATE users SET has_voted = true WHERE id = ?";
        String updateCandidateSql = "UPDATE candidates SET vote_count = vote_count + 1 WHERE id = ?";

        try (Connection con = DBConnection.getConnection()) {
            con.setAutoCommit(false);
            String userProvince;
            String userDistrict;
            String userMunicipality;

            try (PreparedStatement lockUser = con.prepareStatement(lockUserSql)) {
                lockUser.setInt(1, userId);

                try (ResultSet rs = lockUser.executeQuery()) {
                    if (!rs.next() || rs.getBoolean("has_voted") || !"VOTER".equalsIgnoreCase(rs.getString("role").trim())) {
                        con.rollback();
                        return false;
                    }

                    userProvince = rs.getString("province");
                    userDistrict = rs.getString("district");
                    userMunicipality = rs.getString("municipality");
                }
            }

            try (PreparedStatement candidateRegion = con.prepareStatement(candidateRegionSql)) {
                candidateRegion.setInt(1, candidateId);

                try (ResultSet rs = candidateRegion.executeQuery()) {
                    if (!rs.next()
                            || !sameRegion(userProvince, userDistrict, userMunicipality,
                            rs.getString("province"), rs.getString("district"), rs.getString("municipality"))) {
                        con.rollback();
                        return false;
                    }
                }
            }

            try (PreparedStatement updateCandidate = con.prepareStatement(updateCandidateSql)) {
                updateCandidate.setInt(1, candidateId);
                if (updateCandidate.executeUpdate() == 0) {
                    con.rollback();
                    return false;
                }
            }

            try (PreparedStatement vote = con.prepareStatement(voteSql);
                 PreparedStatement updateUser = con.prepareStatement(updateUserSql)) {

                vote.setInt(1, userId);
                vote.setInt(2, candidateId);
                vote.executeUpdate();

                updateUser.setInt(1, userId);
                updateUser.executeUpdate();
            }

            con.commit();
            return true;
        }
    }

    private boolean sameRegion(String userProvince, String userDistrict, String userMunicipality,
                               String candidateProvince, String candidateDistrict, String candidateMunicipality) {
        return normalized(userProvince).equals(normalized(candidateProvince))
                && normalized(userDistrict).equals(normalized(candidateDistrict))
                && normalized(userMunicipality).equals(normalized(candidateMunicipality));
    }

    private String normalized(String value) {
        return value == null ? "" : value.trim();
    }

    private User mapUser(ResultSet rs) throws SQLException {
        return new User(
                rs.getInt("id"),
                rs.getString("full_name"),
                rs.getString("mobile"),
                rs.getString("email"),
                rs.getString("voter_id"),
                rs.getString("province"),
                rs.getString("district"),
                rs.getString("municipality"),
                rs.getString("password_hash"),
                rs.getString("role"),
                rs.getBoolean("has_voted")
        );
    }

    private String userSelectColumns() {
        return "SELECT id, full_name, mobile, email, voter_id, province, district, municipality, password_hash, role, has_voted";
    }

    private void ensureUserLocationColumns(Connection con) throws SQLException {
        try (Statement statement = con.createStatement()) {
            statement.executeUpdate("ALTER TABLE users ADD COLUMN IF NOT EXISTS province VARCHAR(80)");
            statement.executeUpdate("ALTER TABLE users ADD COLUMN IF NOT EXISTS district VARCHAR(80)");
            statement.executeUpdate("ALTER TABLE users ADD COLUMN IF NOT EXISTS municipality VARCHAR(120)");
        }
    }
}
