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
import java.util.Optional;

public class UserServlet extends HttpServlet {

    private final UserDAO userDAO = new UserDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        AuthUtil.AuthUser authUser = AuthUtil.currentUser(request);
        if (authUser == null) {
            JsonUtil.write(response, HttpServletResponse.SC_UNAUTHORIZED, JsonUtil.error("Please login first."));
            return;
        }

        try {
            Optional<User> user = userDAO.findById(authUser.userId());
            if (user.isEmpty()) {
                JsonUtil.write(response, HttpServletResponse.SC_NOT_FOUND, JsonUtil.error("User was not found."));
                return;
            }

            JsonUtil.write(response, HttpServletResponse.SC_OK, "{\"success\":true,\"user\":" + userJson(user.get()) + "}");
        } catch (SQLException e) {
            throw new ServletException("Could not load profile", e);
        }
    }

    private String userJson(User user) {
        return "{"
                + "\"id\":" + user.getId() + ","
                + "\"fullName\":\"" + JsonUtil.escape(user.getFullName()) + "\","
                + "\"phone\":\"" + JsonUtil.escape(user.getMobile()) + "\","
                + "\"mobile\":\"" + JsonUtil.escape(user.getMobile()) + "\","
                + "\"email\":\"" + JsonUtil.escape(user.getEmail()) + "\","
                + "\"voterId\":\"" + JsonUtil.escape(user.getVoterId()) + "\","
                + "\"province\":\"" + JsonUtil.escape(user.getProvince()) + "\","
                + "\"district\":\"" + JsonUtil.escape(user.getDistrict()) + "\","
                + "\"municipality\":\"" + JsonUtil.escape(user.getMunicipality()) + "\","
                + "\"role\":\"" + JsonUtil.escape(user.getRole()) + "\","
                + "\"hasVoted\":" + user.isHasVoted()
                + "}";
    }
}
