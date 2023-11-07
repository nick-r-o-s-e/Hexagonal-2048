import { useEffect } from "react";

export const useKeyDown = (callback: Function, keys: string[]) => {
  const onKeyDown = (e: KeyboardEvent) => {
    const pressedKey = e.key.toLowerCase();

    const wasAnyKeyPressed = keys.some((key) => pressedKey === key);

    if (e.repeat) return;

    if (wasAnyKeyPressed) {
      callback(pressedKey);
    }
  };
  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);
};

//~~~~~~~~~~ Example usage: ~~~~~~~~~~//

// const someCallback = (key) => {}

// useKeyDown(someCallback, ["Escape"])
