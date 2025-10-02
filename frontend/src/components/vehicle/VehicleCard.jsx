import React from "react";
import { Card, Badge, Button } from "flowbite-react";
import { FiMapPin, FiUsers, FiCalendar } from "react-icons/fi";
import { Link } from "react-router-dom";

const VehicleCard = ({ vehicle }) => {
  // Handle both API and mock data formats
  const {
    _id,
    id,
    name,
    title,
    description,
    price,
    location,
    images,
    image,
    category,
    capacity,
    rating,
    slug,
  } = vehicle;

  // Use either the API format or mock format properties
  const vehicleId = _id || id;
  const vehicleName = name || title;
  const vehicleImage = images?.length > 0 ? images[0] : image;
  const vehicleSlug = slug || vehicleId;

  // Truncate description if it's too long
  const truncatedDescription =
    description && description.length > 100
      ? `${description.substring(0, 100)}...`
      : description;

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative">
        <img
          src={vehicleImage || "/assets/vehicle-placeholder.svg"}
          alt={vehicleName}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <Badge className="absolute top-2 left-2" color="dark">
          {category}
        </Badge>
        {rating && (
          <Badge className="absolute top-2 right-2" color="warning">
            ★ {typeof rating === "number" ? rating.toFixed(1) : rating}
          </Badge>
        )}
      </div>

      <div className="p-4 flex-grow">
        <h5 className="text-xl font-bold tracking-tight text-gray-900 mb-2">
          {vehicleName}
        </h5>

        <div className="flex items-center text-sm text-gray-700 mb-2">
          <FiMapPin className="mr-1" />
          <span>{location || "Standort nicht angegeben"}</span>
        </div>

        <div className="flex items-center text-sm text-gray-700 mb-3">
          <FiUsers className="mr-1" />
          <span>{capacity || 0} Personen</span>
        </div>

        <p className="text-gray-700 text-sm mb-3">
          {truncatedDescription || "Keine Beschreibung verfügbar."}
        </p>

        <div className="mt-auto">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold text-gray-900">
              {price
                ? `${typeof price === "number" ? price.toFixed(2) : price} €`
                : "Preis auf Anfrage"}
              <span className="text-sm font-normal text-gray-600"> / Tag</span>
            </div>

            <Button
              as={Link}
              to={`/vehicles/${vehicleSlug || vehicleId || "details"}`}
              size="xs"
              gradientDuoTone="cyanToBlue"
            >
              Details
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VehicleCard;
