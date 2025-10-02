import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  Button,
  TextInput,
  Select,
  Pagination,
  Spinner,
} from "flowbite-react";
import { HiSearch, HiFilter, HiArrowCircleRight } from "react-icons/hi";
import axios from "axios";

const VehicleListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    seats: searchParams.get("seats") || "",
    sleepingPlaces: searchParams.get("sleepingPlaces") || "",
    location: searchParams.get("location") || "",
  });
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page")) || 1
  );

  useEffect(() => {
    document.title = "Wohnmobile | WohnmobilTraum";
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchParams]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(searchParams);
      if (!queryParams.has("page")) {
        queryParams.append("page", currentPage);
      }

      const response = await axios.get(
        `/api/vehicles?${queryParams.toString()}`
      );

      if (response.data.success) {
        setVehicles(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const applyFilters = () => {
    const newParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        newParams.append(key, value);
      }
    });

    newParams.set("page", "1");
    setCurrentPage(1);
    setSearchParams(newParams);
  };

  const onPageChange = (page) => {
    setCurrentPage(page);
    searchParams.set("page", page.toString());
    setSearchParams(searchParams);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Unsere Wohnmobile</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <div className="flex items-center mb-4">
          <HiFilter className="text-gray-600 mr-2" size={20} />
          <h2 className="text-xl font-semibold">Filter</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <Select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="">Kategorie</option>
              <option value="Wohnmobil">Wohnmobil</option>
              <option value="Wohnwagen">Wohnwagen</option>
              <option value="Kastenwagen">Kastenwagen</option>
            </Select>
          </div>

          <div>
            <TextInput
              type="number"
              name="minPrice"
              placeholder="Min. Preis €"
              value={filters.minPrice}
              onChange={handleFilterChange}
            />
          </div>

          <div>
            <TextInput
              type="number"
              name="maxPrice"
              placeholder="Max. Preis €"
              value={filters.maxPrice}
              onChange={handleFilterChange}
            />
          </div>

          <div>
            <Select
              name="seats"
              value={filters.seats}
              onChange={handleFilterChange}
            >
              <option value="">Sitzplätze</option>
              <option value="2">2+</option>
              <option value="4">4+</option>
              <option value="6">6+</option>
            </Select>
          </div>

          <div>
            <Select
              name="sleepingPlaces"
              value={filters.sleepingPlaces}
              onChange={handleFilterChange}
            >
              <option value="">Schlafplätze</option>
              <option value="2">2+</option>
              <option value="4">4+</option>
              <option value="6">6+</option>
            </Select>
          </div>

          <div>
            <TextInput
              type="text"
              name="location"
              placeholder="Standort"
              value={filters.location}
              onChange={handleFilterChange}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button onClick={applyFilters} color="primary">
            <HiSearch className="mr-2 h-5 w-5" />
            Suchen
          </Button>
        </div>
      </div>

      {/* Vehicle List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="xl" />
        </div>
      ) : vehicles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <Card key={vehicle._id} className="overflow-hidden">
                <img
                  src={
                    vehicle.images[0]?.url ||
                    "/src/assets/vehicle-placeholder.jpg"
                  }
                  alt={vehicle.name}
                  className="h-48 w-full object-cover"
                />
                <div>
                  <h3 className="text-xl font-semibold mb-2">{vehicle.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {vehicle.category}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="flex items-center">
                      <span className="text-sm">Sitze:</span>
                      <span className="font-medium ml-1">
                        {vehicle.capacity.seats}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm">Schlafplätze:</span>
                      <span className="font-medium ml-1">
                        {vehicle.capacity.sleepingPlaces}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <span className="text-sm text-gray-500">Ab</span>
                      <span className="text-xl font-bold text-primary-600">
                        {" "}
                        €{vehicle.pricing.basePrice.perDay}
                      </span>
                      <span className="text-sm text-gray-500">/Tag</span>
                    </div>

                    <Button href={`/vehicles/${vehicle.slug}`} size="sm">
                      Details
                      <HiArrowCircleRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              showIcons={true}
            />
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">Keine Fahrzeuge gefunden</h3>
          <p className="text-gray-600">
            Bitte passen Sie Ihre Filtereinstellungen an oder versuchen Sie es
            später erneut.
          </p>
        </div>
      )}
    </div>
  );
};

export default VehicleListPage;
