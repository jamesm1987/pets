import { memo } from "react";

interface MedicalRecordCardProps {
    id: number;
    name: string;
    record_type: "vaccine"| "allergy";
    date?: string;
    severity?: "mild" | "severe";
    reactions?: string;
    onEdit?: (id: number) => void;
    onDelete?: (id: number) => void;  
}

function MedicalRecordCard({
    id,
    name,
    record_type,
    date,
    severity,
    reactions,
    onEdit,
    onDelete,
}: MedicalRecordCardProps) {
    const isVaccine = record_type === "vaccine";
    const isAllergy = record_type === "allergy";

    const handleEdit = () => {
        onEdit?.(id);
    };

    const handleDelete = () => {
        onEdit?.(id);
    };

    return (
        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p className="font-semibold">{name}</p>

                    {isVaccine && date && (
                        <p className="text-sm text-gray-600 mt-1">
                            Date: {new Date(date).toLocaleDateString()}
                        </p>
                    )}

                    {isAllergy && severity && (
                        <p className="text-sm text-gray-600 mt-1">
                            Severity:{" "}
                            <span 
                                className={`font-semibold ${
                                    severity === 'severe' ? "text-red-600" : "text-yellow-600"
                                }`}
                            >
                                {severity.toUpperCase()}
                            </span>
                        </p>
                    )}

                    {isAllergy && date && (
                        <p className="text-sm text-gray-600 mt-1">
                            Date: { new Date(date).toLocaleDateString()}
                        </p>
                    )}

                    {reactions && (
                        <p className="text-sm text-gray-600 mt-1">Reactions: {reactions}</p>
                    )}      
                </div>
                <div className="flex gap-2 ml-4">
                    {onEdit && (
                        <button
                            onClick={handleEdit}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                            Edit
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={handleDelete}
                            className="text-red-600 hover:text-red-700 text-sm"
                        >
                            Delete
                        </button>
                    )}                    
                </div>
            </div>            
        </div>
    );
}

export default memo(MedicalRecordCard);