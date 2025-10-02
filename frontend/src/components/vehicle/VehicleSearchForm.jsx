import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextInput, Select, Label } from "flowbite-react";
import {
  HiSearch,
  HiOutlineCalendar,
  HiOutlineLocationMarker,
  HiOutlineUsers,
} from "react-icons/hi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const VehicleSearchForm = ({ className, onSearch, showLabels = false }) => {
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [persons, setPersons] = useState("");
  const [category, setCategory] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const searchParams = new URLSearchParams();

    if (location) searchParams.append("location", location);
    if (startDate)
      searchParams.append("startDate", startDate.toISOString().split("T")[0]);
    if (endDate)
      searchParams.append("endDate", endDate.toISOString().split("T")[0]);
    if (persons) searchParams.append("persons", persons);
    if (category) searchParams.append("category", category);

    const queryString = searchParams.toString();

    if (onSearch) {
      onSearch({
        location,
        startDate,
        endDate,
        persons: persons ? parseInt(persons) : undefined,
        category,
      });
    } else {
      navigate(`/vehicles?${queryString}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className || "space-y-4"}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          {showLabels && (
            <Label htmlFor="location" className="mb-1 block">
              Standort
            </Label>
          )}
          <div className="relative">
            <TextInput
              id="location"
              type="text"
              placeholder="Wo möchten Sie mieten?"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              icon={HiOutlineLocationMarker}
              className="w-full"
            />
          </div>
        </div>

        <div>
          {showLabels && (
            <Label htmlFor="startDate" className="mb-1 block">
              Abholdatum
            </Label>
          )}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
              <HiOutlineCalendar className="text-gray-500" />
            </div>
            <DatePicker
              id="startDate"
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              minDate={new Date()}
              dateFormat="dd.MM.yyyy"
              placeholderText="Abholdatum"
              className="block w-full pl-10 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          {showLabels && (
            <Label htmlFor="endDate" className="mb-1 block">
              Rückgabedatum
            </Label>
          )}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
              <HiOutlineCalendar className="text-gray-500" />
            </div>
            <DatePicker
              id="endDate"
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate || new Date()}
              dateFormat="dd.MM.yyyy"
              placeholderText="Rückgabedatum"
              className="block w-full pl-10 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          {showLabels && (
            <Label htmlFor="persons" className="mb-1 block">
              Personen
            </Label>
          )}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <HiOutlineUsers className="text-gray-500" />
            </div>
            <Select
              id="persons"
              value={persons}
              onChange={(e) => setPersons(e.target.value)}
              className="pl-10"
            >
              <option value="">Personen</option>
              <option value="1">1 Person</option>
              <option value="2">2 Personen</option>
              <option value="3">3 Personen</option>
              <option value="4">4 Personen</option>
              <option value="5">5 Personen</option>
              <option value="6">6+ Personen</option>
            </Select>
          </div>
        </div>

        <div>
          {showLabels && (
            <Label htmlFor="category" className="mb-1 block">
              Fahrzeugtyp
            </Label>
          )}
          <div className="flex">
            <Select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-grow"
            >
              <option value="">Alle Fahrzeugtypen</option>
              <option value="Integriert">Integriert</option>
              <option value="Teilintegriert">Teilintegriert</option>
              <option value="Alkoven">Alkoven</option>
              <option value="Campervan">Campervan</option>
              <option value="Kastenwagen">Kastenwagen</option>
            </Select>
            <Button type="submit" className="ml-2">
              <HiSearch className="mr-2" />
              <span>Suchen</span>
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default VehicleSearchForm;
