import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function Root() {
  const { currentUser } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser !== undefined) {
      navigate(currentUser ? "/game" : "/auth", { replace: true });
    }
  }, [currentUser]);

  return <></>;
}

export default Root;
