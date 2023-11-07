import { FieldPoint, Spot } from "../../common/types";
import { rng, min } from "./mathUtils";

const minusToPlusN = (n: number, f: Function) => {
  Array.from({ length: n * 2 + 1 }, (_, x) => n - x).forEach((val) => {
    f(val);
  });
};

//~~~~~ All points on the hexagonal grid will have zero sum of x, y and z coordinates ~~~~~//
export const getFieldPoints = (radius: number) => {
  let points: FieldPoint[] = [];
  minusToPlusN(radius - 1, (x: number) =>
    minusToPlusN(radius - 1, (y: number) =>
      minusToPlusN(
        radius - 1,
        (z: number) => x + y + z === 0 && points.push({ x, y, z })
      )
    )
  );
  return points;
};

export const arePointsSame = (a: FieldPoint, b: FieldPoint) =>
  !(["x", "y", "z"] as (keyof FieldPoint)[]).some((v) => a[v] !== b[v]);

const pickRandomN = (array: FieldPoint[], n: number) =>
  array
    .map((a) => ({ order: rng(), value: a }))
    .sort((a, b) => a.order - b.order)
    .map((a) => a.value)
    .slice(0, n);

export const getRngPoints = (
  radius: number,
  userPoints: Spot[]
): Omit<Spot, "newTile">[] => {
  const availablePositions = getFieldPoints(radius).filter((a) =>
    userPoints.every((b) => !arePointsSame(a, b))
  );

  const count = min(
    availablePositions.length,
    userPoints.length === 0 ? 3 : 1 + (rng() > 0.65 ? 1 : 0)
  );

  const value = userPoints.length === 0 ? 2 : rng() > 0.5 ? 2 : 4;

  return pickRandomN(availablePositions, count).map((p) => ({
    ...p,
    value,
  }));
};
