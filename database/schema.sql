-- ============================================================
-- PrepPulse Database Schema
-- Version 1.0
-- ============================================================

CREATE DATABASE IF NOT EXISTS preppulse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE preppulse;

-- ============================================================
-- Users Table
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,
  exam_name   VARCHAR(100)  NOT NULL,
  exam_date   DATE          NOT NULL,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- Tasks Table
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT          NOT NULL,
  task_title   VARCHAR(255) NOT NULL,
  is_completed TINYINT(1)   DEFAULT 0,
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- Study Sessions Table
-- ============================================================
CREATE TABLE IF NOT EXISTS study_sessions (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT          NOT NULL,
  subject_name  VARCHAR(100) NOT NULL,
  study_hours   INT          NOT NULL DEFAULT 0,
  study_minutes INT          NOT NULL DEFAULT 0,
  session_date  DATE         NOT NULL,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- Streak Table
-- ============================================================
CREATE TABLE IF NOT EXISTS streaks (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT  NOT NULL UNIQUE,
  current_streak   INT  DEFAULT 0,
  longest_streak   INT  DEFAULT 0,
  last_study_date  DATE,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX idx_tasks_user_id       ON tasks(user_id);
CREATE INDEX idx_tasks_created_at    ON tasks(created_at);
CREATE INDEX idx_sessions_user_id    ON study_sessions(user_id);
CREATE INDEX idx_sessions_date       ON study_sessions(session_date);
CREATE INDEX idx_streaks_user_id     ON streaks(user_id);
