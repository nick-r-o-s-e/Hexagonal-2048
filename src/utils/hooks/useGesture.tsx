import { TouchEvent, useState } from "react";
import { ControlKey } from "../../common/types";

interface GestureInput {
  gestureMethod: "swipe" | "touch" | null;
  moveHandler: (dir: ControlKey) => void;
}

interface SwipeOutput {
  onTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
  onTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void;
  onTouchEnd: () => void;
}

interface TouchOutput {
  onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

type GestureOutput = SwipeOutput | TouchOutput;

const targetTouchedCors = (e: TouchEvent) => ({
  x: e.targetTouches[0].clientX,
  y: e.targetTouches[0].clientY,
});

export const useGesture = ({
  gestureMethod,
  moveHandler,
}: GestureInput): GestureOutput => {
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });

  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });

  //~~~ Touch handling ~~~//
  if (gestureMethod == "touch") {
    const onClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const fieldHeight = (e.target as HTMLDivElement).clientHeight;

      const x = e.nativeEvent.offsetX - fieldHeight / 2;

      const y = e.nativeEvent.offsetY - fieldHeight / 2;

      if (y < 0) {
        if (Math.abs(y) > Math.abs(x) * 1.5) {
          moveHandler("w");
        } else {
          x > 0 ? moveHandler("e") : moveHandler("q");
        }
      } else {
        if (Math.abs(y) > Math.abs(x) * 1.5) {
          moveHandler("s");
        } else {
          x > 0 ? moveHandler("d") : moveHandler("a");
        }
      }
    };

    return { onClick };

    //~~~ Swipe handling ~~~//
  } else {
    const minSwipeDistance = 50;

    const onTouchStart = (e: TouchEvent) => {
      setTouchEnd({ x: 0, y: 0 }); // otherwise the swipe is fired even with usual touch events
      setTouchStart(targetTouchedCors(e));
    };

    const onTouchMove = (e: TouchEvent) => setTouchEnd(targetTouchedCors(e));

    const onTouchEnd = () => {
      if (!touchStart.x || !touchEnd.x) {
        return;
      }

      const xDistance = touchStart.x - touchEnd.x;

      const yDistance = touchStart.y - touchEnd.y;

      if (
        Math.abs(xDistance) < minSwipeDistance &&
        Math.abs(yDistance) < minSwipeDistance
      ) {
        return;
      }

      //~~~~~ Diagonal swipe ~~~~~//
      if (Math.abs(xDistance) > Math.abs(yDistance) / 1.5) {
        //~~~ Left ~~~//
        if (xDistance > minSwipeDistance) {
          if (touchStart.y > touchEnd.y) {
            moveHandler("q");
          } else {
            moveHandler("a");
          }
          //~~~ Right ~~~//
        } else {
          if (touchStart.y > touchEnd.y) {
            moveHandler("e");
          } else {
            moveHandler("d");
          }
        }

        //~~~~~ Vertical swipe ~~~~~//
      } else {
        if (yDistance < minSwipeDistance) {
          moveHandler("s");
        } else {
          moveHandler("w");
        }
      }
    };

    return {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    };
  }
};
