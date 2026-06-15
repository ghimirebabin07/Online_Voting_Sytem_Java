package com.voting.dao;

import com.voting.config.DBConnection;
import com.voting.model.Candidate;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class CandidateDAO {

    public List<Candidate> findAll() throws SQLException {

        String sql = "SELECT id, name, party, image_path, symbol_path, description, vote_count FROM candidates ORDER BY id";
        List<Candidate> candidates = new ArrayList<>();

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                candidates.add(mapCandidate(rs));
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

    public Candidate create(String name, String party, String imagePath, String symbolPath, String description) throws SQLException {

        String sql = "INSERT INTO candidates(name, party, image_path, symbol_path, description) VALUES (?, ?, ?, ?, ?) "
                + "RETURNING id, name, party, image_path, symbol_path, description, vote_count";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, name);
            ps.setString(2, party);
            ps.setString(3, imagePath);
            ps.setString(4, symbolPath);
            ps.setString(5, description);

            try (ResultSet rs = ps.executeQuery()) {
                rs.next();
                return mapCandidate(rs);
            }
        }
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
                rs.getInt("vote_count")
        );
    }
}
