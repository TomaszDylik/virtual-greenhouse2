interface Props {
  plant: {
    id: number;
    name: string;
    currentWater: number;
    isDead: boolean;
    species: { name: string };
  };
  onWater: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function PlantCard({ plant, onWater, onDelete }: Props) {
  const waterColor =
    plant.isDead ? 'bg-gray-400' :
    plant.currentWater > 50 ? 'bg-green-500' :
    plant.currentWater > 20 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${plant.isDead ? 'opacity-50' : ''}`}>
      <h3 className="font-bold text-lg">{plant.name}</h3>
      <p className="text-gray-600 text-sm">{plant.species.name}</p>
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded h-4">
          <div
            className={`h-4 rounded ${waterColor}`}
            style={{ width: `${plant.currentWater}%` }}
          />
        </div>
        <p className="text-sm mt-1">{plant.currentWater.toFixed(0)}% water</p>
      </div>
      {plant.isDead ? (
        <p className="text-red-500 font-bold mt-2">💀 DEAD</p>
      ) : (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onWater(plant.id)}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
          >
            💧 Water
          </button>
          <button
            onClick={() => onDelete(plant.id)}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}