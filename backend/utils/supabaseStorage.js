const { requireSupabaseConfig, supabase, supabaseBucket } = require('../config/supabase');

const uploadChunkToCloud = async (chunkBuffer, chunkName) => {
  requireSupabaseConfig();

  // Chunks are stored in Supabase Storage so the API server stays stateless and
  // does not depend on a local uploads folder surviving restarts/deployments.
  const { data, error } = await supabase.storage.from(supabaseBucket).upload(chunkName, chunkBuffer, {
    contentType: 'application/octet-stream',
    upsert: true
  });

  if (error) {
    throw new Error(`Supabase chunk upload failed: ${error.message}`);
  }

  return data.path;
};

const downloadChunkFromCloud = async (chunkPath) => {
  requireSupabaseConfig();

  const { data, error } = await supabase.storage.from(supabaseBucket).download(chunkPath);

  if (error) {
    throw new Error(`Supabase chunk download failed: ${error.message}`);
  }

  if (Buffer.isBuffer(data)) {
    return data;
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

const deleteChunksFromCloud = async (chunkPaths) => {
  if (!chunkPaths.length) return;

  requireSupabaseConfig();

  const { error } = await supabase.storage.from(supabaseBucket).remove(chunkPaths);

  if (error) {
    throw new Error(`Supabase chunk cleanup failed: ${error.message}`);
  }
};

module.exports = {
  uploadChunkToCloud,
  downloadChunkFromCloud,
  deleteChunksFromCloud
};
