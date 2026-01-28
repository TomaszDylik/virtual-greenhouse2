import { useState, useEffect } from 'react';
import { logsApi } from '../services/api';

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    logsApi.getAll(search || undefined).then((res) => setLogs(res.data));
  }, [search]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">📋 Logs</h1>

      <input
        type="text"
        placeholder="Search logs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="p-2 border rounded mb-4 w-full"
      />

      <div className="bg-white rounded shadow">
        {logs.map((log) => (
          <div key={log.id} className="p-3 border-b">
            <span className={`font-bold ${log.level === 'CRITICAL' ? 'text-red-500' : 'text-blue-500'}`}>
              [{log.level}]
            </span>
            <span className="ml-2">{log.message}</span>
            <span className="text-gray-400 text-sm ml-2">
              {new Date(log.createdAt).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}