package com.voting.servlet;

import com.voting.dao.LocationDAO;
import com.voting.util.JsonUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.SQLException;

public class LocationServlet extends HttpServlet {

    private final LocationDAO locationDAO = new LocationDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            JsonUtil.write(response, HttpServletResponse.SC_OK, locationDAO.findAllJson());
        } catch (SQLException e) {
            throw new ServletException("Could not load voting locations", e);
        }
    }
}
