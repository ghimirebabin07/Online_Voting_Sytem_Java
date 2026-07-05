package com.voting.dao;

import com.voting.config.DBConnection;
import com.voting.model.Candidate;
import java.sql.Connection;
import java.sql.Statement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class CandidateDAO {

    public List<Candidate> findAll() throws SQLException {

        String sql = candidateSelectColumns() + " FROM candidates ORDER BY id";
        List<Candidate> candidates = new ArrayList<>();

        try (Connection con = DBConnection.getConnection()) {
            ensureCandidateLocationColumns(con);

            try (PreparedStatement ps = con.prepareStatement(sql);
                 ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    candidates.add(mapCandidate(rs));
                }
            }
        }

        return candidates;
    }

    public int countCandidates() throws SQLException {

        String sql = "SELECT COUNT(*) FROM candidates";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            rs.next();
            return rs.getInt(1);
        }
    }

    public Candidate create(String name, String party, String imagePath, String symbolPath, String description,
                            String province, String district, String municipality) throws SQLException {

        try (Connection con = DBConnection.getConnection()) {
            ensureCandidateLocationColumns(con);
            SQLException lastError = null;

            for (int attempt = 0; attempt < 3; attempt++) {
                try {
                    return insertCandidate(con, name, party, imagePath, symbolPath, description, province, district, municipality);
                } catch (SQLException e) {
                    lastError = e;

                    if ("23505".equals(e.getSQLState())) {
                        resetCandidateSequence(con);
                    } else if ("22001".equals(e.getSQLState())) {
                        widenCandidateUrlColumns(con);
                    } else {
                        throw e;
                    }
                }
            }

            throw lastError;
        }
    }

    private Candidate insertCandidate(Connection con, String name, String party, String imagePath, String symbolPath,
                                      String description, String province, String district, String municipality) throws SQLException {

        String sql = "INSERT INTO candidates(name, party, image_path, symbol_path, description, province, district, municipality) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        try (PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, name);
            ps.setString(2, party);
            ps.setString(3, imagePath);
            ps.setString(4, symbolPath);
            ps.setString(5, description);
            ps.setString(6, province);
            ps.setString(7, district);
            ps.setString(8, municipality);

            ps.executeUpdate();

            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    return findById(con, keys.getInt(1));
                }
            }

            throw new SQLException("Candidate was saved, but its generated id was not returned.");
        }
    }

    private void resetCandidateSequence(Connection con) throws SQLException {

        String sql = "SELECT setval('candidates_id_seq', COALESCE((SELECT MAX(id) FROM candidates), 0) + 1, false)";

        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.executeQuery();
        }
    }

    private void widenCandidateUrlColumns(Connection con) throws SQLException {

        String sql = "ALTER TABLE candidates "
                + "ALTER COLUMN image_path TYPE TEXT, "
                + "ALTER COLUMN symbol_path TYPE TEXT";

        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.executeUpdate();
        }
    }

    private Candidate findById(Connection con, int id) throws SQLException {
        ensureCandidateLocationColumns(con);

        String sql = candidateSelectColumns() + " FROM candidates WHERE id = ?";

        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapCandidate(rs);
                }
            }
        }

        throw new SQLException("Saved candidate could not be loaded.");
    }

    public int totalVotes() throws SQLException {

        String sql = "SELECT COALESCE(SUM(vote_count), 0) FROM candidates";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            rs.next();
            return rs.getInt(1);
        }
    }

    private Candidate mapCandidate(ResultSet rs) throws SQLException {
        return new Candidate(
                rs.getInt("id"),
                rs.getString("name"),
                rs.getString("party"),
                rs.getString("image_path"),
                rs.getString("symbol_path"),
                rs.getString("description"),
                rs.getString("province"),
                rs.getString("district"),
                rs.getString("municipality"),
                rs.getInt("vote_count")
        );
    }

    private String candidateSelectColumns() {
        return "SELECT id, name, party, image_path, symbol_path, description, province, district, municipality, vote_count";
    }

    private void ensureCandidateLocationColumns(Connection con) throws SQLException {
        try (Statement statement = con.createStatement()) {
            statement.executeUpdate("ALTER TABLE candidates ALTER COLUMN image_path TYPE TEXT");
            statement.executeUpdate("ALTER TABLE candidates ALTER COLUMN symbol_path TYPE TEXT");
            statement.executeUpdate("ALTER TABLE candidates ADD COLUMN IF NOT EXISTS province VARCHAR(80)");
            statement.executeUpdate("ALTER TABLE candidates ADD COLUMN IF NOT EXISTS district VARCHAR(80)");
            statement.executeUpdate("ALTER TABLE candidates ADD COLUMN IF NOT EXISTS municipality VARCHAR(120)");
        }
    }
}
