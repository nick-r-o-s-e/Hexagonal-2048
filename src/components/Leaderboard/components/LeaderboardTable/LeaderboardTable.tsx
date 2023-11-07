// Styles: //
import "./LeaderboardTable.scss";

// Componetns: //
import EnhancedTableHead from "../EnhancedTableHead/EnhancedTableHead";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { IconButton } from "@mui/material";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";

// Hooks: //
import { useEffect, useMemo, useRef, useState } from "react";

// Utils: //
import { Column, TableData } from "../../../../common/types";
import { Order, PersonalTableData } from "../../../../common/types";
import { getComparator, stableSort } from "../../../../utils/tableUitls";
import RingLoader from "../../../Loaders/RingLoader";
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

export const columns: readonly Column[] = [
  { id: `place`, label: "#" },
  { id: "username", label: "Player" },
  { id: "best", label: "Best Score" },
  {
    id: "wins",
    label: "Wins",
  },
];

export type Props = {
  rows: TableData[];
  loading: boolean;
  searchValue: string;
  failedToFetchData: boolean;
  fetchData: () => Promise<void>;
};

export default function LeaderboardTable({
  rows,
  searchValue,
  loading,
  failedToFetchData,
  fetchData,
}: Props) {
  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [orderBy, setOrderBy] = useState<"best" | "wins">("best");

  const [rowsCount, setRowsCount] = useState(rows.length);

  const [personalStats, setPersonalStats] = useState<PersonalTableData | null>(
    null
  );

  //~~~ Static order ~~~//
  const order: Order = "desc";

  const tableWrapperRef = useRef<HTMLDivElement | null>(null);

  const visibleRows = useMemo(() => {
    let sortedList: PersonalTableData[] = stableSort(
      rows,
      getComparator(order, orderBy, orderBy == "best" ? "wins" : "best")
    ).map((row, i, arr) => {
      const rowData = {
        ...row,
        place: order == "desc" ? i + 1 : arr.length - i,
      };

      if (row.personal) {
        setPersonalStats(
          failedToFetchData ? { ...rowData, place: "-" } : rowData
        );
      }

      return rowData;
    });

    if (searchValue) {
      sortedList = sortedList.filter(
        (row) =>
          row.username.toLowerCase().slice(0, searchValue.length) ==
          searchValue.toLowerCase()
      );
    }

    setRowsCount(sortedList.length);

    return sortedList.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [order, orderBy, page, rowsPerPage, rows, searchValue]);

  //~~~~~ Avoid a layout jump when reaching the last page with empty rows ~~~~~//
  const emptyRows = loading ? 10 : rowsPerPage - visibleRows.length;

  const handleRequestSort = (
    _: React.MouseEvent<unknown>,
    property: "best" | "wins"
  ) => {
    //~~~~~ If you are implementing both sorting orders(declare the order as a state variable): ~~~~~//
    //
    // const isAsc = orderBy === property && order === "asc";
    // setOrder(isAsc ? "desc" : "asc");
    // setOrderBy(property);
    //
    //~~~~~ Else: ~~~~~//
    orderBy != property && setOrderBy(property);
  };

  const scrollTableUp = () => {
    (tableWrapperRef.current as HTMLDivElement).scrollTop = 0;
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    scrollTableUp();
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  useEffect(() => {
    if (failedToFetchData && personalStats) {
      setPersonalStats({ ...personalStats, place: "-" });
    }
  }, [failedToFetchData]);

  useEffect(() => {
    scrollTableUp();
    searchValue && setPage(0);
  }, [searchValue]);

  useEffect(() => {
    !visibleRows.length && scrollTableUp();
  }, [visibleRows]);

  return (
    <div className="table-wrapper">
      <Paper className="table-paper">
        <TableContainer className="table-container" ref={tableWrapperRef}>
          <Table stickyHeader className="table" aria-label="sticky table">
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              personalStats={personalStats}
            />

            <TableBody className="table__body">
              {loading ? (
                <TableRow className="table__body__overlay">
                  <TableCell
                    colSpan={columns.length}
                    className="table__body__overlay__cell"
                  >
                    <RingLoader size="75%" />
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {failedToFetchData ? (
                    <TableRow className="table__body__overlay">
                      <TableCell
                        colSpan={columns.length}
                        className="table__body__overlay__cell"
                      >
                        <span className="no-results">
                          <IconButton
                            onClick={fetchData}
                            className="control no-results__control"
                            aria-label="refetch"
                          >
                            <RestartAltIcon />
                          </IconButton>
                          <p>Failed to fetch data</p>
                        </span>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {visibleRows.map((row) => {
                        return (
                          <TableRow
                            tabIndex={-1}
                            key={Math.random() + Math.random()}
                          >
                            {columns.map((column) => {
                              let value = row[column.id].toLocaleString();

                              return (
                                <TableCell
                                  className={`table__data table__data--${
                                    column.id
                                  } ${
                                    column.id == "place" &&
                                    `table__data--place--${value}`
                                  }`}
                                  key={column.id}
                                >
                                  {value}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}

                      {!visibleRows.length && (
                        <TableRow className="table__body__overlay" style={{
                          height: 390,
                        }}>
                          <TableCell
                            colSpan={columns.length}
                            className="table__body__overlay__cell"
                          >
                            <span className="no-results">
                              <TravelExploreIcon />
                              <p>No Results Found</p>
                            </span>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )}
                </>
              )}

              {emptyRows > 0 && visibleRows.length < 10 && (
                <TableRow
                  style={{
                    height: 40 * Math.min(10, emptyRows),
                  }}
                >
                  <TableCell colSpan={4} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          className="table-pagination"
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rowsCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}
