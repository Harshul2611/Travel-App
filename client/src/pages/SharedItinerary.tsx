import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, Hotel, MapPin, Calendar, Clock } from "lucide-react";
import toast from "react-hot-toast";

const SharedItinerary = () => {
  const { shareId } = useParams();
  const [itinerary, setItinerary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await api.get(`/itineraries/share/${shareId}`);
        setItinerary(response.data.itinerary);
      } catch {
        toast.error("Itinerary not found");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [shareId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Itinerary not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="bg-primary rounded-full p-2">
            <Plane className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl">TripAI</span>
          <span className="text-sm text-gray-400 ml-2">Shared Itinerary</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {itinerary.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-blue-500" />
              {itinerary.itinerary.destination}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-blue-500" />
              {itinerary.itinerary.startDate} → {itinerary.itinerary.endDate}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-blue-500" />
              {new Date(itinerary.createdAt).toLocaleDateString()}
            </div>
          </div>
          <p className="mt-4 text-gray-600">{itinerary.itinerary.summary}</p>
        </div>

        {itinerary.itinerary.flights.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-blue-500" /> Flights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {itinerary.itinerary.flights.map((flight: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-blue-50 rounded-xl"
                >
                  <div>
                    <p className="font-semibold">
                      {flight.from} → {flight.to}
                    </p>
                    <p className="text-sm text-gray-500">
                      {flight.airline} · {flight.flightNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{flight.date}</p>
                    <p className="text-sm text-gray-500">{flight.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {itinerary.itinerary.hotels.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hotel className="h-5 w-5 text-purple-500" /> Hotels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {itinerary.itinerary.hotels.map((hotel: any, i: number) => (
                <div key={i} className="p-4 bg-purple-50 rounded-xl">
                  <p className="font-semibold">{hotel.name}</p>
                  <p className="text-sm text-gray-500">{hotel.address}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Check-in: {hotel.checkIn} · Check-out: {hotel.checkOut}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {itinerary.itinerary.activities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-500" /> Day by Day Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {itinerary.itinerary.activities.map(
                (activity: any, i: number) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
                      {i + 1}
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl flex-1">
                      <p className="font-semibold">{activity.day}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                ),
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SharedItinerary;
