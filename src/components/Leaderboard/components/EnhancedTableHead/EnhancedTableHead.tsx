// Styles: //
import "./EnhancedTableHead.scss";

// Components: //
import {
  Box,
  Button,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import EditingInput from "./components/EditingTextfield/EditingInput";

// Utils: //
import { Order, PersonalTableData } from "../../../../common/types";
import { visuallyHidden } from "@mui/utils";
import { columns } from "../LeaderboardTable/LeaderboardTable";
import { useState } from "react";
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

interface Props {
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: "best" | "wins"
  ) => void;
  order: Order;
  orderBy: string;
  personalStats: PersonalTableData | null;
}

export default function EnhancedTableHead({
  order,
  orderBy,
  onRequestSort,
  personalStats,
}: Props) {
  const [editingMode, setEditingMode] = useState(false);

  const createSortHandler =
    (property: "best" | "wins") => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead
      className="table__head"
      sx={{ position: "sticky", top: 0, zIndex: "3" }}
    >
      <TableRow>
        {columns.map((headCell) => {
          return (
            <TableCell
              key={headCell.id}
              className={`table__head__cell table__head__cell--${headCell.id}`}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              {headCell.id == "place" || headCell.id == "username" ? (
                headCell.label
              ) : (
                <TableSortLabel
                  active={orderBy === headCell.id}
                  direction={"desc"} //~~~ Implementation of the both sorting orders => (orderBy === headCell.id ? order : "desc") ~~~//
                  onClick={createSortHandler(headCell.id)}
                >
                  {headCell.label}
                  {orderBy === headCell.id ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order === "desc"
                        ? "sorted descending"
                        : "sorted ascending"}
                    </Box>
                  ) : null}
                </TableSortLabel>
              )}
            </TableCell>
          );
        })}
      </TableRow>
      {personalStats && (
        <TableRow
          hover
          tabIndex={-1}
          key={Math.random() + Math.random()}
          className="table__row--personal-stats"
        >
          {columns.map((column) => {
            let value = personalStats[column.id].toLocaleString();

            return (
              <TableCell
                className={`table__data table__data--${column.id} ${
                  column.id == "place" && `table__data--place--${value}`
                } ${
                  editingMode &&
                  column.id == "username" &&
                  "table__data--editing"
                }`}
                key={column.id}
              >
                {column.id == "username" ? (
                  <>
                    {editingMode ? (
                      <EditingInput
                        username={value}
                        editingMode={editingMode}
                        setEditingMode={setEditingMode}
                      />
                    ) : (
                      <div className="table__row--personal-stats__name-cell">
                        You
                        <span className="table__row--personal-stats__name-cell__username">
                          {value}
                        </span>
                        <Button
                          onClick={() => {
                            setEditingMode(true);
                          }}
                          variant="outlined"
                          color="warning"
                          className="table__row--personal-stats__name-cell__btn"
                          size="small"
                        >
                          edit
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  value
                )}
              </TableCell>
            );
          })}
        </TableRow>
      )}
    </TableHead>
  );
}
