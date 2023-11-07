// Styles: //
import "./HexCell.scss";

// Types: //
import { FieldPoint } from "../../../../common/types";

// Utils: //
import hexCellImage from "../../../../assets/images/hex-cell-image.svg";
import { getPointCors } from "../../../../utils/gameUtils/gameLogicUtils";
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

type Props = {
  point: FieldPoint;
  hexHeight: number;
};

function HexCell({ point, hexHeight }: Props) {
  const { x, y } = getPointCors(point, hexHeight);

  return (
    <>
      <div
        className="hex-cell"
        style={{
          backgroundImage: `url("${hexCellImage}")`,
          transform: `translate(${x}px, ${y}px`,
          height: `${hexHeight}px`,
        }}
      ></div>
    </>
  );
}

export default HexCell;
