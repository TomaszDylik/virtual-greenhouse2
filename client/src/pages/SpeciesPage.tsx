import React, { useEffect, useState } from 'react';
import { speciesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface Species {
  id: number;
  name: string;
  dryingRate: number;
}

export default function SpeciesPage() {
  const { logout, user } = useAuth();
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [newName, setNewName] = useState('');
  const [newDryingRate, setNewDryingRate] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editDryingRate, setEditDryingRate] = useState('');

  const fetchSpecies = async () => {
    try {
      const res = await speciesApi.getAll();
      setSpeciesList(res.data);
    } catch (error: any) {
      console.error('Failed to fetch species', error);
      alert(error.response?.data?.error || 'Failed to fetch species list.');
    }
  };

  useEffect(() => {
    fetchSpecies();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newDryingRate) {
      alert('Please fill in all fields');
      return;
    }
    try {
      await speciesApi.create({ name: newName, dryingRate: parseFloat(newDryingRate) });
      setNewName('');
      setNewDryingRate('');
      fetchSpecies();
      alert('Species created successfully! 🌿');
    } catch (error: any) {
      console.error('Failed to create species', error);
      alert(error.response?.data?.error || 'Failed to create species. Please try again.');
    }
  };

  const handleEdit = (species: Species) => {
    setEditingId(species.id);
    setEditName(species.name);
    setEditDryingRate(species.dryingRate.toString());
  };

  const handleUpdate = async (id: number) => {
    try {
      await speciesApi.update(id, { 
        name: editName, 
        dryingRate: parseFloat(editDryingRate) 
      });
      setEditingId(null);
      fetchSpecies();
      alert('Species updated successfully! ✅');
    } catch (error: any) {
      console.error('Failed to update species', error);
      alert(error.response?.data?.error || 'Failed to update species. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this species? All plants of this species will be deleted!')) {
      try {
        await speciesApi.delete(id);
        fetchSpecies();
        alert('Species deleted successfully! 🗑️');
      } catch (error: any) {
        console.error('Failed to delete species', error);
        alert(error.response?.data?.error || 'Failed to delete species. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🌱 Species Management</h1>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:underline">← Dashboard</Link>
            <Link to="/logs" className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded">📋 Logs</Link>
            <span>{user?.username}</span>
            <button onClick={logout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        {/* Add Species Form */}
        <form onSubmit={handleCreate} className="bg-white p-4 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-3">Add New Species</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Species name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 border rounded px-3 py-2"
            />
            <input
              type="number"
              step="0.1"
              placeholder="Drying rate"
              value={newDryingRate}
              onChange={(e) => setNewDryingRate(e.target.value)}
              className="w-32 border rounded px-3 py-2"
            />
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Add
            </button>
          </div>
        </form>

        {/* Species List */}
        <div className="bg-white rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Drying Rate (%/hour)</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {speciesList.map((species) => (
                <tr key={species.id} className="border-t">
                  {editingId === species.id ? (
                    <>
                      <td className="p-4">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="number"
                          step="0.1"
                          value={editDryingRate}
                          onChange={(e) => setEditDryingRate(e.target.value)}
                          className="border rounded px-2 py-1 w-24"
                        />
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleUpdate(species.id)}
                          className="text-green-600 hover:text-green-800 mr-3"
                        >
                          ✓ Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ✕ Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-4 font-medium">{species.name}</td>
                      <td className="p-4">{species.dryingRate}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleEdit(species)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(species.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}