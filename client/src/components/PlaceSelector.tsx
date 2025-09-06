import React, { useState } from "react";

interface PlaceSelectorProps {
  selectedPlace?: string;
  selectedSchool?: string;
  onPlaceSelect: (place: string, school?: string) => void;
  className?: string;
}

const PlaceSelector: React.FC<PlaceSelectorProps> = ({
  selectedPlace,
  selectedSchool,
  onPlaceSelect,
  className = "",
}) => {
  const [showSchoolOptions, setShowSchoolOptions] = useState(
    selectedPlace === "Escuela"
  );

  const places = ["Centro", "Virtual", "Escuela"];

  const schools = [
    "Escuela Primaria Central",
    "Escuela Secundaria Norte",
    "Instituto Tecnológico",
    "Colegio San Juan",
    "Escuela María Montessori",
    "Instituto Bilingüe",
  ];

  const handlePlaceChange = (place: string) => {
    if (place === "Escuela") {
      setShowSchoolOptions(true);
      onPlaceSelect(place, selectedSchool);
    } else {
      setShowSchoolOptions(false);
      onPlaceSelect(place);
    }
  };

  const handleSchoolChange = (school: string) => {
    onPlaceSelect("Escuela", school);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Place selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Location
        </label>
        <select
          value={selectedPlace || ""}
          onChange={(e) => handlePlaceChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
        >
          <option value="">Select location</option>
          {places.map((place) => (
            <option key={place} value={place}>
              {place}
            </option>
          ))}
        </select>
      </div>

      {/* School selector (only shown when Escuela is selected) */}
      {showSchoolOptions && (
        <div className="pl-4 border-l-2 border-blue-200 dark:border-blue-800">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select School
          </label>
          <select
            value={selectedSchool || ""}
            onChange={(e) => handleSchoolChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          >
            <option value="">Select school</option>
            {schools.map((school) => (
              <option key={school} value={school}>
                {school}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Display selected location */}
      {selectedPlace && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Selected: {selectedPlace}
          {selectedPlace === "Escuela" &&
            selectedSchool &&
            ` - ${selectedSchool}`}
        </div>
      )}
    </div>
  );
};

export default PlaceSelector;
