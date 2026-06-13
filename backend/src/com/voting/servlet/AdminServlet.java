package com.voting.servlet;

import com.voting.dao.CandidateDAO;
import com.voting.dao.UserDAO;
import com.voting.model.Candidate;
import com.voting.util.AuthUtil;
import com.voting.util.JsonUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Map;

public class AdminServlet extends HttpServlet {

    private final CandidateDAO candidateDAO = new CandidateDAO();
    private final UserDAO userDAO = new UserDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        if (!isAdmin(request, response)) {
            return;
        }

        try {
            JsonUtil.write(response, HttpServletResponse.SC_OK, "{"
                    + "\"success\":true,"
                    + "\"totalVoters\":" + userDAO.countUsers() + ","
                    + "\"totalCandidates\":" + candidateDAO.countCandidates() + ","
                    + "\"totalVotes\":" + candidateDAO.totalVotes() + ","
                    + "\"electionStatus\":\"Open\""
                    + "}");
        } catch (SQLException e) {
            throw new ServletException("Could not load admin stats", e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        if (!isAdmin(request, response)) {
            return;
        }

        Map<String, String> body = JsonUtil.readObject(request);
        String name = JsonUtil.value(body, request, "name", "fullName", "candidateName");
        String party = JsonUtil.value(body, request, "party", "partyName");

        if (isBlank(name) || isBlank(party)) {
            JsonUtil.write(response, HttpServletResponse.SC_BAD_REQUEST, JsonUtil.error("Candidate name and party are required."));
            return;
        }

        String image = JsonUtil.value(body, request, "image", "imageUrl", "imagePath");
        String symbol = JsonUtil.value(body, request, "symbol", "symbolUrl", "symbolPath");
        String description = JsonUtil.value(body, request, "description", "manifesto");

        try {
            Candidate candidate = candidateDAO.create(
                    name.trim(),
                    party.trim(),
                    defaultValue(image, "../Images/Profile.jpg"),
                    defaultValue(symbol, "../Images/Profile.jpg"),
                    defaultValue(description, "Candidate information will be updated by the election administrator.")
            );
            JsonUtil.write(response, HttpServletResponse.SC_CREATED, "{\"success\":true,\"candidate\":" + candidateJson(candidate) + "}");
        } catch (SQLException e) {
            throw new ServletException("Could not save candidate", e);
        }
    }

    private boolean isAdmin(HttpServletRequest request, HttpServletResponse response) throws IOException {
        AuthUtil.AuthUser authUser = AuthUtil.currentUser(request);
        if (authUser == null || !"ADMIN".equals(authUser.role())) {
            JsonUtil.write(response, HttpServletResponse.SC_FORBIDDEN, JsonUtil.error("Admin login is required."));
            return false;
        }
        return true;
    }

    private String candidateJson(Candidate candidate) {
        return "{"
                + "\"id\":" + candidate.getId() + ","
                + "\"name\":\"" + JsonUtil.escape(candidate.getName()) + "\","
                + "\"party\":\"" + JsonUtil.escape(candidate.getParty()) + "\","
                + "\"image\":\"" + JsonUtil.escape(candidate.getImagePath()) + "\","
                + "\"symbol\":\"" + JsonUtil.escape(candidate.getSymbolPath()) + "\","
                + "\"description\":\"" + JsonUtil.escape(candidate.getDescription()) + "\","
                + "\"votes\":" + candidate.getVoteCount()
                + "}";
    }

    private String defaultValue(String value, String fallback) {
        return isBlank(value) ? fallback : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
