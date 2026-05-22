import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { setAccessToken } from "../api/axios.js";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUserFromGoogle } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const name = searchParams.get("name");
    const email = searchParams.get("email");
    const id = searchParams.get("id");
    const avatar = searchParams.get("avatar");

    if (token && name && email && id) {
      setAccessToken(token);
      setUserFromGoogle(
        {
          id,
          name: decodeURIComponent(name),
          email: decodeURIComponent(email),
          avatar: decodeURIComponent(avatar || ""),
        },
        token,
      );
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/login?error=google_failed", { replace: true });
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
};

export default AuthCallback;
