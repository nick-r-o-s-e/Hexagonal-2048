// Hooks: //
import { ReactElement, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

// Utils: //
import { createContext } from "react";
import { GameContextProps, UserData } from "../common/types";

// Firebase: //

import { getUserData } from "../firebase/firebase-db";
import { useNavigate } from "react-router-dom";
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

export const GameContext = createContext<GameContextProps | null>(null);

export const useGameContext = () => {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error("useGameContext must be used within an GameProvider");
  }

  return context;
};

type Props = {
  children?: React.ReactNode;
  loader: ReactElement;
};

export const GameProvider = ({ children, loader }: Props) => {
  const navigate = useNavigate();

  const { currentUser } = useAuth();

  const [userData, setUserData] = useState<UserData | null>(null);

  const [fieldMoving, setFieldMoving] = useState(false);

  const [someInputActive, setSomeInputActive] = useState(false);

  const [restarting, setRestarting] = useState(false);

  useEffect(() => {
    if (currentUser !== undefined) {
      getUserData(currentUser)
        .then((res) => {
          setUserData(res);
        })
        .catch(() => {
          currentUser?.delete();

          navigate("/auth", { replace: true, state: { dbDataLost: true } });
        });
    }
  }, [currentUser]);

  const value = {
    fieldMoving,
    setFieldMoving,
    someInputActive,
    setSomeInputActive,
    restarting,
    setRestarting,
    userData,
    setUserData,
  };

  return (
    <GameContext.Provider value={value}>
      {!userData ? loader : children}
    </GameContext.Provider>
  );
};
