import React, { useState } from 'react';

interface Species {
  id: number;
  name: string;
  dryingRate: number;
}

interface AddPlantFormProps {
  species: Species[];
  onAdd: (name: string, speciesId: number) => void;
}

export default function AddPlantForm({ species, onAdd }: AddPlantFormProps) {
  const [name, setName] = useState('');
  const [speciesId, setSpeciesId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !speciesId) {
      alert('Please fill all fields');
      return;
    }
    onAdd(name, parseInt(speciesId));
    setName('');
    setSpeciesId('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4 text-green-700">➕ Add New Plant</h2>
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Plant name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <select
          value={speciesId}
          onChange={(e) => setSpeciesId(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Select species</option>
          {species.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} (drying: {s.dryingRate}%/h)
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded transition"
        >
          Add Plant
        </button>
      </div>
    </form>
  );
}
