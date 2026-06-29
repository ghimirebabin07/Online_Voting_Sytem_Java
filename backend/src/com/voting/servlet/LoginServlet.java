package com.voting.servlet;

import com.voting.dao.UserDAO;
import com.voting.model.User;
import com.voting.util.AuthUtil;
import com.voting.util.JsonUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Map;
import java.util.Optional;

public class LoginServlet extends HttpServlet {

    private final UserDAO userDAO = new UserDAO();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String path = request.getServletPath();
        if (path.endsWith("/logout")) {
            AuthUtil.clear(request);
            JsonUtil.write(response, HttpServletResponse.SC_OK, JsonUtil.success("Logged out successfully."));
            return;
        }

        Map<String, String> body = JsonUtil.readObject(request);
        boolean adminRequest = path.endsWith("/admin/login");
        String mobile = JsonUtil.value(body, request, "mobile", "phone", "username");
        String password = JsonUtil.value(body, request, "password");

        if (isBlank(mobile) || isBlank(password)) {
            JsonUtil.write(response, HttpServletResponse.SC_BAD_REQUEST, JsonUtil.error("Mobile number/username and password are required."));
            return;
        }

        try {
            Optional<User> user = adminRequest ? userDAO.adminLogin(mobile.trim(), password) : userDAO.login(mobile.trim(), password);
            if (user.isEmpty()) {
                JsonUtil.write(response, HttpServletResponse.SC_UNAUTHORIZED, JsonUtil.error("Invalid login details."));
                return;
            }

            String role = normalizedRole(user.get().getRole());
            String token = AuthUtil.issueToken(request, user.get().getId(), role);
            JsonUtil.write(response, HttpServletResponse.SC_OK, userJson(user.get(), token));
        } catch (SQLException e) {
            throw new ServletException("Login failed", e);
        }
    }

    private String userJson(User user, String token) {
        String role = normalizedRole(user.getRole());
        return "{"
                + "\"success\":true,"
                + "\"message\":\"Login successful.\","
                + "\"token\":\"" + JsonUtil.escape(token) + "\","
                + "\"user\":{"
                + "\"id\":" + user.getId() + ","
                + "\"fullName\":\"" + JsonUtil.escape(user.getFullName()) + "\","
                + "\"phone\":\"" + JsonUtil.escape(user.getMobile()) + "\","
                + "\"mobile\":\"" + JsonUtil.escape(user.getMobile()) + "\","
                + "\"email\":\"" + JsonUtil.escape(user.getEmail()) + "\","
                + "\"voterId\":\"" + JsonUtil.escape(user.getVoterId()) + "\","
                + "\"province\":\"" + JsonUtil.escape(user.getProvince()) + "\","
                + "\"district\":\"" + JsonUtil.escape(user.getDistrict()) + "\","
                + "\"municipality\":\"" + JsonUtil.escape(user.getMunicipality()) + "\","
                + "\"role\":\"" + JsonUtil.escape(role) + "\","
                + "\"hasVoted\":" + user.isHasVoted()
                + "}"
                + "}";
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String normalizedRole(String role) {
        return isBlank(role) ? "VOTER" : role.trim().toUpperCase();
    }
}
