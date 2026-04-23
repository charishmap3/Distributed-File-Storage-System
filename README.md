# Distributed File Storage System

A full-stack web app for uploading a file, splitting it into server-side chunks, storing chunk metadata in MySQL, downloading individual chunks, and reconstructing the original file on download.

## Tech Stack

- Frontend: React.js with Vite, Tailwind CSS, Framer Motion, React Icons, Axios
- Backend: Node.js, Express.js, Multer, Supabase Storage
- Database: MySQL with `mysql2`
- Authentication: JWT and bcrypt

## Project Structure

```text
frontend/
  src/
    components/
      ChunkCard.jsx
      DownloadOptions.jsx
      FileUpload.jsx
      Navbar.jsx
      FeatureCard.jsx
      ProtectedRoute.jsx
    pages/
      Login.jsx
      Signup.jsx
      Dashboard.jsx
      Upload.jsx
      MyFiles.jsx
      Analytics.jsx
    services/
      api.js

backend/
  controllers/
    fileController.js
  database/
    schema.sql
  middleware/
    uploadMiddleware.js
  models/
    fileModel.js
    chunkModel.js
  routes/
    fileRoutes.js
  utils/
    chunkFile.js
    mergeChunks.js
    supabaseStorage.js
  server.js
```

## Database Setup

Create the MySQL database and tables:

```bash
mysql -u root -p < backend/database/schema.sql
```

The schema creates:

- `users`: account records with unique email and hashed password
- `files`: file metadata with `id`, `file_name`, `file_size`, `chunk_count`, and `upload_date`
- `chunks`: chunk metadata with `id`, `file_id`, `chunk_index`, `chunk_path`, and `chunk_size`

## Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Edit `backend/.env` with your MySQL and JWT values:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=distributed_file_storage
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
MAX_UPLOAD_SIZE_BYTES=536870912
CHUNK_SIZE_BYTES=10485760
SUPABASE_URL=your_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_BUCKET=chunks
```

Uploaded chunks are written to the configured Supabase Storage bucket. MySQL stores the Supabase object path in `chunks.chunk_path`.

Use the Supabase `service_role` key only in the backend environment. This project uses its own JWT auth, not Supabase Auth, so Storage uploads made from the Express server will still be treated as anonymous by Supabase if you use the `anon` key, which commonly triggers `new row violates row-level security policy` errors.

## Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

## Upload And Download Flow

1. React sends the selected file to `POST /api/files/upload`.
2. Express receives the file with Multer.
3. `chunkFile.js` slices the file buffer into 10 MB chunks and uploads each chunk to Supabase Storage.
4. MySQL stores the original file row in `files` and ordered Supabase chunk paths in `chunks`.
5. `GET /api/files/chunks/:fileId` returns stored chunk metadata.
6. `GET /api/files/download-chunk/:chunkId` downloads one chunk object from Supabase and returns it.
7. `GET /api/files/download-file/:fileId` downloads all chunk objects by `chunk_index`, merges buffers, and returns the reconstructed file.

## API Routes

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `POST /api/files/upload`
- `GET /api/files/chunks/:fileId`
- `GET /api/files/download-chunk/:chunkId`
- `GET /api/files/download-file/:fileId`
- `GET /api/files/:fileId/download`
- `GET /api/files`
- `DELETE /api/files/:fileId`
- `GET /api/files/analytics`
