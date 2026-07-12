# Online Voting System

A Java Servlet, PostgreSQL, and vanilla frontend project for online voter registration, candidate management, vote casting, results, and developer details.

## Project Structure

```text
Online_Voting_Sytem_Java/
├── backend/                 # Maven Java Servlet application
│   ├── database/            # Database creation, schema, and public seed data
│   ├── src/                 # Java source code
│   ├── WEB-INF/web.xml      # Servlet and API mappings
│   ├── .env.example         # Safe database-configuration template
│   └── RUN_STEPS.md         # Local setup and deployment instructions
├── frontend/                # HTML, CSS, JavaScript, and public images
├── .gitignore               # Excludes secrets and generated files
└── README.md
```

## Features

- User registration and login
- Admin login and candidate management
- Location-based voting
- Vote casting and result display
- Developer details page

## Technologies Used

- Java Servlets
- PostgreSQL
- Apache Tomcat
- HTML, CSS, JavaScript
- Maven

## Run the Project

See [backend/RUN_STEPS.md](backend/RUN_STEPS.md) for database setup, local environment configuration, Maven build steps, and Tomcat deployment.

## Publish to GitHub

Run Git commands from this folder, not from its parent directory. The `backend/.env` file, build output, database exports, local IDE settings, and other private files are excluded by `.gitignore`.

Before committing, review exactly what will be published:

```powershell
git status
git add .
git diff --cached --name-only
```

If the displayed files look correct, commit and push:

```powershell
git commit -m "Prepare project for publication"
git push origin backend
```

## Security Note

Local secrets such as `backend/.env`, build output, and local machine notes are ignored by Git. Use `backend/.env.example` as the template for your own local configuration.
