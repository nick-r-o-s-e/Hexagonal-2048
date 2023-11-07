// Styles: //
import "./Overlay.scss";

// Utils: //
import { MouseEventHandler, useEffect } from "react";
import { useGameContext } from "../../../../contexts/GameContext";

// Types: //
import { GameStatus, GestureMethod } from "../../../../common/types";

// MUI: //
import { IconButton } from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import SwipeIcon from "@mui/icons-material/Swipe";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import RingLoader from "../../../Loaders/RingLoader";
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

type Props = {
  handleContiniue: Function;
  fieldHeight: number;
  status: GameStatus;
  setGestureControlMethod: React.Dispatch<React.SetStateAction<GestureMethod>>;
};

function Overlay({
  handleContiniue,
  status,
  fieldHeight,
  setGestureControlMethod,
}: Props) {
  const { setRestarting } = useGameContext();

  const win = status == "win" || status == "game-over-win";

  const loadingErr = status == "loading-error";

  const controlPick = status == "control-pick";

  const canBeContinuied = status == "win" || status == "control-pick";

  const handleSubmit = canBeContinuied
    ? handleContiniue
    : () => {
        setRestarting(true);
      };

  useEffect(() => {
    const keyDownHandler = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();

        //~~~~~ In the case when a keyboard is connected to the touchscreen device ~~~~~//
        setGestureControlMethod("swipe");

        handleSubmit();
      }
    };

    document.addEventListener("keydown", keyDownHandler);

    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, []);

  return (
    <form
      className="overlay"
      style={{
        fontSize: fieldHeight / 12,
        justifyContent: controlPick ? "start" : "center",
      }}
    >
      {status == "loading" ? (
        <RingLoader size="60%" />
      ) : controlPick ? (
        <>
          <h2 className="overlay__heading">Select control method</h2>

          <div className="overlay__controls">
            <div className="overlay__controls__control-pick">
              <IconButton
                onClick={() => {
                  setGestureControlMethod("swipe");
                  handleContiniue();
                }}
                className="control control--overlay"
                aria-label="restart"
              >
                <SwipeIcon />
              </IconButton>

              <p className="overlay__text">
                The swipe control will be the same as in the classic "2048", but
                at first it may feel unusual because of the six directions.
              </p>
            </div>

            <span
              className="overlay__controls__devider"
              style={{ alignSelf: "baseline" }}
            >
              /
            </span>

            <div className="overlay__controls__control-pick">
              <IconButton
                onClick={() => {
                  setGestureControlMethod("touch");
                  handleContiniue();
                }}
                className="control control--overlay"
                aria-label="restart"
              >
                <TouchAppIcon />
              </IconButton>

              <p className="overlay__text">
                The touch control will detect the move to one of the six sides
                depending on the sector of the field that is touched.
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          <h2 className="overlay__heading">
            {loadingErr
              ? "Loading Error"
              : win
              ? "Congratulations"
              : "Game Over"}
          </h2>

          {win && (
            <p className="overlay__text">
              You reached the <b>2048</b> tile.
              {status == "game-over-win"
                ? "Unfortunately, you do not have any legal move to continue the game."
                : "Do you want to play further and try to beat your record?"}
            </p>
          )}

          <div className="overlay__controls">
            <IconButton
              onClick={handleSubmit as MouseEventHandler<HTMLButtonElement>}
              className="control control--overlay"
              aria-label="restart"
            >
              {canBeContinuied ? <CheckCircleIcon /> : <RestartAltIcon />}
            </IconButton>

            {canBeContinuied && (
              <>
                <span className="overlay__controls__devider">/</span>

                <IconButton
                  onClick={() => {
                    setRestarting(true);
                  }}
                  className="control control--overlay"
                  aria-label="restart"
                >
                  <CancelIcon />
                </IconButton>
              </>
            )}
          </div>
        </>
      )}
    </form>
  );
}

export default Overlay;
