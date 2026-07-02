-- ============================================================
-- Grand3Sunggal Database Schema
-- Run this script after creating the database:
--   CREATE DATABASE grand3sunggal_db;
--   USE grand3sunggal_db;
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED    AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)    NOT NULL,
  email       VARCHAR(150)    NOT NULL UNIQUE,
  password    VARCHAR(255)    NOT NULL,
  role        ENUM('user', 'admin') DEFAULT 'user',
  created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Example seed data (password: "password123" hashed)
-- INSERT INTO users (name, email, password, role) VALUES
--   ('Admin', 'admin@example.com', '$2a$12$...', 'admin');
