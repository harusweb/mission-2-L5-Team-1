# Run the sample SQL to retrieve Computer Science students

This folder contains `sql/retrieve_cs_students.sql`, which includes a small schema, sample data, and three queries that show how to retrieve students in the Computer Science department.

Quick run (using MySQL client):

1. Create or choose a database (example uses `mydb`):

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS mydb;"
```

2. Load the SQL file into the database:

```bash
mysql -u root -p mydb < "sql/retrieve_cs_students.sql"
```

3. Or run interactively:

```bash
mysql -u root -p mydb
mysql> SOURCE sql/retrieve_cs_students.sql;
```

Replace `root` and `mydb` with your MySQL user and database name as needed.
