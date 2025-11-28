import { memo } from "react";

interface PetInfoCardProps {
    name: string;
    animal_type: string;
    owner_name: string;
    date_of_birth: string;
}

function PetInfoCard({ 
    name, 
    animal_type, 
    owner_name, 
    date_of_birth
}: PetInfoCardProps) {
    const calculateAge = (dateOfBirth: string): number => {
        return Math.floor(
            (new Date().getTime() - new Date(dateOfBirth).getTime()) /
            (1000 * 60 * 60 * 24 * 365)
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold mb-4">{name}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p className="text-gray-600 text-sm">Animal Type</p>
                    <p className="text-lg font-semibold capitalize">{animal_type}</p>
                </div>

                <div>
                    <p className="text-gray-600 text-sm">Owner Name</p>
                    <p className="text-lg font-semibold">{owner_name}</p>
                </div>

                <div>
                    <p className="text-gray-600 text-sm">Date of Birth</p>
                    <p className="text-lg font-semibold">
                        {new Date(date_of_birth).toLocaleDateString()}
                    </p>
                </div>   

                <div>
                    <p className="text-gray-600 text-sm">Age</p>
                    <p className="text-lg font-semibold">
                        {calculateAge(date_of_birth)} years old
                    </p>
                </div>                                  
            </div>
        </div>
    );
}

export default memo(PetInfoCard);