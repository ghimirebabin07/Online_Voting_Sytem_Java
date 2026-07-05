package com.voting.dao;

import com.voting.config.DBConnection;
import com.voting.util.JsonUtil;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class DeveloperDAO {

    public String findAllJson() throws SQLException {
        String sql = "SELECT full_name, role_title, bio, skills, image_path "
                + "FROM developers "
                + "ORDER BY display_order, id";

        StringBuilder json = new StringBuilder("{\"success\":true,\"developers\":[");
        boolean first = true;

        try (Connection con = DBConnection.getConnection()) {
            ensureDeveloperTable(con);

            try (PreparedStatement ps = con.prepareStatement(sql);
                 ResultSet rs = ps.executeQuery()) {

                while (rs.next()) {
                    if (!first) {
                        json.append(',');
                    }

                    json.append("{\"name\":\"")
                            .append(JsonUtil.escape(rs.getString("full_name")))
                            .append("\",\"role\":\"")
                            .append(JsonUtil.escape(rs.getString("role_title")))
                            .append("\",\"bio\":\"")
                            .append(JsonUtil.escape(rs.getString("bio")))
                            .append("\",\"skills\":\"")
                            .append(JsonUtil.escape(rs.getString("skills")))
                            .append("\",\"image\":\"")
                            .append(JsonUtil.escape(rs.getString("image_path")))
                            .append("\"}");
                    first = false;
                }
            }
        }

        json.append("]}");
        return json.toString();
    }

    private void ensureDeveloperTable(Connection con) throws SQLException {
        try (Statement statement = con.createStatement()) {
            statement.executeUpdate("CREATE TABLE IF NOT EXISTS developers ("
                    + "id SERIAL PRIMARY KEY,"
                    + "full_name VARCHAR(120) NOT NULL,"
                    + "role_title VARCHAR(120) NOT NULL,"
                    + "bio TEXT,"
                    + "skills VARCHAR(180),"
                    + "image_path TEXT,"
                    + "display_order INTEGER NOT NULL DEFAULT 0"
                    + ")");
            statement.executeUpdate("ALTER TABLE developers ALTER COLUMN image_path TYPE TEXT");
            statement.executeUpdate("ALTER TABLE developers ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0");
        }
    }
}
