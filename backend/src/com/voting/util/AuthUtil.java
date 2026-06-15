package com.voting.util;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public final class AuthUtil {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Map<String, AuthUser> TOKENS = new ConcurrentHashMap<>();

    private AuthUtil() {
    }

    public static String issueToken(HttpServletRequest request, int userId, String role) {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        TOKENS.put(token, new AuthUser(userId, role));

        HttpSession session = request.getSession(true);
        session.setAttribute("userId", userId);
        session.setAttribute("role", role);
        session.setAttribute("token", token);
        return token;
    }

    public static AuthUser currentUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null && session.getAttribute("userId") instanceof Integer) {
            Object role = session.getAttribute("role");
            return new AuthUser((Integer) session.getAttribute("userId"), role == null ? "VOTER" : role.toString());
        }

        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return TOKENS.get(header.substring("Bearer ".length()).trim());
        }

        return null;
    }

    public static void clear(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            Object token = session.getAttribute("token");
            if (token != null) {
                TOKENS.remove(token.toString());
            }
            session.invalidate();
        }

        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            TOKENS.remove(header.substring("Bearer ".length()).trim());
        }
    }

    public record AuthUser(int userId, String role) {
    }
}
