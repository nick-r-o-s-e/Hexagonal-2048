// Hooks: //
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

// Components: //
import LoginForm from "../../components/LoginForm/LoginForm";

// Firebase: //
import { FirebaseError } from "firebase/app";
import {
  AuthProvider,
  User,
  UserCredential,
  getAdditionalUserInfo,
  getRedirectResult,
  linkWithRedirect,
  signInWithPopup,
} from "firebase/auth";
import { addNewUser } from "../../firebase/firebase-db";
import { auth, enabledProviders } from "../../firebase/firebase-config";
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

function AuthPage() {
  const navigate = useNavigate();

  const { state: locationState } = useLocation();

  const { currentUser, setLoading } = useAuth();

  const [formInactive, setFormInactive] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
  } | null>(null);

  const [emailInUseErr, setEmailInUseErr] = useState<{
    email: string;
    providerId: string;
  } | null>(null);

  const promptSnackbar = (message?: string) => {
    setSnackbar({ open: true, message: message || "Something went wrong" });

    setFormInactive(false);
  };

  const proceed = (res: UserCredential) => {
    if (getAdditionalUserInfo(res)?.isNewUser) {
      addNewUser(res)
        .then(() => {
          navigate("/game");
        })
        .catch(() => {
          currentUser?.delete();

          setLoading(false);

          promptSnackbar("Failed to create a new user account, try later");
        });
    } else {
      navigate("/game");
    }
  };

  const login = (provider: AuthProvider) => {
    setFormInactive(true);

    setEmailInUseErr(null);

    if (
      currentUser?.providerData.some(
        (data) => data.providerId == provider.providerId
      )
    ) {
      navigate("/game");
    } else {
      signInWithPopup(auth, provider)
        .then((userCreds) => {
          setLoading(true);

          proceed(userCreds);
        })
        .catch((err) => {
          handleLogInError(err, currentUser, provider);
        });
    }
  };

  const handleLogInError = (
    err: FirebaseError,
    user: User | null | undefined,
    provider: AuthProvider | undefined
  ) => {
    setLoading(false);

    if (
      err.code === "auth/account-exists-with-different-credential" &&
      err.customData?._tokenResponse &&
      provider
    ) {
      const { providerId } = provider;

      //~~~ If a user hasn`t logged in, is using a different email or loging in with a microsoft: ~~~//
      if (
        providerId == "microsoft.com" ||
        !user ||
        user.email !== err.customData.email
      ) {
        const { email }: { email?: string } = err.customData;

        if (email && providerId) {
          setEmailInUseErr({ email, providerId });
        } else {
          promptSnackbar();
        }

        setFormInactive(false);
      } else {
        //~~~ If a user has logged in with the same credentials(email) try to link google and github accounts.
        setLoading(true);

        linkWithRedirect(user, provider);
      }
    } else if (err.code == "auth/popup-closed-by-user") {
      promptSnackbar("Popup window was closed");
    } else {
      promptSnackbar();
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0)

    getRedirectResult(auth)
      .then((res) => {
        if (res) {
          proceed(res);
        } else {
          if (locationState?.dbDataLost) {
            promptSnackbar();
            window.history.replaceState({}, document.title);
          }

          setLoading(false);
        }
      })

      .catch((err) => {
        const provider = enabledProviders.find(
          (provider) =>
            provider.providerId == err.customData._tokenResponse.providerId
        );

        handleLogInError(err, auth.currentUser, provider);
      });
  }, []);

  return (
    <LoginForm
      snackbar={snackbar}
      setSnackbar={setSnackbar}
      formInactive={formInactive}
      emailInUseErr={emailInUseErr}
      login={login}
    />
  );
}

export default AuthPage;
