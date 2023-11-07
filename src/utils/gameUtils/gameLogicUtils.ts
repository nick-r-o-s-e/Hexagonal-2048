import {
  ControlKey,
  Spot,
  SpotWithPointCors,
  FieldPoint,
} from "../../common/types";

export const controlKeys: ControlKey[] = ["w", "e", "d", "s", "a", "q"];

export const radiuses = [2, 3, 4];

//~~~~~~~~~~ Converting coors of the hexagonal flat grid to point coordinates ~~~~~~~~~~//
export const getPointCors = (hex: FieldPoint | Spot, height: number) => {
  const [hexX, hexZ] = [hex.x, hex.z].map((v) => Number(v));

  //~~~~~ Adding specific percentage to each coordinate to match borders of the adjacent cells ~~~~~//
  let x = hexX * (3 / 4) * height * 1.065;
  let y = (Math.sqrt(3) / 2) * (hexX / 2 + hexZ) * height * 1.065;

  return { x, y };
};


const getDirectionSpots = (spots: Spot[], startSpot: Spot, dir: ControlKey) => {
  return spots.filter((spot) => {
    //~~~~~ For W and S move ~~~~~//
    if (dir == "w" || dir == "s") {
      if (spot.x == startSpot.x) {
        return dir == "w" ? spot.y > startSpot.y : spot.z > startSpot.z;
      }
    }

    //~~~~~ For Q,E,A,D move ~~~~~//
    if (dir == "e" || dir == "a") {
      if (spot.y == startSpot.y) {
        return dir == "e" ? spot.z < startSpot.z : spot.z > startSpot.z;
      }
    } else if (dir == "d" || dir == "q") {
      if (spot.z == startSpot.z) {
        return dir == "d" ? spot.y < startSpot.y : spot.y > startSpot.y;
      }
    }

    return;
  });
};

const getSortedDirectionSpots = (
  spot: Spot,
  spots: Spot[],
  move: ControlKey
) => {
  const directionSpots = getDirectionSpots(spots, spot, move); //

  return directionSpots.sort((a, b) => {
    if (move == "e" || move == "d") {
      return a.x - b.x;
    } else if (move == "q" || move == "a") {
      return b.x - a.x;
    } else {
      //~~ W or S ~~//
      return move == "w" ? a.y - b.y : b.y - a.y;
    }
  });
};

//~~~~~ When a field is filled, this function will check if some tiles have adjacent tiles with the same value ~~~~~//
export const validMoves = (userTiles: SpotWithPointCors[]) => {
  return userTiles.some((userTile, _, arr) => {
    return arr.some((tile) => {
      return (
        tile.value == userTile.value &&
        //~~~ Top & Bottom ~~~//
        ((tile.x == userTile.x &&
          (tile.y == userTile.y + 1 || tile.y == userTile.y - 1)) ||
          //~~~ Left & Right ~~~//
          ((tile.x == userTile.x + 1 || tile.x == userTile.x - 1) &&
            (tile.y == userTile.y || tile.z == userTile.z)))
      );
    });
  });
};

export const getNewSpot = (
  tile: SpotWithPointCors,
  move: ControlKey,
  spots: Spot[],
  hexHeight: number,
  fieldPoints: FieldPoint[]
): SpotWithPointCors => {
  const dirSortedTiles = getSortedDirectionSpots(tile, spots, move);

  const dirSortedFieldPoints = getSortedDirectionSpots(
    tile,
    fieldPoints as Spot[],
    move
  );

  const indexOfTheDifTile = dirSortedTiles.findIndex(
    (spot) => spot.value != tile.value
  );

  let canToMerge = false;

  //~~~~~ Self merging check ~~~~~//
  if (dirSortedTiles.length) {
    if (indexOfTheDifTile == -1) {
      canToMerge = dirSortedTiles.length == 1 || dirSortedTiles.length % 2 != 0;
    } else {
      canToMerge = indexOfTheDifTile != 0 && indexOfTheDifTile % 2 != 0;
    }
  }

  const sameValChunksLengths = dirSortedTiles.reduce(
    //~~~~~ Example: ([4,2,2,8,16,4,4,4,8,8] as values of the filled spots in the row) => [2,3,2] ~~~~~//
    (acc: number[], curr, i, arr) => {
      if (curr?.value == arr[i + 1]?.value) {
        const tempAcc = [...acc];

        if (curr?.value == arr[i - 1]?.value) {
          tempAcc[tempAcc.length - 1] += 1;
        } else {
          tempAcc.push(2);
        }

        return tempAcc;
      }
      return acc;
    },
    []
  );

  //~~~~~ Number of merging pairs in the direction ~~~~~//
  let additionStep = sameValChunksLengths.reduce(
    (acc, curr) => acc + Math.floor(curr / 2),
    0
  );

  if (canToMerge) {
    additionStep++;
  }

  const spotToGo = {
    ...(dirSortedFieldPoints[
      dirSortedFieldPoints.length - 1 - dirSortedTiles.length + additionStep
    ] || tile),
  };

  spotToGo.value = canToMerge ? tile.value * 2 : tile.value;

  spotToGo.newTile = canToMerge;

  const { x, y, z } = spotToGo;

  const pointCors = getPointCors({ x, y, z }, hexHeight);

  return { ...spotToGo, pointCors };
};
