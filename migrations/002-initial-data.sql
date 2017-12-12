-- Up

INSERT INTO Courses (id, name, description) VALUES (1, "Technology", "Technological stuff");
INSERT INTO Courses (id, name, description) VALUES (2, "Business", "Business stuff");

-- Down

DELETE FROM Courses WHERE id IN (1, 2);
