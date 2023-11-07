// Styles: //
import "./EditingInput.scss";

// Components: //
import { IconButton, TextField } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import CircularProgress from "@mui/material/CircularProgress";

// Hooks: //
import React, { useEffect, useState } from "react";
import { useGameContext } from "../../../../../../contexts/GameContext";
import { useAuth } from "../../../../../../contexts/AuthContext";

// Utils: //
import {
  updateUsername,
  usernameInUse,
} from "../../../../../../firebase/firebase-db";
import { UserData } from "../../../../../../common/types";
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

type Props = {
  username: string;
  editingMode: boolean;
  setEditingMode: React.Dispatch<React.SetStateAction<boolean>>;
};

function EditingInput({ username, editingMode, setEditingMode }: Props) {
  const { currentUser } = useAuth();

  const { fieldMoving, someInputActive, setSomeInputActive, setUserData } =
    useGameContext();

  const [validatingNewName, setValidatingNewName] = useState(false);

  const [validationErr, setValidationErr] = useState("");

  const [inputVal, setInputVal] = useState("");

  const cancelEditing = () => {
    setEditingMode(false);
    setSomeInputActive(false);
  };

  const newNameIsValid = async (name: string) => {
    setValidatingNewName(true);

    if (!name) {
      throw new Error("Name is required");
    } else if (name.length > 40) {
      throw new Error("Max 40 characters");
    } else {
      return await usernameInUse(name)
        .then((nameExists) => {
          if (nameExists) {
            throw new Error("Username in use");
          } else {
            return true;
          }
        })
        .catch((err) => {
          const errMsg =
            err.message == "Failed to fetch existing usernames"
              ? "Error occured"
              : err.message;

          throw new Error(errMsg);
        });
    }
  };

  const handleConfirm = (newName: string) => {
    if (validationErr) {
      return;
    } else if (newName == username) {
      cancelEditing();
    }

    newNameIsValid(newName)
      .then(() => {
        updateUsername(currentUser!.uid, newName, username)
          .then(() => {
            setUserData(
              (prevVal) => ({ ...prevVal, username: newName } as UserData)
            );
            cancelEditing();
          })
          .catch((err) => {
            setValidationErr(err.message);
          });
      })
      .catch((err) => {
        setValidationErr(err.message);
      });
  };

  useEffect(() => {
    validationErr && setValidatingNewName(false);
  }, [validationErr]);

  useEffect(() => {
    !fieldMoving &&
      editingMode != someInputActive &&
      setSomeInputActive(editingMode);
  }, [fieldMoving]);
 
  return (
    <div
      className={`edit-username-textfield-wrapper 
      `}
    >
      <TextField
        inputRef={(input) => input && input.focus()}
        error={!!validationErr}
        className="edit-username-textfield"
        size="small"
        id="outlined-textarea"
        label={validationErr || "Username"}
        color="warning"
        placeholder={username}
        value={inputVal}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleConfirm(inputVal);
          }
        }}
        onChange={(e) => {
          setValidationErr("");
          setInputVal(e.currentTarget.value);
        }}
        onFocus={() => {
          !fieldMoving ? setSomeInputActive(true) : setEditingMode(true);
        }}
        onBlur={cancelEditing}
      />
      <div className="edit-username-textfield__action edit-username-textfield__action--confirm">
        {validatingNewName ? (
          <CircularProgress
            className="edit-username-textfield__loader"
            color="success"
          />
        ) : (
          <IconButton
            disabled={!!validationErr}
            color="success"
            onMouseDown={(e) => {
              e.preventDefault();
            }}
            onClick={() => {
              handleConfirm(inputVal);
              // console.log(inputVal);
            }}
            className="edit-username-textfield__btn edit-username-textfield__btn--confirm"
          >
            <CheckIcon />
          </IconButton>
        )}
      </div>
      <div className="edit-username-textfield__action edit-username-textfield__action--cancel">
        <IconButton
          color="error"
          onMouseDown={(e) => {
            e.preventDefault();
          }}
          onClick={cancelEditing}
          className="edit-username-textfield__btn edit-username-textfield__btn--cancel"
        >
          <CloseIcon />
        </IconButton>
      </div>
    </div>
  );
}

export default EditingInput;
