// Styles: //
import "./GameControls.scss";

// MUI: //
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import {
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";

// Utils: //
import { ReactNode, useEffect, useState } from "react";
import { useGameContext } from "../../../../contexts/GameContext";
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

type Props = {
  radiuses: number[];
  radius: number;
  volumeOn: boolean;
  handleRadiusPick: (
    event: SelectChangeEvent<number>,
    child: ReactNode
  ) => void;
  setVolumeOn: React.Dispatch<React.SetStateAction<boolean>>;
};

function GameControls({
  radiuses,
  radius,
  volumeOn,
  handleRadiusPick,
  setVolumeOn,
}: Props) {
  const { fieldMoving, setRestarting } = useGameContext();

  const [volumeBtnOn, setVolumeBtnOn] = useState(volumeOn);

  useEffect(() => {
    !fieldMoving && volumeBtnOn != volumeOn && setVolumeOn(volumeBtnOn);
  }, [fieldMoving]);

  return (
    <div className="controls">
      <div className="contol-wrapper">
        <IconButton
          onClick={(e) => {
            e.currentTarget.blur();
            setRestarting(true);
          }}
          className="control"
          aria-label="restart"
        >
          <RestartAltIcon />
        </IconButton>
      </div>

      <FormControl fullWidth className="control--radius">
        <InputLabel
          className="control--radius__label"
          id="field-radius-select-label"
        >
          Radius
        </InputLabel>

        <Select
          className="control--radius__select"
          labelId="field-radius-select-label"
          id="field-radius-select"
          value={radius}
          label="Radius"
          size="small"
          onClose={() => {
            //~~~~~ Blur Mui Non-Native Select element ~~~~~//
            //info => (stackoverflow.com/questions/65411927/blur-material-ui-select-component-on-the-onchange-event)
            setTimeout(() => {
              (document!.activeElement as HTMLElement)?.blur();
            }, 0);
          }}
          onChange={handleRadiusPick}
        >
          {radiuses.map((rad) => (
            <MenuItem key={rad} value={rad}>
              {rad}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <div className="contol-wrapper">
        <IconButton
          onClick={(e) => {
            e.currentTarget.blur();
            setVolumeBtnOn(!volumeBtnOn);
            !fieldMoving && setVolumeOn(!volumeOn);
          }}
          className="control"
          aria-label="restart"
        >
          {volumeBtnOn ? <VolumeUpIcon /> : <VolumeOffIcon />}
        </IconButton>
      </div>
    </div>
  );
}

export default GameControls;
