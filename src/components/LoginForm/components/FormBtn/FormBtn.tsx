import "./FormBtn.scss";
import { ButtonProps, Button } from "@mui/material";

function FormBtn({
  ...props
}: ButtonProps & {
  err?: {
    email: string;
    providerId: string;
  } | null;
}) {
  const emailErr = props.err && props.err.providerId == props.id?.split("-")[1];

  return (
    <div className="login__form__actions__btn--wrapper">
      <Button
        {...props}
        className={`login__form__actions__btn ${emailErr && "err"}`}
      >
        {props.children}
      </Button>

      {emailErr && (
        <p className="login__form__actions__err">
          Email: ({props.err!.email}) <br /> already in use!
        </p>
      )}
    </div>
  );
}

export default FormBtn;
