// Styles: //
import "./GamePage.scss";

// Assets: //
import controlsImg from "../../assets/images/control-keys.png";

//Hooks://
import { Button, SelectChangeEvent } from "@mui/material";
import { GameProvider } from "../../contexts/GameContext";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useCurrentDimension } from "../../utils/hooks/useCurrentDimension";

// Utils: //
import { soundEffects } from "../../utils/howler";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { radiuses } from "../../utils/gameUtils/gameLogicUtils";

// Components: //
import Game from "../../components/Game/Game";
import GameControls from "../../components/Game/components/GameControls/GameControls";
import Leaderboard from "../../components/Leaderboard/Leaderboard";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import PageLoader from "../../components/Loaders/PageLoader";
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

const cache = createCache({
  key: "css",
  prepend: true,
});

const validRadius = (radius: number) =>
  radiuses.includes(radius) ? radius : 2;

function GamePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const windowSize = useCurrentDimension();

  //~~~~~ Dynamic game field height based on screen width ~~~~~//
  const fieldHeight = windowSize.width < 800 ? windowSize.width : 700;

  const [radius, setRadius] = useState(
    validRadius(Number(searchParams.get("radius")))
  );

  const [volumeOn, setVolumeOn] = useState(true);

  const handleRadiusPick = (e: SelectChangeEvent<number>) => {
    const pickedRadius = e.target.value;

    setSearchParams({ radius: String(pickedRadius) }, { replace: true });

    setRadius(Number(pickedRadius));
  };

  const playSound = (sound: string) => {
    volumeOn && soundEffects.play(sound);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const paramRadius = Number(searchParams.get("radius")) || 0;

    if (paramRadius != validRadius(paramRadius)) {
      setSearchParams({ radius: "2" }, { replace: true });
    }

    setRadius(validRadius(paramRadius));
  }, [searchParams]);

  return (
    <GameProvider loader={<PageLoader />}>
      <CacheProvider value={cache}>
        <div className="main-container">
          <GameControls
            radiuses={radiuses}
            radius={radius}
            volumeOn={volumeOn}
            handleRadiusPick={handleRadiusPick}
            setVolumeOn={setVolumeOn}
          />

          <Game
            fieldHeight={fieldHeight}
            radius={radius}
            playSound={playSound}
          />

          <div className="about">
            <div className="info info--gameplay">
              <h2 className="info__heading">Gameplay</h2>

              <p className="info__text">
                <img className="info__text__img" src={controlsImg} alt="" />
                Hexagonal 2048 is played on a hexagonal grid with a radius of 2,
                3 or 4, with numbered tiles that slide when a player moves them
                using the 6 control keys (Q, W, E, A, S, D). Every turn, one or
                two new tiles randomly appears in empty spots on the board with
                a value of either 2 or 4. Tiles slide as far as possible in the
                chosen direction until they are stopped by either another tile
                or the edge of the grid. If two tiles of the same number collide
                while moving, they will merge into a tile with the total value
                of the two tiles that collided. The resulting tile cannot merge
                with another tile again in the same move. If a move causes three
                consecutive tiles of the same value to slide together, only the
                two tiles farthest along the direction of motion will combine. A
                scoreboard on the upper left keeps track of the user's score.
                The user's score starts at zero and is increased whenever two
                tiles combine, by the value of the new tile. The game is won
                when a tile with a value of 2048 appears on the board. Players
                can continue beyond that to reach higher scores. When the player
                has no legal moves (there are no empty spaces and no adjacent
                tiles with the same value), the game ends.
              </p>

              <div className="info__credits">
                <h2 className="info__heading">Credits</h2>

                <div className="info__credits__actions">
                  <a href="" target="_blank">
                    <Button
                      className="info__credits__actions__btn"
                      variant="contained"
                      color="info"
                      startIcon={<GitHubIcon />}
                    >
                      Project repository
                    </Button>
                  </a>

                  <a
                    href="https://www.linkedin.com/in/nikita-rozkalns/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      className="info__credits__actions__btn"
                      variant="contained"
                      color="primary"
                      startIcon={<LinkedInIcon />}
                    >
                      Developer
                    </Button>
                  </a>
                </div>
              </div>
            </div>

            <div className="info info--leaderboard">
              <h2 className="info__heading">Leaderboard</h2>

              <Leaderboard fieldRadius={radius} />
            </div>
          </div>
        </div>
      </CacheProvider>
    </GameProvider>
  );
}

export default GamePage;
