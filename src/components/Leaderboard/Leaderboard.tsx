// Styles: //
import "./Leaderboard.scss";

// Hooks: //
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// Components: //
import LeaderboardControls from "./components/LeaderboardControls/LeaderBoardControls";
import LeaderboardTable from "./components/LeaderboardTable/LeaderboardTable";

// Utils: //
import debounce from "lodash.debounce";
import { UserData, UserStats } from "../../common/types";
import { getLeaderboardStats } from "../../firebase/firebase-db";
import { Button } from "@mui/material";
import { useGameContext } from "../../contexts/GameContext";
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

type Props = {
  fieldRadius: number;
};

function Leaderboard({  fieldRadius }: Props) {
  const { currentUser } = useAuth();

  const {userData} = useGameContext()

  const navigate = useNavigate();

  const [radius, setRadius] = useState(fieldRadius);

  const [searchTerm, setSearchTerm] = useState("");

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [fetchedData, setFetchedData] = useState<UserData[]>([]);

  const [loading, setLoading] = useState(true);

  const [failedToFetchData, setFailedToFetchData] = useState(false);

  const rows = useMemo(() => {
    const shallowData = [...fetchedData] as (UserData & {
      personal?: boolean;
    })[];

    currentUser && shallowData.push({ ...userData!, personal: true });

    return shallowData.map(({ username, stats, personal }) => ({
      username,
      personal,
      ...stats[`radius${radius}` as keyof UserStats],
    }));
  }, [radius, fetchedData, userData]);

  const handleSearchInput = (val: string) => {
    setSearchTerm(val);

    handleDebouncedSearch(val);
  };

  const handleDebouncedSearch = useCallback(
    debounce((searchTerm: string) => setDebouncedSearchTerm(searchTerm), 300),
    []
  );

  const fetchData = async () => {
    setLoading(true);

    await getLeaderboardStats(currentUser?.uid)
      .then((data) => {
        setFetchedData(data as UserData[]);
      })
      .catch(() => {
        setFailedToFetchData(true);
      });

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  useEffect(() => {
    setRadius(fieldRadius);
  }, [fieldRadius]);

  return (
    <>
      {!currentUser && (
        <div className="leaderboard-login">
          <Button
            onClick={() => {
              navigate("/auth");
            }}
            className="leaderboard-login__btn"
            variant="contained"
            color="warning"
          >
            Login
          </Button>
          <p>to participate in the leaderboard</p>
        </div>
      )}
      <LeaderboardControls
        radius={radius}
        setRadius={setRadius}
        searchValue={searchTerm}
        handleSearchInput={handleSearchInput}
      />

      <LeaderboardTable
        fetchData={fetchData}
        failedToFetchData={failedToFetchData}
        loading={loading}
        searchValue={debouncedSearchTerm}
        rows={rows}
      />
    </>
  );
}

export default Leaderboard;
