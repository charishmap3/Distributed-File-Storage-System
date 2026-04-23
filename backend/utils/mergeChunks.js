const { downloadChunkFromCloud } = require('./supabaseStorage');

const mergeChunks = async (chunks) => {
  const orderedChunks = [...chunks].sort((first, second) => first.chunk_index - second.chunk_index);

  // Download chunk objects from Supabase in metadata order and concatenate them
  // into the original file buffer.
  const buffers = await Promise.all(
    orderedChunks.map((chunk) => downloadChunkFromCloud(chunk.chunk_path))
  );

  return Buffer.concat(buffers);
};

module.exports = mergeChunks;
