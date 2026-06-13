package com.voting.servlet;

import com.voting.dao.CandidateDAO;
import com.voting.dao.UserDAO;
import com.voting.model.Candidate;
import com.voting.util.JsonUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

public class ResultServlet extends HttpServlet {

    private final CandidateDAO candidateDAO = new CandidateDAO();
    private final UserDAO userDAO = new UserDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            List<Candidate> candidates = candidateDAO.findAll();
            JsonUtil.write(response, HttpServletResponse.SC_OK, resultsJson(candidates));
        } catch (SQLException e) {
            throw new ServletException("Could not load results", e);
        }
    }

    private String resultsJson(List<Candidate> candidates) throws SQLException {
        int totalVotes = candidateDAO.totalVotes();
        int totalCandidates = candidateDAO.countCandidates();
        int totalVoters = userDAO.countUsers();
        int votedUsers = userDAO.countVotedUsers();
        Candidate winner = candidates.stream()
                .max(Comparator.comparingInt(Candidate::getVoteCount))
                .orElse(null);

        StringBuilder json = new StringBuilder("{\"success\":true,");
        json.append("\"totalVotes\":").append(totalVotes).append(',');
        json.append("\"totalCandidates\":").append(totalCandidates).append(',');
        json.append("\"totalVoters\":").append(totalVoters).append(',');
        json.append("\"votedUsers\":").append(votedUsers).append(',');
        json.append("\"winner\":").append(winner == null ? "null" : candidateJson(winner)).append(',');
        json.append("\"candidates\":[");

        for (int i = 0; i < candidates.size(); i++) {
            if (i > 0) {
                json.append(',');
            }
            json.append(candidateJson(candidates.get(i)));
        }

        json.append("],\"parties\":").append(partiesJson(candidates)).append('}');
        return json.toString();
    }

    private String partiesJson(List<Candidate> candidates) {
        Map<String, Integer> partyVotes = new TreeMap<>();
        for (Candidate candidate : candidates) {
            partyVotes.merge(candidate.getParty(), candidate.getVoteCount(), Integer::sum);
        }

        StringBuilder json = new StringBuilder("[");
        int index = 0;
        for (Map.Entry<String, Integer> entry : partyVotes.entrySet()) {
            if (index > 0) {
                json.append(',');
            }
            json.append("{\"party\":\"")
                    .append(JsonUtil.escape(entry.getKey()))
                    .append("\",\"votes\":")
                    .append(entry.getValue())
                    .append('}');
            index++;
        }
        json.append(']');
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
                + "\"votes\":" + candidate.getVoteCount()
                + "}";
    }
}
