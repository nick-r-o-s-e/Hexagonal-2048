// Styles: //
import "./Tile.scss";

// Utils: //
import { getPointCors } from "../../../../utils/gameUtils/gameLogicUtils";
import { useEffect, useState } from "react";

// Types: //
import { SpotWithPointCors, ControlKey } from "../../../../common/types";
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

type Props = {
  hexHeight: number;
  tile: SpotWithPointCors;
  move: ControlKey | null;
  moving: boolean;
  moveSpeed: number;
  restarting: boolean;
  movedTilePointCors: {
    x: number;
    y: number;
  };

};

function Tile({
  hexHeight,
  tile,
  move,
  moving,
  moveSpeed,
  restarting,
  movedTilePointCors,
  
}: Props) {
  const [{ x, y }, setCors] = useState(getPointCors(tile, hexHeight));

  const animateTile = move ? false : restarting || (tile.newTile && moving);

  //~~~~~ Font Size for big numbers ~~~~~//
  let fontSize = (hexHeight * 1.4) / String(tile.value).length;

  if (fontSize > hexHeight / 2.5) {
    //~~~  Default font size
    fontSize = hexHeight / 2.5;
  }

  useEffect(() => {
    if (move) {
      //~~~(https://muffinman.io/blog/react-rerender-in-component-did-mount/) ~~~//
      requestAnimationFrame(() => {
        setCors(movedTilePointCors);
      });
    }
  }, [movedTilePointCors]);

  return (
    <div
      className={`tile-wrapper`}
      style={{
        display: `${restarting && move ? "none" : "block"}`,
        transition: `margin ${moveSpeed}ms ease-out`,
        marginLeft: `${x}px`,
        marginTop: `${y}px`,
      }}
    >
      <div
        className={`tile val-${tile.value} ${animateTile ? "new-tile" : ""}`}
      >
        <span
          style={{
            fontSize: `${fontSize}px`,
          }}
        >
          {tile.value}
        </span>
      </div>
    </div>
  );
}

export default Tile;
