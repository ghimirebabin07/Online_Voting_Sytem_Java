package com.voting.util;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.io.BufferedReader;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public final class JsonUtil {

    private JsonUtil() {
    }

    public static void write(HttpServletResponse response, int status, String json) throws IOException {
        response.setStatus(status);
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.getWriter().write(json);
    }

    public static String escape(String value) {
        if (value == null) {
            return "";
        }

        StringBuilder escaped = new StringBuilder(value.length());
        for (int i = 0; i < value.length(); i++) {
            char ch = value.charAt(i);
            switch (ch) {
                case '"':
                    escaped.append("\\\"");
                    break;
                case '\\':
                    escaped.append("\\\\");
                    break;
                case '\b':
                    escaped.append("\\b");
                    break;
                case '\f':
                    escaped.append("\\f");
                    break;
                case '\n':
                    escaped.append("\\n");
                    break;
                case '\r':
                    escaped.append("\\r");
                    break;
                case '\t':
                    escaped.append("\\t");
                    break;
                default:
                    if (ch < 0x20) {
                        escaped.append(String.format("\\u%04x", (int) ch));
                    } else {
                        escaped.append(ch);
                    }
            }
        }
        return escaped.toString();
    }

    public static String error(String message) {
        return "{\"success\":false,\"message\":\"" + escape(message) + "\"}";
    }

    public static String success(String message) {
        return "{\"success\":true,\"message\":\"" + escape(message) + "\"}";
    }

    public static Map<String, String> readObject(HttpServletRequest request) throws IOException {
        Map<String, String> values = new HashMap<>();
        StringBuilder body = new StringBuilder();

        try (BufferedReader reader = request.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                body.append(line);
            }
        }

        parseFlatObject(body.toString(), values);

        return values;
    }

    public static String value(Map<String, String> body, HttpServletRequest request, String... names) {
        for (String name : names) {
            String value = body.get(name);
            if (value == null || value.isBlank()) {
                value = request.getParameter(name);
            }
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private static void parseFlatObject(String json, Map<String, String> values) {
        int index = skipWhitespace(json, 0);
        if (index >= json.length() || json.charAt(index) != '{') {
            return;
        }
        index++;

        while (index < json.length()) {
            index = skipWhitespace(json, index);
            if (index >= json.length() || json.charAt(index) == '}') {
                return;
            }
            if (json.charAt(index) != '"') {
                return;
            }

            ParseResult key = readJsonString(json, index);
            if (key == null) {
                return;
            }

            index = skipWhitespace(json, key.nextIndex);
            if (index >= json.length() || json.charAt(index) != ':') {
                return;
            }
            index = skipWhitespace(json, index + 1);

            ParseResult value = readJsonValue(json, index);
            if (value == null) {
                return;
            }
            if (value.value != null) {
                values.put(key.value, value.value);
            }

            index = skipWhitespace(json, value.nextIndex);
            if (index < json.length() && json.charAt(index) == ',') {
                index++;
            }
        }
    }

    private static ParseResult readJsonValue(String json, int index) {
        if (index >= json.length()) {
            return null;
        }

        if (json.charAt(index) == '"') {
            return readJsonString(json, index);
        }

        int end = index;
        while (end < json.length() && json.charAt(end) != ',' && json.charAt(end) != '}') {
            end++;
        }

        String rawValue = json.substring(index, end).trim();
        if (rawValue.isEmpty() || "null".equals(rawValue)) {
            return new ParseResult(null, end);
        }

        return new ParseResult(rawValue, end);
    }

    private static ParseResult readJsonString(String json, int index) {
        if (index >= json.length() || json.charAt(index) != '"') {
            return null;
        }

        StringBuilder value = new StringBuilder();
        for (int i = index + 1; i < json.length(); i++) {
            char ch = json.charAt(i);
            if (ch == '"') {
                return new ParseResult(value.toString(), i + 1);
            }
            if (ch != '\\') {
                value.append(ch);
                continue;
            }
            if (++i >= json.length()) {
                return null;
            }
            appendEscapedChar(value, json, i);
            if (json.charAt(i) == 'u') {
                i += 4;
            }
        }

        return null;
    }

    private static void appendEscapedChar(StringBuilder value, String json, int escapeIndex) {
        char escaped = json.charAt(escapeIndex);
        switch (escaped) {
            case '"':
            case '\\':
            case '/':
                value.append(escaped);
                break;
            case 'b':
                value.append('\b');
                break;
            case 'f':
                value.append('\f');
                break;
            case 'n':
                value.append('\n');
                break;
            case 'r':
                value.append('\r');
                break;
            case 't':
                value.append('\t');
                break;
            case 'u':
                if (escapeIndex + 4 < json.length()) {
                    value.append((char) Integer.parseInt(json.substring(escapeIndex + 1, escapeIndex + 5), 16));
                }
                break;
            default:
                value.append(escaped);
        }
    }

    private static int skipWhitespace(String value, int index) {
        while (index < value.length() && Character.isWhitespace(value.charAt(index))) {
            index++;
        }
        return index;
    }

    private static class ParseResult {
        private final String value;
        private final int nextIndex;

        private ParseResult(String value, int nextIndex) {
            this.value = value;
            this.nextIndex = nextIndex;
        }
    }
}
