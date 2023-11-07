// Styles: //
import "./Game.scss";

// Assets: //
import hexCellImage from "../../assets/images/hex-cell-image.svg";

// Hooks: //
import { useEffect, useMemo, useState } from "react";
import { useKeyDown } from "../../utils/hooks/useKeyDown";
import { useGesture } from "../../utils/hooks/useGesture";
import { useGameContext } from "../../contexts/GameContext";

// Types: //
import {
  SpotWithPointCors,
  ControlKey,
  GameStatus,
  GestureMethod,
  UserStats,
  DeepPartial,
  RadiusStats,
} from "../../common/types";

// Components: //
import HexCell from "./components/HexCell/HexCell";
import Tile from "./components/Tile/Tile";
import Overlay from "./components/Overlay/Overlay";
import Score from "./components/Score/Score";

// Utils: //
import { controlKeys } from "../../utils/gameUtils/gameLogicUtils";
import {
  arePointsSame,
  getFieldPoints,
} from "../../utils/gameUtils/fieldUtils";
import {
  getNewSpot,
  validMoves,
  getPointCors,
} from "../../utils/gameUtils/gameLogicUtils";
import { getRngPoints } from "../../utils/gameUtils/fieldUtils";
import { v4 as uuidv4 } from "uuid";
import { isMobile } from "react-device-detect";
import { load } from "../../utils/helpers/loadImgPromise";
import { storeUserStats } from "../../firebase/firebase-db";
import { useAuth } from "../../contexts/AuthContext";
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

const timeoutsIds: ReturnType<typeof setTimeout>[] = [];

const clearTimeouts = () => {
  timeoutsIds.forEach((id) => clearTimeout(id));
};

type Props = {
  radius: number;
  playSound: Function;
  fieldHeight: number;
};

