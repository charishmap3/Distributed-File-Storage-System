const { uploadChunkToCloud } = require('./supabaseStorage');

const TEN_MB = 10 * 1024 * 1024;
const DEFAULT_CHUNK_SIZE = Number(process.env.CHUNK_SIZE_BYTES || TEN_MB);

const chunkFile = async ({ fileId, fileBuffer, chunkSize = DEFAULT_CHUNK_SIZE }) => {
  const chunks = [];

  // 10 MB chunks reduce metadata overhead, create fewer stored rows/files, cut
  // down chunk-level API/download operations, and make reconstruction faster
  // because the backend reads fewer chunk files.
  for (let offset = 0, chunkIndex = 1; offset < fileBuffer.length; offset += chunkSize, chunkIndex += 1) {
    const chunkBuffer = fileBuffer.subarray(offset, Math.min(offset + chunkSize, fileBuffer.length));
    const chunkName = `files/${fileId}/file${fileId}_chunk_${chunkIndex}`;

    // Store each chunk in Supabase Storage and keep only the returned object
    // path in MySQL. This replaces local disk writes.
    const chunkPath = await uploadChunkToCloud(chunkBuffer, chunkName);

    chunks.push({
      chunkIndex,
      chunkPath,
      chunkSize: chunkBuffer.length
    });
  }

  return chunks;
};

module.exports = {
  DEFAULT_CHUNK_SIZE,
  chunkFile
};
