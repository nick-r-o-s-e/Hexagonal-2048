import { User } from "firebase/auth";

export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

//~~~ ↓↓↓ GAME ↓↓↓ ~~~//

export type ControlKey = "w" | "e" | "d" | "s" | "a" | "q";

export type XY = "x" | "y";

export type Order = "asc" | "desc";

export type GameStatus =
  | "loading"
  | "loading-error"
  | "playing"
  | "game-over"
  | "win"
  | "game-over-win"
  | "control-pick";

export type GestureMethod = "touch" | "swipe" | null;

export type FieldPoint = {
  x: number;
  y: number;
  z: number;
};

export type GameContextProps = {
  fieldMoving: boolean;
  setFieldMoving: React.Dispatch<React.SetStateAction<boolean>>;
  someInputActive: boolean;
  setSomeInputActive: React.Dispatch<React.SetStateAction<boolean>>;
  restarting: boolean;
  setRestarting: React.Dispatch<React.SetStateAction<boolean>>;
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
};

export interface Spot extends FieldPoint {
  value: number;
  newTile: boolean;
}

export interface SpotWithPointCors extends Spot {
  pointCors: { [k in XY]: number };
}

//~~~ ↓↓↓ TABLE ↓↓↓ ~~~//

export interface Column {
  id: "username" | "best" | "wins" | "place";
  label: string;
  minWidth?: number;
  align?: "right";
  format?: (value: number) => string;
}

export interface TableData {
  username: string;
  best: number;
  wins: number;
  personal?: boolean;
}

export interface PersonalTableData extends TableData {
  place: number | string;
}

export type RadiusStats = {
  best: number;
  wins: number;
};

export type UserStats = {
  radius2: RadiusStats;
  radius3: RadiusStats;
  radius4: RadiusStats;
};

export type UserData = {
  username: string;
  stats: UserStats;
};

//~~~ ↓↓↓ AUTH ↓↓↓ ~~~//

export type AuthContextProps = {
  currentUser: User | null | undefined;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  signOut: () => Promise<void>;
};
