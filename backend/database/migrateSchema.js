const pool = require('../config/db');

const getColumns = async (tableName) => {
  const [rows] = await pool.execute(
    `SELECT COLUMN_NAME, IS_NULLABLE
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [tableName]
  );

  return new Map(rows.map((row) => [row.COLUMN_NAME, row]));
};

const ensureLocalChunkSchema = async () => {
  const columns = await getColumns('chunks');

  if (!columns.size) {
    return;
  }

  // Older versions stored S3 metadata. Add the local chunk columns used by the
  // current upload/download flow without deleting any existing rows.
  if (!columns.has('chunk_path')) {
    await pool.execute('ALTER TABLE chunks ADD COLUMN chunk_path VARCHAR(1024) NULL AFTER chunk_index');
  }

  if (!columns.has('chunk_size')) {
    await pool.execute(
      'ALTER TABLE chunks ADD COLUMN chunk_size BIGINT UNSIGNED NULL AFTER chunk_path'
    );
  }

  if (columns.has('s3_location') && columns.get('s3_location').IS_NULLABLE === 'NO') {
    await pool.execute('ALTER TABLE chunks MODIFY COLUMN s3_location VARCHAR(1024) NULL');
  }
};

module.exports = {
  ensureLocalChunkSchema
};
