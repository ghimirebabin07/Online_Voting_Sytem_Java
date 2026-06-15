# Online Voting System Backend

This backend is a Jakarta Servlet API for the current frontend. The frontend files stay untouched; Maven packages them into the WAR so both frontend pages and `/api` run from the same Tomcat app.

## Endpoints

- `POST /api/auth/register` with `fullName`, `phone`, optional `email`, optional `voterId`, and `password`
- `POST /api/auth/login` with `phone` and `password`
- `POST /api/auth/admin/login` with `username` as an admin user's phone number and `password`
- `POST /api/auth/logout`
- `GET /api/users/me`
- `GET /api/candidates`
- `POST /api/votes` with `candidateId`
- `GET /api/results`
- `GET /api/admin/stats`
- `POST /api/admin/candidates`

## Database

In pgAdmin, first run `database/create_database.sql` while connected to the default `postgres` database. Then connect to the new `voting_system` database and run `database/schema.sql`.

The schema creates:

- `users`
- `candidates`
- `votes`

To make an admin account, first register normally from the frontend, then run this in pgAdmin with your registered phone number:

```sql
UPDATE users SET role = 'ADMIN' WHERE mobile = '98XXXXXXXX';
```

The backend defaults to:

- URL: `jdbc:postgresql://localhost:5432/voting_system`
- User: `postgres`
- Password: `postgres`

You can override these without editing source:

- `VOTING_DB_URL`
- `VOTING_DB_USER`
- `VOTING_DB_PASSWORD`

Or with Java properties:

- `-Dvoting.db.url=jdbc:postgresql://localhost:5432/voting_system`
- `-Dvoting.db.user=postgres`
- `-Dvoting.db.password=your_password`

## Build

Install Maven, then run this from the `backend` folder:

```powershell
mvn clean package
```

Deploy `target/online-voting-backend.war` to Tomcat 10 or another Jakarta Servlet 6 compatible server.

Then open:

```text
http://localhost:8080/online-voting-backend/templates/index.html
```

For full setup instructions, see `RUN_STEPS.md`.
