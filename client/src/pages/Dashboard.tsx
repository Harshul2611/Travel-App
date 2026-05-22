import { useAuth } from "../context/AuthContext.js";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
        <p className="text-muted-foreground">Dashboard coming soon...</p>
        <Button onClick={logout} variant="outline">
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
