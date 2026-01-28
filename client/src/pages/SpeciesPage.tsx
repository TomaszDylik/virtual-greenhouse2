import { useState, useEffect } from 'react';
import { speciesApi } from '../services/api';

export default function SpeciesPage() {
  const [species, setSpecies] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [newSpecies, setNewSpecies] = useState({ name: '', dryingRate: 1 });

  const load = async () => {
    const res = await speciesApi.getAll(search || undefined);
    setSpecies(res.data);
  };

  useEffect(() => { load(); }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpecies.name) return;
    await speciesApi.create(newSpecies);
    setNewSpecies({ name: '', dryingRate: 1 });
    load();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete species?')) {
      await speciesApi.delete(id);
      load();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">🌱 Species</h1>

      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="p-2 border rounded mb-4 w-full"
      />

      <form onSubmit={handleCreate} className="mb-6 p-4 bg-white rounded shadow">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Species name"
            value={newSpecies.name}
            onChange={(e) => setNewSpecies({ ...newSpecies, name: e.target.value })}
            className="p-2 border rounded flex-1"
          />
          <input
            type="number"
            step="0.1"
            placeholder="Drying rate"
            value={newSpecies.dryingRate}
            onChange={(e) => setNewSpecies({ ...newSpecies, dryingRate: Number(e.target.value) })}
            className="p-2 border rounded w-32"
          />
          <button className="bg-green-600 text-white px-4 rounded">Add</button>
        </div>
      </form>

      <div className="bg-white rounded shadow">
        {species.map((s) => (
          <div key={s.id} className="p-4 border-b flex justify-between items-center">
            <div>
              <span className="font-bold">{s.name}</span>
              <span className="text-gray-500 ml-2">(drying: {s.dryingRate}/s)</span>
            </div>
            <button
              onClick={() => handleDelete(s.id)}
              className="text-red-500"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}