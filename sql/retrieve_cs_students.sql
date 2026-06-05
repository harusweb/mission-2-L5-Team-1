-- Sample schema, test data, and queries to retrieve Computer Science students

-- Create tables
CREATE TABLE IF NOT EXISTS Departments (
  DepartmentId INT PRIMARY KEY,
  DepartmentName VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS students (
  StudentId INT PRIMARY KEY,
  StudentName VARCHAR(100) NOT NULL,
  DepartmentId INT,
  FOREIGN KEY (DepartmentId) REFERENCES Departments(DepartmentId)
);

-- Sample data
INSERT INTO Departments (DepartmentId, DepartmentName) VALUES
  (1, 'Computer Science'),
  (2, 'Mathematics');

INSERT INTO students (StudentId, StudentName, DepartmentId) VALUES
  (101, 'Alice', 1),
  (102, 'Bob', 1),
  (103, 'Carol', 2);

-- 1) Basic query: students in Computer Science
SELECT s.StudentId, s.StudentName
FROM students s
JOIN Departments d ON s.DepartmentId = d.DepartmentId
WHERE d.DepartmentName = 'Computer Science';

-- 2) Case-insensitive match
SELECT s.StudentId, s.StudentName
FROM students s
JOIN Departments d ON s.DepartmentId = d.DepartmentId
WHERE LOWER(d.DepartmentName) = 'computer science';

-- 3) Include department name in results
SELECT s.StudentId, s.StudentName, d.DepartmentName
FROM students s
JOIN Departments d ON s.DepartmentId = d.DepartmentId
WHERE d.DepartmentName = 'Computer Science';
