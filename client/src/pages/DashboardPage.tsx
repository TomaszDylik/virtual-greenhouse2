import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { plantsApi, speciesApi } from '../services/api';
import PlantCard from '../components/PlantCard';

const socket = io('http://localhost:4000');

export default function DashboardPage() {
  const [plants, setPlants] = useState<any[]>([]);
  const [species, setSpecies] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [newPlant, setNewPlant] = useState({ name: '', speciesId: 0 });

  const loadPlants = async () => {
    const res = await plantsApi.getAll(search || undefined);
    setPlants(res.data);
  };

  const loadSpecies = async () => {
    const res = await speciesApi.getAll();
    setSpecies(res.data);
  };

  useEffect(() => {
    loadPlants();
    loadSpecies();

    socket.on('plant-update', (data) => {
      setPlants((prev) =>
        prev.map((p) =>
          p.id === data.plantId
            ? { ...p, currentWater: data.waterLevel, isDead: data.isDead }
            : p
        )
      );
    });

    socket.on('plant-died', (data) => {
      alert(`Plant "${data.name}" has died!`);
    });

    return () => {
      socket.off('plant-update');
      socket.off('plant-died');
    };
  }, [search]);

  const handleWater = async (id: number) => {
    await plantsApi.water(id);
    loadPlants();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this plant?')) {
      await plantsApi.delete(id);
      loadPlants();
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlant.name || !newPlant.speciesId) return;
    await plantsApi.create(newPlant);
    setNewPlant({ name: '', speciesId: 0 });
    loadPlants();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">🌿 My Plants</h1>

      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Search plants..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded flex-1"
        />
      </div>

      <form onSubmit={handleCreate} className="mb-6 p-4 bg-white rounded shadow">
        <h2 className="font-bold mb-2">Add New Plant</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Plant name"
            value={newPlant.name}
            onChange={(e) => setNewPlant({ ...newPlant, name: e.target.value })}
            className="p-2 border rounded flex-1"
          />
          <select
            value={newPlant.speciesId}
            onChange={(e) => setNewPlant({ ...newPlant, speciesId: Number(e.target.value) })}
            className="p-2 border rounded"
          >
            <option value={0}>Select species</option>
            {species.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <button className="bg-green-600 text-white px-4 rounded">Add</button>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plants.map((plant) => (
          <PlantCard
            key={plant.id}
            plant={plant}
            onWater={handleWater}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}