import { useState, useEffect } from 'react';
import { logsApi } from '../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LogsPage() {
  const { logout, user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    logsApi.getAll(search || undefined).then((res) => setLogs(res.data));
  }, [search]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">📋 System Logs</h1>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:underline">← Dashboard</Link>
            <Link to="/species" className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">🌿 Species</Link>
            <span>{user?.username}</span>
            <button onClick={logout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded">
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Search Logs</h2>

      <input
        type="text"
        placeholder="Search logs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="p-3 border rounded mb-6 w-full focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      <div className="bg-white rounded-lg shadow">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No logs found. {search && 'Try a different search term.'}
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="p-4 border-b last:border-b-0 hover:bg-gray-50">
              <span className={`font-bold ${log.level === 'CRITICAL' ? 'text-red-500' : log.level === 'ERROR' ? 'text-orange-500' : 'text-blue-500'}`}>
                [{log.level}]
              </span>
              <span className="ml-2">{log.message}</span>
              {log.plant && (
                <span className="ml-2 text-green-600">
                  - Plant: {log.plant.name}
                </span>
              )}
              <span className="text-gray-400 text-sm ml-2 block mt-1">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
      </main>
    </div>
  );
}