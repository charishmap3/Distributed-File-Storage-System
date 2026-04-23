const pool = require('../config/db');

const createOrUpdateChunk = async ({ fileId, chunkIndex, chunkPath, chunkSize }) => {
  const [result] = await pool.execute(
    `INSERT INTO chunks (file_id, chunk_index, chunk_path, chunk_size)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       chunk_path = VALUES(chunk_path),
       chunk_size = VALUES(chunk_size)`,
    [fileId, chunkIndex, chunkPath, chunkSize]
  );
  return result.insertId;
};

const createChunks = async (chunks) => {
  if (!chunks.length) return 0;

  const values = chunks.map((chunk) => [
    chunk.fileId,
    chunk.chunkIndex,
    chunk.chunkPath,
    chunk.chunkSize
  ]);

  const [result] = await pool.query(
    `INSERT INTO chunks (file_id, chunk_index, chunk_path, chunk_size)
     VALUES ?
     ON DUPLICATE KEY UPDATE
       chunk_path = VALUES(chunk_path),
       chunk_size = VALUES(chunk_size)`,
    [values]
  );

  return result.affectedRows;
};

const getChunksByFile = async (fileId) => {
  const [rows] = await pool.execute(
    `SELECT id, file_id, chunk_index, chunk_path, chunk_size
     FROM chunks
     WHERE file_id = ?
     ORDER BY chunk_index ASC`,
    [fileId]
  );
  return rows;
};

const getChunkByIdForUser = async (chunkId, userId) => {
  const [rows] = await pool.execute(
    `SELECT
       chunks.id,
       chunks.file_id,
       chunks.chunk_index,
       chunks.chunk_path,
       chunks.chunk_size,
       files.file_name,
       files.user_id
     FROM chunks
     INNER JOIN files ON files.id = chunks.file_id
     WHERE chunks.id = ? AND files.user_id = ?`,
    [chunkId, userId]
  );

  return rows[0];
};

const deleteChunksByFile = async (fileId) => {
  const [result] = await pool.execute('DELETE FROM chunks WHERE file_id = ?', [fileId]);
  return result.affectedRows;
};

module.exports = {
  createOrUpdateChunk,
  createChunks,
  getChunksByFile,
  getChunkByIdForUser,
  deleteChunksByFile
};
