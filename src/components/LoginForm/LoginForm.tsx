// Styles: //
import "./LoginForm.scss";

// Components: //
import FormBtn from "./components/FormBtn/FormBtn";
import { Alert, Snackbar } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";
import MicrosoftIcon from "@mui/icons-material/Microsoft";
import PageLoader from "../Loaders/PageLoader";
import RingLoader from "../Loaders/RingLoader";

// Hooks: //
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// Assests: //
import bgImage from "../../assets/images/login-form-bg.png";

// Utils: //
import { load } from "../../utils/helpers/loadImgPromise";

// Firebase: //
import {
  githubProvider,
  googleProvider,
  microsoftProvider,
} from "../../firebase/firebase-config";
import { AuthProvider } from "firebase/auth";
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

type Props = {
  snackbar: {
    open: boolean;
    message: string;
  } | null;
  setSnackbar: React.Dispatch<
    React.SetStateAction<{
      open: boolean;
      message: string;
    } | null>
  >;
  formInactive: boolean;
  emailInUseErr: {
    email: string;
    providerId: string;
  } | null;
  login: (provider: AuthProvider) => void;
};

function LoginForm({
  snackbar,
  setSnackbar,
  formInactive,
  emailInUseErr,
  login,
}: Props) {
  const navigate = useNavigate();

  const { loading, signOut } = useAuth();

  const [loadingBannerBg, setLoadingBannerBg] = useState(true);

  useEffect(() => {
    load(bgImage).finally(() => {
      setLoadingBannerBg(false);
    });
  }, []);

  return (
    <div className="home-login">
      <Snackbar
        open={snackbar?.open}
        autoHideDuration={6000}
        onClose={() => {
          setSnackbar(null);
        }}
        message={snackbar?.message}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => {
            setSnackbar(null);
          }}
          variant="filled"
          severity="error"
        >
          {snackbar?.message}
        </Alert>
      </Snackbar>

      {loading || loadingBannerBg ? (
        <PageLoader />
      ) : (
        <div className="login-container">
          <div className="login__banner-wrapper">
            <div
              style={{ backgroundImage: `url(${bgImage})` }}
              className="login__banner"
            >
              <h1 className="login__banner__heading">HEXAGONAL 2048</h1>

              <ul className="login__banner__features">
                <li>Play the famous 2048 on a hexagonal field.</li>

                <li>Choose a different grid size.</li>

                <li>Beat your record to climb the leaderboard.</li>
              </ul>
            </div>
          </div>

          <div className={`login__form ${formInactive && "inactive"}`}>
            {formInactive && (
              <div className="login__form__overlay--loader">
                <RingLoader size="60%" />
              </div>
            )}

            <h2 className="login__form__heading">Welcome</h2>

            <div className="login__form__actions">
              <FormBtn
                err={emailInUseErr}
                disabled={formInactive}
                startIcon={<GoogleIcon />}
                variant="contained"
                color="success"
                size="large"
                id="login-google.com-btn"
                onClick={() => {
                  login(googleProvider);
                }}
              >
                Login with Google
              </FormBtn>

              <FormBtn
                err={emailInUseErr}
                disabled={formInactive}
                startIcon={<GitHubIcon />}
                variant="contained"
                color="info"
                size="large"
                id="login-github.com-btn"
                onClick={() => {
                  login(githubProvider);
                }}
              >
                Login with GitHub
              </FormBtn>

              <FormBtn
                err={emailInUseErr}
                disabled={formInactive}
                startIcon={<MicrosoftIcon />}
                variant="contained"
                color="primary"
                id="login-microsoft.com-btn"
                size="large"
                onClick={() => {
                  login(microsoftProvider);
                }}
              >
                Login with Microsoft
              </FormBtn>

              <p className="login__form__actions__devider">
                <span>or</span>
              </p>

              <FormBtn
                disabled={formInactive}
                variant="contained"
                color="warning"
                onClick={() => {
                  signOut();
                  navigate("/game");
                }}
              >
                Play as a Guest
              </FormBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginForm;
