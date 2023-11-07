// Styles: //
import "./LeaderboardControls.scss";

// Componetns: //
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";

// Uitls: //
import React, { useEffect, useState } from "react";
import { radiuses } from "../../../../utils/gameUtils/gameLogicUtils";
import { useGameContext } from "../../../../contexts/GameContext";
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

type Props = {
  radius: number;
  setRadius: React.Dispatch<React.SetStateAction<number>>;
  searchValue: string;
  handleSearchInput: (val: string) => void;
};

function LeaderboardControls({
  searchValue,
  handleSearchInput,
  radius,
  setRadius,
}: Props) {
  const { fieldMoving, someInputActive, setSomeInputActive } = useGameContext();

  const [leaderboardSearchActive, setLeaderboardSearchActive] = useState(false);

  useEffect(() => {
    !fieldMoving &&
      leaderboardSearchActive != someInputActive &&
      setSomeInputActive(leaderboardSearchActive);
  }, [fieldMoving]);

  return (
    <div className="leaderboard__controls">
      <FormControl
        className="control--radius control--radius--leaderboard"
        fullWidth
      >
        <InputLabel
          className="control--radius__label"
          id="leaderboard-radius-select-label"
        >
          Radius
        </InputLabel>

        <Select
          className="control--radius__select"
          labelId="leaderboard-radius-select-label"
          id="leaderboard-radius-select"
          value={radius}
          size="small"
          label="Radius"
          onClose={() => {
            //~~~~~ Blur Mui Non-Native Select element ~~~~~//
            //info => (stackoverflow.com/questions/65411927/blur-material-ui-select-component-on-the-onchange-event)
            setTimeout(() => {
              (document!.activeElement as HTMLElement)?.blur();
            }, 0);
          }}
          onChange={(e: SelectChangeEvent<number>) => {
            setRadius(Number(e.target.value));
          }}
        >
          {radiuses.map((rad) => (
            <MenuItem key={rad} value={rad}>
              {rad}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        aria-multiline={false}
        className="leaderboard-search"
        id="outlined-textarea"
        label="Search"
        placeholder="Username"
        size="small"
        value={searchValue}
        onFocus={() => {
          !fieldMoving
            ? setSomeInputActive(true)
            : setLeaderboardSearchActive(true);
        }}
        onBlur={() => {
          setLeaderboardSearchActive(false);
          setSomeInputActive(false);
        }}
        onChange={(e) => handleSearchInput(e.target.value)}
      />
    </div>
  );
}

export default LeaderboardControls;
