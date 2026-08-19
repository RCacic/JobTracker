-- Job Tracker Database Schema
-- Run this file to set up your database:
-- mysql -u root -p < database/schema.sql

CREATE DATABASE IF NOT EXISTS job_tracker;
USE job_tracker;

CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  company      VARCHAR(200) NOT NULL,
  role         VARCHAR(200) NOT NULL,
  status       ENUM('Applied','Interview','Technical Test','Offer','Rejected') DEFAULT 'Applied',
  date_applied DATE,
  notes        TEXT,
  url          VARCHAR(500),
  source       VARCHAR(100),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS timeline_entries (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  job_id     INT NOT NULL,
  status     ENUM('Applied','Interview','Technical Test','Offer','Rejected') NOT NULL,
  entry_date DATE NOT NULL,
  note       TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);
