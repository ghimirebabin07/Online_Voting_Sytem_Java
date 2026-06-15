# How to Run the Online Voting System

## 1. Install required software

Install these once:

- Java JDK 17 or newer
- Apache Maven
- PostgreSQL with pgAdmin
- Apache Tomcat 10.1 or newer
- VS Code extensions:
  - Extension Pack for Java
  - Community Server Connectors, or another Tomcat runner

Important: use Tomcat 10+, not Tomcat 9. This backend uses `jakarta.servlet`, and Tomcat 9 uses the older `javax.servlet`.

## 2. Open the correct folder in VS Code

Open this folder:

```text
D:\First Java Project
```

Then wait for VS Code to import the Maven project. If it asks to update/import Java configuration, click **Yes**.

## 3. Create the database in pgAdmin

Open pgAdmin.

First, connect to the default `postgres` database and run:

```text
D:\First Java Project\Online_Voting_Sytem_Java\backend\database\create_database.sql
```

Then connect to the new `voting_system` database and run:

```text
D:\First Java Project\Online_Voting_Sytem_Java\backend\database\schema.sql
```

## 4. Set your database password

The backend default database settings are:

- database: `voting_system`
- username: `postgres`
- password: `postgres`

If your PostgreSQL password is different, set this environment variable before running Tomcat:

```powershell
$env:VOTING_DB_PASSWORD="your_pgadmin_password"
```

You can also edit the Tomcat run configuration and add this Java option:

```text
-Dvoting.db.password=your_pgadmin_password
```

## 5. Build the backend

Open a terminal in:

```text
D:\First Java Project\Online_Voting_Sytem_Java\backend
```

Run:

```powershell
mvn clean package
```

This creates:

```text
D:\First Java Project\Online_Voting_Sytem_Java\backend\target\online-voting-backend.war
```

## 6. Run with Tomcat

Deploy this WAR file to Tomcat:

```text
backend\target\online-voting-backend.war
```

After Tomcat starts, test the backend in your browser:

```text
http://localhost:8080/online-voting-backend/api/candidates
```

You should see candidate data in JSON format.

## 7. Open the frontend

Open the frontend through Tomcat:

```text
http://localhost:8080/online-voting-backend/templates/index.html
```

Do not open the HTML file directly from Windows for backend testing. The frontend now calls `/api/...`, so it should be opened from the same Tomcat URL as the backend.

## 8. Create an admin login

Register one normal user from the frontend. Then in pgAdmin, run this with that user's phone number:

```sql
UPDATE users SET role = 'ADMIN' WHERE mobile = '98XXXXXXXX';
```

After that, use the admin login page. Put the same phone number in the username field and use the password you chose during registration.

## Fixing red underlines in VS Code

If imports like `jakarta.servlet` or `org.postgresql` are red:

1. Make sure Maven is installed.
2. In VS Code, right-click `backend/pom.xml`.
3. Select **Update Project** or **Reload Project**.
4. Open Command Palette and run **Java: Clean Java Language Server Workspace**.
5. Restart VS Code.

If the red underline says `package jakarta.servlet does not exist`, Maven dependencies have not downloaded yet.
