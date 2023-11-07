import { isMobile } from "react-device-detect";

export const getCurrentDimension = () => {
  return {
    width: isMobile ? window.outerWidth : window.innerWidth,
    height: window.innerHeight,
  };
};
