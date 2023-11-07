import { useState, useEffect } from "react";
import { getCurrentDimension } from "../helpers/getCurrentDimension";

export const useCurrentDimension = () => {
  const [screenSize, setScreenSize] = useState(getCurrentDimension());

  useEffect(() => {
    const updateDimension = () => {
      setScreenSize(getCurrentDimension());
    };

    window.addEventListener("resize", updateDimension);

    return () => {
      window.removeEventListener("resize", updateDimension);
    };
  }, [screenSize]);

  return screenSize;
};