function Game({ radius, playSound, fieldHeight }: Props) {
  const { currentUser } = useAuth();

  const {
    someInputActive,
    setFieldMoving,
    restarting,
    setRestarting,
    userData,
    setUserData,
  } = useGameContext();

  const userStatsIndex = `radius${radius}` as keyof UserStats;

  //~~~~~ Adjust move speed according to the radius ~~~~~//
  const moveSpeed = 200 + (radius - 2) * 50;

  const hexHeight = fieldHeight / ((radius - 1) * 2 + 1);

  const startingScores = {
    current: 0,
    best: userData!.stats[userStatsIndex].best,
  };

  const [hexCellImgLoaded, setHexCellImgLoaded] = useState(false);

  const [status, setStatus] = useState<GameStatus>("loading");

  const [gestureMethod, setGestureControlMethod] =
    useState<GestureMethod>(null);

  const [fieldOverlayed, setFieldOverlayed] = useState(false);

  const [reached2048, setReached2048] = useState(false);

  const [scores, setScores] = useState(startingScores);

  const [move, setMove] = useState<ControlKey | null>(null);

  const [moving, setMoving] = useState(false);

  const [userTiles, setUserTiles] = useState<SpotWithPointCors[]>([]);

  //~~~ Derived state for the field points to toggle field appearance(as "fieldReady" boolean variable ↓↓↓)
  //~~~ with animation via explicitly setting new state of the field points on radius change
  const [fieldPoints, setFieldPoints] = useState(getFieldPoints(radius));

  //~~~ Field is ready when hex-cell-image is loaded, tiles are present and the field points count is right for the radius:
  //~~~ according to "hexagonal centered number" formula => (3n(n-1) + 1)
  const fieldReady =
    hexCellImgLoaded &&
    userTiles.length > 0 &&
    fieldPoints.length == 3 * radius * (radius - 1) + 1;

  //~~~ For the better perfomance calculate movedTiles in adavance,
  //~~~ and after update of the new point cors fires animation in the first place,
  //~~~ initiate the rest of the field update.
  const movedTilesValues = useMemo(() => {
    if (move) {
      return userTiles.map((tile) =>
        getNewSpot(tile, move, userTiles, hexHeight, fieldPoints)
      );
    } else {
      return [];
    }
  }, [move]);

  const [movedTilesPointCors, setMovedTilesPointCors] = useState<
    { x: number; y: number }[]
  >([]);

  //~~~ Just in case when a perfomance of the CPU is slowed down,
  //~~~ store moved user tiles only after its memoized value and corresponding point cors were updated
  //~~~ and triggered tiles animation to ensure that new user tiles not updating the field earlier than animation ends
  const [movedTiles, setMovedTiles] = useState<SpotWithPointCors[]>([]);

  //~~~ To avoid unnecessary rerenders of the tiles by updating other states
  //~~~ don`t show tiles in the process of restarting until new tiles are set
  const [hideTiles, setHideTiles] = useState(false);

  const updateUserStats = (stats: DeepPartial<RadiusStats>) => {
    timeoutsIds.push(
      //~~~ Update user stats after tiles appearing animation ~~~//
      setTimeout(() => {
        setUserData((prevVal) => {
          if (prevVal) {
            const shallowPrevVal = { ...prevVal };

            shallowPrevVal.stats[userStatsIndex] = {
              ...prevVal.stats[userStatsIndex],
              ...stats,
            };

            return shallowPrevVal;
          } else {
            return null;
          }
        });
      }, 100)
    );

    storeUserStats(userStatsIndex, stats, currentUser);
  };

  const setActiveStatus = () => {
    //~~~~~ For mobile devices ask user to pick the control method ~~~~~//
    if (isMobile && !gestureMethod) {
      setStatus("control-pick");
    } else {
      setStatus("playing");
    }
  };

  const updateField = () => {
    clearTimeouts();

    if (!hexCellImgLoaded) {
      load(hexCellImage)
        .then(() => {
          setHexCellImgLoaded(true);

          setActiveStatus();
        })
        .catch(() => {
          setStatus("loading-error");
        });
    } else {
      setActiveStatus();
    }

    setMove(null);

    setMoving(false);

    setFieldPoints(getFieldPoints(radius));

    setMovedTiles([]);

    setScores(startingScores);

    setReached2048(false);

    const initialTiles = getRngPoints(radius, []);

    setUserTiles(
      initialTiles.map((tile) => {
        const { x, y } = getPointCors(tile, hexHeight);
        return { ...tile, pointCors: { x, y }, newTile: true };
      })
    );

    //~~~~~ Don`t allow to make a move during the field`s css appearing animation(450ms) ~~~~~//
    timeoutsIds.push(
      setTimeout(() => {
        setRestarting(false);
      }, 450)
    );
  };

  const moveHandler = (key: ControlKey) => {
    if (
      !someInputActive &&
      !restarting &&
      !moving &&
      !move &&
      status == "playing" &&
      fieldReady
    ) {
      setMoving(true);

      setMove(key);
    }
  };

  const gestureHandlers = useGesture({
    gestureMethod,
    moveHandler,
  });

  useKeyDown(moveHandler, controlKeys);

  useEffect(() => {
    updateField();
  }, [radius]);

  useEffect(() => {
    if (restarting) {
      setHideTiles(true);
      updateField();
    }
  }, [restarting]);

  useEffect(() => {
    setFieldMoving(moving);
  }, [moving]);

  useEffect(() => {
    if (
      status == "control-pick" ||
      status == "loading" ||
      status == "loading-error"
    ) {
      setFieldOverlayed(true);
    } else if (status !== "playing") {
      playSound(status == "game-over" ? "game-over-sound" : "win-sound");

      timeoutsIds.push(
        setTimeout(() => {
          setFieldOverlayed(true);
        }, 1200)
      );
    } else {
      setFieldOverlayed(false);
    }
  }, [status]);

  useEffect(() => {
    if (scores.best > userData!.stats[userStatsIndex].best) {
      updateUserStats({ best: scores.best });
    }
  }, [scores.best]);

  useEffect(() => {
    reached2048 &&
      //~~~ Update user stats after overlay appearing animation ~~~//
      setTimeout(() => {
        updateUserStats({
          wins: userData!.stats[userStatsIndex].wins + 1,
        });
      }, 1330);
  }, [reached2048]);

  useEffect(() => {
    if (userTiles.length > 0) {
      setHideTiles(false);
    }
  }, [userTiles]);

  useEffect(() => {
    if (move) {
      setMovedTilesPointCors(
        movedTilesValues.map((tile) => getPointCors(tile, hexHeight))
      );
    }
  }, [move]);

  useEffect(() => {
    setMovedTiles(movedTilesValues);
  }, [movedTilesPointCors]);

  useEffect(() => {
    if (movedTiles.length > 0) {
      let didMerge = false;

      let newScores = 0;

      let win = false;

      //~~~~~ Tiles merging will produce two tiles at the same spot,
      //~~~~~ one will have doubled value and [newTile] prop as true,
      //~~~~~ sort them to remove spare duplicates
      const updatedTiles = movedTiles.reduce((acc, red) => {
        //~~~~~ Keep track of the new values that have been produced by merging,
        //~~~~~ to update the current score
        if (red.newTile) {
          newScores += red.value;

          if (red.value == 2048 && !reached2048) {
            win = true;
          }
        }

        const duplicateIndex = acc.findIndex((tile) =>
          arePointsSame(tile, red)
        );

        if (duplicateIndex !== -1) {
          if (red.newTile) {
            const tempAcc = [...acc];

            tempAcc.splice(duplicateIndex, 1);

            return [...tempAcc, red];
          } else {
            return acc;
          }
        } else {
          return [...acc, red];
        }
      }, [] as SpotWithPointCors[]);

      newScores > 0 && (didMerge = true);

      if (
        //~~~~~ Get and update new tiles only if there are movements done ~~~~~//
        updatedTiles.some(
          (updatedTile) =>
            !userTiles.find(
              (oldTile) =>
                arePointsSame(updatedTile, oldTile) &&
                updatedTile.value == oldTile.value
            )
        )
      ) {
        const newScore = scores.current + newScores;

        const newBestScore = newScore > scores.best ? newScore : scores.best;

        const rngTiles = getRngPoints(radius, updatedTiles);

        const newTiles = [
          ...updatedTiles,
          ...rngTiles.map((tile) => {
            const { x, y } = getPointCors(tile, hexHeight);

            return {
              ...tile,
              pointCors: { x, y },
              newTile: true,
            };
          }),
        ];

        const moveSoundPlay = () => {
          if (win) {
            setStatus("win");
          } else {
            playSound(didMerge ? "merging-sound" : "move-sound");
          }
        };

        //~~~~~ Delay of [moveSpeed] for the tiles update, while they are moving ~~~~~//

        timeoutsIds.push(
          setTimeout(() => {
            setMove(null);

            setUserTiles(newTiles);
            //~~~~~ Delay for the states update while new tiles are appearing ~~~~~//
            timeoutsIds.push(
              setTimeout(() => {
                win && setReached2048(true);

                setScores({ current: newScore, best: newBestScore });

                setMovedTiles([]);

                //~~~~~ In the case when the grid is filling up, check if moves are available ~~~~~//
                if (newTiles.length == fieldPoints.length) {
                  if (!validMoves(newTiles)) {
                    setStatus(win ? "game-over-win" : "game-over");
                  } else {
                    moveSoundPlay();
                  }
                } else {
                  moveSoundPlay();
                }

                setMoving(false);
              }, 100)
            );
          }, moveSpeed)
        );
      } else {
        //~~~~~ If no movements have been done ~~~~~//
        setMove(null);

        setMovedTiles([]);

        setMoving(false);
      }
    }
  }, [movedTiles]);

  return (
    <div className="game-wrapper">
      <div className="score-wrapper score-wrapper--current">
        <Score title="SCORE" val={scores.current} />
      </div>

      <div className="score-wrapper score-wrapper--best">
        <Score title="BEST" val={scores.best} />
      </div>

      <div className="game__field--wrapper--wrapper">
        <div
          className="game__field--wrapper"
          style={{ minHeight: fieldHeight }}
        >
          <div
            className={`game__field ${
              fieldOverlayed && "game__field--overlayed"
            }`}
            style={{
              height: fieldHeight,
              display: `${fieldReady ? "grid" : "none"}`,
            }}
            {...(!moving && !restarting ? gestureHandlers : {})}
          >
            {fieldPoints.map((point) => {
              return (
                <HexCell
                  key={`${point.x}${point.y}${point.z}`}
                  point={point}
                  hexHeight={hexHeight}
                />
              );
            })}

            <div className="tiles-center" style={{ height: `${hexHeight}px` }}>
              {!hideTiles &&
                userTiles.map((tile, i) => {
                  return (
                    <Tile
                      movedTilePointCors={movedTilesPointCors[i]}
                      restarting={restarting}
                      moving={moving}
                      move={move}
                      key={uuidv4()}
                      tile={tile}
                      hexHeight={hexHeight}
                      moveSpeed={moveSpeed}
                    />
                  );
                })}
            </div>
          </div>

          {fieldOverlayed && !(status == "playing") && (
            <Overlay
              handleContiniue={() => {
                setStatus("playing");
              }}
              fieldHeight={fieldHeight}
              status={status}
              setGestureControlMethod={setGestureControlMethod}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Game;
