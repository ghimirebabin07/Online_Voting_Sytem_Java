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
import java.util.List;
import java.util.Map;

public class VoteServlet extends HttpServlet {

    private final CandidateDAO candidateDAO = new CandidateDAO();
    private final UserDAO userDAO = new UserDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            JsonUtil.write(response, HttpServletResponse.SC_OK, candidatesJson(candidateDAO.findAll()));
        } catch (SQLException e) {
            throw new ServletException("Could not load candidates", e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        AuthUtil.AuthUser user = AuthUtil.currentUser(request);
        Map<String, String> body = JsonUtil.readObject(request);
        Integer candidateId = intValue(JsonUtil.value(body, request, "candidateId", "candidate_id", "id"));

        if (user == null) {
            JsonUtil.write(response, HttpServletResponse.SC_UNAUTHORIZED, JsonUtil.error("Please login before voting."));
            return;
        }

        if (candidateId == null) {
            JsonUtil.write(response, HttpServletResponse.SC_BAD_REQUEST, JsonUtil.error("Candidate id is required."));
            return;
        }

        try {
            boolean voted = userDAO.castVote(user.userId(), candidateId);
            if (!voted) {
                JsonUtil.write(response, HttpServletResponse.SC_CONFLICT, JsonUtil.error("Vote could not be recorded. You may have already voted or the candidate does not exist."));
                return;
            }

            JsonUtil.write(response, HttpServletResponse.SC_OK, JsonUtil.success("Vote recorded successfully."));
        } catch (SQLException e) {
            if ("23505".equals(e.getSQLState())) {
                JsonUtil.write(response, HttpServletResponse.SC_CONFLICT, JsonUtil.error("You have already voted."));
                return;
            }
            throw new ServletException("Voting failed", e);
        }
    }

    private Integer intValue(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String candidatesJson(List<Candidate> candidates) {
        StringBuilder json = new StringBuilder("{\"success\":true,\"candidates\":[");
        for (int i = 0; i < candidates.size(); i++) {
            if (i > 0) {
                json.append(',');
            }
            json.append(candidateJson(candidates.get(i)));
        }
        json.append("]}");
        return json.toString();
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
}
