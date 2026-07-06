package com.voting.dao;

import com.voting.config.DBConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class LocationDAO {

    public String findAllJson() throws SQLException {
        String sql = "SELECT province, district, municipality "
                + "FROM election_locations "
                + "ORDER BY province, district, municipality";

        StringBuilder json = new StringBuilder("{\"success\":true,\"locations\":[");
        boolean first = true;

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                if (!first) {
                    json.append(',');
                }

                json.append("{\"province\":\"")
                        .append(com.voting.util.JsonUtil.escape(rs.getString("province")))
                        .append("\",\"district\":\"")
                        .append(com.voting.util.JsonUtil.escape(rs.getString("district")))
                        .append("\",\"municipality\":\"")
                        .append(com.voting.util.JsonUtil.escape(rs.getString("municipality")))
                        .append("\"}");
                first = false;
            }
        }

        json.append("]}");
        return json.toString();
    }
}
