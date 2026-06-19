# How to Run the Online Voting System

## 1. Install Required Software

- Java JDK 17 or newer
- Apache Maven
- PostgreSQL with pgAdmin
- Apache Tomcat 10.1 or newer
- VS Code Java extensions, if you are using VS Code

Use Tomcat 10+, because this project uses `jakarta.servlet`.

## 2. Create the Database

In pgAdmin, connect to the default PostgreSQL database and run:

```text
backend/database/create_database.sql
```

Then connect to the new `voting_system` database and run:

```text
backend/database/schema.sql
```

The schema creates:

- `users`
- `candidates`
- `votes`

It also inserts demo candidates and one demo admin user.

## 3. Set Local Database Configuration

The backend defaults to:

- Database URL: `jdbc:postgresql://localhost:5432/voting_system`
- Database user: `postgres`

Set your own PostgreSQL password before running Tomcat:

```powershell
$env:VOTING_DB_PASSWORD="your_postgresql_password"
```

Optional overrides:

```powershell
$env:VOTING_DB_URL="jdbc:postgresql://localhost:5432/voting_system"
$env:VOTING_DB_USER="postgres"
```

You can also use Java properties in your Tomcat run configuration:

```text
-Dvoting.db.password=your_postgresql_password
```

## 4. Build the Backend

Open a terminal in the `backend` folder and run:

```powershell
mvn clean package
```

This creates:

```text
backend/target/online-voting-backend.war
```

## 5. Run with Tomcat

Deploy the WAR file to Tomcat:

```text
backend/target/online-voting-backend.war
```

After Tomcat starts, test:

```text
http://localhost:8080/online-voting-backend/api/candidates
```

Then open:

```text
http://localhost:8080/online-voting-backend/templates/index.html
```

Open the frontend through Tomcat for backend testing. Do not open the HTML file directly from Windows when testing login or voting.

## 6. Admin Login

After running `schema.sql`, the demo admin user can log in with any of these identifiers:

```text
admin
admin@voting.local
9800000000
```

Use the seeded demo password only for local testing, then change the admin password before publishing or deployment.

To make another admin:

1. Register normally from the frontend.
2. In pgAdmin, run this with the registered phone number:

```sql
UPDATE users SET role = 'ADMIN' WHERE mobile = '98XXXXXXXX';
```

## 7. Fixing VS Code Red Underlines

If imports like `jakarta.servlet` or `org.postgresql` are red:

1. Make sure Maven is installed.
2. Right-click `backend/pom.xml`.
3. Select Maven reload/update project.
4. Restart VS Code if needed.
