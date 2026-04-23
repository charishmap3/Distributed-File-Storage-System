import { FaCube, FaDownload, FaSpinner } from 'react-icons/fa';

const formatBytes = (bytes) => {
  const size = Number(bytes);
  if (!size) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const unitIndex = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  return `${(size / 1024 ** unitIndex).toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
};

const ChunkCard = ({ chunk, isDownloading, onDownload }) => {
  return (
    <article className="rounded-md border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-950">
            <FaCube className="shrink-0 text-teal-600" />
            <span>Chunk {chunk.chunk_index}</span>
          </div>
          <p className="mt-2 text-sm text-slate-600">Size: {formatBytes(chunk.chunk_size)}</p>
        </div>

        <button
          type="button"
          onClick={() => onDownload(chunk)}
          disabled={isDownloading}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-slate-950 text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          aria-label={`Download chunk ${chunk.chunk_index}`}
          title={`Download chunk ${chunk.chunk_index}`}
        >
          {isDownloading ? <FaSpinner className="animate-spin" /> : <FaDownload />}
        </button>
      </div>
    </article>
  );
};

export default ChunkCard;
