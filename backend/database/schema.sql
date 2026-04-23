CREATE DATABASE IF NOT EXISTS distributed_file_storage
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE distributed_file_storage;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT UNSIGNED NOT NULL,
  chunk_count INT UNSIGNED NOT NULL,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_files_user_id (user_id),
  CONSTRAINT fk_files_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS chunks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  file_id INT NOT NULL,
  chunk_index INT UNSIGNED NOT NULL,
  chunk_path VARCHAR(1024) NOT NULL,
  chunk_size BIGINT UNSIGNED NOT NULL,
  UNIQUE KEY unique_file_chunk (file_id, chunk_index),
  INDEX idx_chunks_file_id (file_id),
  CONSTRAINT fk_chunks_file
    FOREIGN KEY (file_id) REFERENCES files(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;
