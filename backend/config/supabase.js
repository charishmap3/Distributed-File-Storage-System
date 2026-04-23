const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabaseBucket = process.env.SUPABASE_BUCKET || 'chunks';

const decodeJwtPayload = (token) => {
  if (!token) return null;

  try {
    const [, payloadSegment] = token.split('.');
    if (!payloadSegment) return null;

    return JSON.parse(Buffer.from(payloadSegment, 'base64url').toString('utf-8'));
  } catch (error) {
    return null;
  }
};

const supabaseRole = decodeJwtPayload(supabaseKey)?.role;

const requireSupabaseConfig = () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'SUPABASE_URL and a backend Supabase key must be configured. Set SUPABASE_SERVICE_ROLE_KEY for server-side Storage uploads.'
    );
  }
};

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

if (supabaseRole === 'anon') {
  console.warn(
    'SUPABASE_KEY is using the anon role. Server-side Storage uploads can fail with row-level security. Prefer SUPABASE_SERVICE_ROLE_KEY in backend/.env.'
  );
}

module.exports = {
  supabase,
  supabaseBucket,
  requireSupabaseConfig
};
