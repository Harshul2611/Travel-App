import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import api from "../api/axios.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, Plus, LogOut, MapPin, Calendar, Clock } from "lucide-react";
import toast from "react-hot-toast";

interface Itinerary {
  _id: string;
  title: string;
  itinerary: {
    destination: string;
    startDate: string;
    endDate: string;
    summary: string;
  };
  shareId: string;
  createdAt: string;
}

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItineraries();
  }, []);

  const fetchItineraries = async () => {
    try {
      const response = await api.get("/itineraries");
      setItineraries(response.data.itineraries);
    } catch {
      toast.error("Failed to fetch itineraries");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-full p-2">
              <Plane className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl">TripAI</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {user?.avatar ? (
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium">{user?.name}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name?.split(" ")[0]}! 👋
            </h1>
            <p className="text-gray-500 mt-1">
              Your AI-powered travel itineraries
            </p>
          </div>
          <Button onClick={() => navigate("/upload")} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            New Itinerary
          </Button>
        </div>

        {/* Itineraries Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : itineraries.length === 0 ? (
          <div className="text-center py-20">
            <Plane className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">
              No itineraries yet
            </h3>
            <p className="text-gray-400 mt-2 mb-6">
              Upload your travel documents to generate your first AI itinerary
            </p>
            <Button onClick={() => navigate("/upload")}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Itinerary
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itineraries.map((item) => (
              <Card
                key={item._id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/itinerary/${item._id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <div className="flex items-center gap-1 text-sm text-blue-600">
                    <MapPin className="h-4 w-4" />
                    {item.itinerary.destination}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    {item.itinerary.startDate} → {item.itinerary.endDate}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {item.itinerary.summary}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-400 pt-2">
                    <Clock className="h-3 w-3" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
