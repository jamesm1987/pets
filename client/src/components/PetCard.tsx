import { memo } from "react";
import { useNavigate } from "react-router-dom";

interface PetCardProps {
  id: number;
  name: string;
  animal_type: string;
  owner_name: string;
  date_of_birth: string;
}

function PetCard({
  id,
  name,
  animal_type,
  owner_name,
  date_of_birth,
}: PetCardProps) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/pets/${id}`);
  };

  const handleEdit = () => {
    navigate(`/pets/${id}/edit`);
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold">{name}</h2>
            <p className="text-gray-600 capitalize">{animal_type}</p>
          </div>
        </div>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <span className="font-medium">Owner:</span> {owner_name}
          </p>
          <p>
            <span className="font-medium">Date of Birth:</span>{" "}
            {new Date(date_of_birth).toLocaleDateString()}
          </p>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleViewDetails}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            View Details
          </button>
          <button
            onClick={handleEdit}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(PetCard);