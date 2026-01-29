import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { plantsApi, speciesApi } from '../services/api';
import PlantCard from '../components/PlantCard';
import AddPlantForm from '../components/AddPlantForm';

interface Plant {
  id: number;
  name: string;
  currentWater: number;
  isDead: boolean;
  species: { id: number; name: string; dryingRate: number };
}

interface Species {
  id: number;
  name: string;
  dryingRate: number;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [deadPlants, setDeadPlants] = useState<Plant[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [plantsRes, deadRes, speciesRes] = await Promise.all([
        plantsApi.getAll(),
        plantsApi.getDead(),
        speciesApi.getAll(),
      ]);
      setPlants(plantsRes.data);
      setDeadPlants(deadRes.data);
      setSpecies(speciesRes.data);
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this plant? A log will be created.')) {
      try {
        await plantsApi.delete(id);
        fetchData();
      } catch (error) {
        console.error('Failed to delete plant');
      }
    }
  };

  const handleAddPlant = async (name: string, speciesId: number) => {
    try {
      await plantsApi.create({ name, speciesId });
      fetchData();
    } catch (error) {
      console.error('Failed to add plant');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-green-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🌱 Virtual Greenhouse</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {user?.username}!</span>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        {/* Add Plant Form */}
        <AddPlantForm species={species} onAdd={handleAddPlant} />

        {/* Alive Plants Section */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-green-700">
            🌿 Your Plants ({plants.length})
          </h2>
          {plants.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
              You don't have any plants yet. Add your first plant above!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plants.map((plant) => (
                <PlantCard
                  key={plant.id}
                  plant={plant}
                  onDelete={() => handleDelete(plant.id)}
                  onWater={fetchData}
                />
              ))}
            </div>
          )}
        </section>

        {/* Dead Plants Section */}
        {deadPlants.length > 0 && (
          <section className="mt-8 border-t-2 border-gray-300 pt-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-600">
              💀 Dead Plants ({deadPlants.length})
            </h2>
            <div className="bg-gray-200 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deadPlants.map((plant) => (
                  <div
                    key={plant.id}
                    className="bg-gray-100 border border-gray-400 rounded-lg p-4 opacity-70"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-600 line-through">
                          {plant.name}
                        </h3>
                        <p className="text-sm text-gray-500">{plant.species.name}</p>
                        <p className="text-xs text-red-500 mt-1">☠️ This plant has died</p>
                      </div>
                      <button
                        onClick={() => handleDelete(plant.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}