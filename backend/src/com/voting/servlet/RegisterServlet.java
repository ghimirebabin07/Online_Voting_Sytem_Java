package com.voting.servlet;

import com.voting.dao.UserDAO;
import com.voting.util.JsonUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Map;

public class RegisterServlet extends HttpServlet {

    private final UserDAO userDAO = new UserDAO();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        Map<String, String> body = JsonUtil.readObject(request);
        String fullName = JsonUtil.value(body, request, "fullName", "name", "username");
        String mobile = JsonUtil.value(body, request, "mobile", "phone");
        String email = JsonUtil.value(body, request, "email");
        String voterId = JsonUtil.value(body, request, "voterId", "voter_id");
        String password = JsonUtil.value(body, request, "password");

        if (isBlank(fullName) || isBlank(mobile) || isBlank(password)) {
            JsonUtil.write(response, HttpServletResponse.SC_BAD_REQUEST, JsonUtil.error("Full name, mobile number, and password are required."));
            return;
        }

        if (!mobile.matches("9[876]\\d{8}")) {
            JsonUtil.write(response, HttpServletResponse.SC_BAD_REQUEST, JsonUtil.error("Mobile number must be a valid 10 digit Nepali number."));
            return;
        }

        try {
            userDAO.register(fullName.trim(), mobile.trim(), blankToNull(email), blankToNull(voterId), password);
            JsonUtil.write(response, HttpServletResponse.SC_CREATED, JsonUtil.success("Registration successful."));
        } catch (SQLException e) {
            if ("23505".equals(e.getSQLState())) {
                JsonUtil.write(response, HttpServletResponse.SC_CONFLICT, JsonUtil.error("Mobile number is already registered."));
                return;
            }
            throw new ServletException("Registration failed", e);
        }
    }

    private String blankToNull(String value) {
        return isBlank(value) ? null : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
