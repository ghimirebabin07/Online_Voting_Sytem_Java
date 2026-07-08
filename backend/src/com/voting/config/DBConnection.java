package com.voting.config;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.List;

public class DBConnection {

    private static final String PASSWORD_HELP = "Database password is not configured. "
            + "Set VOTING_DB_PASSWORD, set -Dvoting.db.password, or create backend/.env from backend/.env.example. "
            + "If Tomcat starts from a different folder, set VOTING_ENV_FILE to the full backend/.env path.";
    private static final String URL = value("VOTING_DB_URL", "voting.db.url", "jdbc:postgresql://localhost:5432/voting_system");
    private static final String USER = value("VOTING_DB_USER", "voting.db.user", "postgres");
    private static final String PASSWORD = value("VOTING_DB_PASSWORD", "voting.db.password", null);

    static {
        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            throw new ExceptionInInitializerError("PostgreSQL JDBC driver is missing: " + e.getMessage());
        }
    }

    private DBConnection() {
    }

    public static Connection getConnection() throws SQLException {
        if (PASSWORD == null) {
            throw new SQLException(PASSWORD_HELP);
        }
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }

    private static String value(String envName, String propertyName, String defaultValue) {
        String propertyValue = System.getProperty(propertyName);
        if (propertyValue != null && !propertyValue.isBlank()) {
            return propertyValue;
        }

        String envValue = System.getenv(envName);
        if (envValue != null && !envValue.isBlank()) {
            return envValue;
        }

        String dotenvValue = dotenv(envName);
        if (dotenvValue != null && !dotenvValue.isBlank()) {
            return dotenvValue;
        }

        return defaultValue;
    }

    private static String dotenv(String name) {
        String configuredPath = System.getProperty("voting.env.file");
        if (configuredPath == null || configuredPath.isBlank()) {
            configuredPath = System.getenv("VOTING_ENV_FILE");
        }

        List<Path> paths = configuredPath == null || configuredPath.isBlank()
                ? List.of(Path.of(".env"), Path.of("backend", ".env"), Path.of("..", "backend", ".env"))
                : List.of(Path.of(configuredPath));

        for (Path path : paths) {
            String value = readDotenvValue(path, name);
            if (value != null) {
                return value;
            }
        }

        return null;
    }

    private static String readDotenvValue(Path path, String name) {
        if (!Files.isRegularFile(path)) {
            return null;
        }

        try (BufferedReader reader = Files.newBufferedReader(path)) {
            String line;
            while ((line = reader.readLine()) != null) {
                String trimmed = line.trim();
                if (trimmed.isEmpty() || trimmed.startsWith("#") || !trimmed.contains("=")) {
                    continue;
                }

                String key = trimmed.substring(0, trimmed.indexOf('=')).trim();
                if (!name.equals(key)) {
                    continue;
                }

                String value = trimmed.substring(trimmed.indexOf('=') + 1).trim();
                if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.substring(1, value.length() - 1);
                }
                return value;
            }
        } catch (IOException ignored) {
            return null;
        }

        return null;
    }
}
