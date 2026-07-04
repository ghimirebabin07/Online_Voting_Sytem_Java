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

    private static final String DEFAULT_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 160'%3E%3Crect width='160' height='160' fill='%23e2e8f0'/%3E%3Ccircle cx='80' cy='62' r='30' fill='%2394a3b8'/%3E%3Cpath d='M30 140c8-30 28-46 50-46s42 16 50 46' fill='%2394a3b8'/%3E%3C/svg%3E";
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
        String image = JsonUtil.value(body, request, "image", "imagePath", "imageUrl");
        String symbol = JsonUtil.value(body, request, "symbol", "symbolPath", "symbolUrl");
        String description = JsonUtil.value(body, request, "description", "manifesto");
        String province = JsonUtil.value(body, request, "province", "provinceName");
        String district = JsonUtil.value(body, request, "district", "districtName");
        String municipality = JsonUtil.value(body, request, "municipality", "municipalityName", "localLevel");

        if (isBlank(name) || isBlank(party) || isBlank(province) || isBlank(district) || isBlank(municipality)) {
            JsonUtil.write(response, HttpServletResponse.SC_BAD_REQUEST, JsonUtil.error("Candidate name, party, and region are required."));
            return;
        }

        try {
            Candidate candidate = candidateDAO.create(
                    name.trim(),
                    party.trim(),
                    valueOrDefault(image, DEFAULT_IMAGE),
                    valueOrDefault(symbol, DEFAULT_IMAGE),
                    valueOrDefault(description, "Candidate information will be updated by the election administrator."),
                    province.trim(),
                    district.trim(),
                    municipality.trim()
            );
            JsonUtil.write(response, HttpServletResponse.SC_CREATED, "{\"success\":true,\"candidate\":" + candidateJson(candidate) + "}");
        } catch (SQLException e) {
            JsonUtil.write(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    JsonUtil.error("Could not save candidate: " + e.getMessage()));
        }
    }

    private boolean isAdmin(HttpServletRequest request, HttpServletResponse response) throws IOException {
        AuthUtil.AuthUser authUser = AuthUtil.currentUser(request);
        if (authUser == null || authUser.role() == null || !"ADMIN".equalsIgnoreCase(authUser.role().trim())) {
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
                + "\"province\":\"" + JsonUtil.escape(candidate.getProvince()) + "\","
                + "\"district\":\"" + JsonUtil.escape(candidate.getDistrict()) + "\","
                + "\"municipality\":\"" + JsonUtil.escape(candidate.getMunicipality()) + "\","
                + "\"votes\":" + candidate.getVoteCount()
                + "}";
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String valueOrDefault(String value, String defaultValue) {
        return isBlank(value) ? defaultValue : value.trim();
    }
}
