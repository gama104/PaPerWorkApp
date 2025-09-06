import React, { useState } from "react";

interface TimePickerProps {
  selectedTime?: string;
  onTimeSelect: (time: string) => void;
  className?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({
  selectedTime,
  onTimeSelect,
  className = "",
}) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customTime, setCustomTime] = useState("");

  // Generate time slots from 7:00 to 19:00 in 15-minute intervals
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 7; hour <= 19; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleTimeSelect = (time: string) => {
    if (time === "custom") {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      onTimeSelect(time);
    }
  };

  const handleCustomTimeSubmit = () => {
    if (customTime) {
      onTimeSelect(customTime);
      setShowCustomInput(false);
    }
  };

  const formatDisplayTime = (time: string) => {
    const [hour, minute] = time.split(":");
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? "PM" : "AM";
    const displayHour =
      hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
    return `${displayHour}:${minute} ${ampm}`;
  };

  return (
    <div className={`relative ${className}`}>
      <select
        value={selectedTime || ""}
        onChange={(e) => handleTimeSelect(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
      >
        <option value="">Select time</option>
        {timeSlots.map((time) => (
          <option key={time} value={time}>
            {formatDisplayTime(time)}
          </option>
        ))}
        <option value="custom">Custom time...</option>
      </select>

      {showCustomInput && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-10">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enter custom time (24-hour format):
          </label>
          <div className="flex gap-2">
            <input
              type="time"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleCustomTimeSubmit}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Set
            </button>
            <button
              onClick={() => setShowCustomInput(false)}
              className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimePicker;
