package com.voting.dao;

import com.voting.config.DBConnection;
import java.sql.*;

public class UserDAO {

    public boolean register(String username, String password) {

        String sql = "INSERT INTO users(username, password) VALUES (?, ?)";

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, username);
            ps.setString(2, password);

            ps.executeUpdate();
            return true;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public ResultSet login(String username, String password) {

        String sql = "SELECT * FROM users WHERE username=? AND password=?";

        try {
            Connection con = DBConnection.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);

            ps.setString(1, username);
            ps.setString(2, password);

            return ps.executeQuery();

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}