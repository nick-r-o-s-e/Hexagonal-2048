// Styles: //
import "./App.scss";

// Components: //
import ErrorMsg from "./components/ErrorMsg/ErrorMsg";
import Game from "./pages/Game/GamePage";
import Root from "./components/Root";
import AuthPage from "./pages/Auth/AuthPage";

// Uitls: //
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AuthProvider } from "./contexts/AuthContext";
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

const customTheme = createTheme({
  palette: {
    info: {
      main: "#000",
    },
    secondary: {
      main: "#c5c5c5",
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorMsg />,
  },
  {
    path: "/auth",
    element: <AuthPage />,
    errorElement: <ErrorMsg />,
  },
  {
    path: "/game",
    element: <Game />,
    errorElement: <ErrorMsg />,
  },
  {
    path: "*",
    element: <Root />,
    errorElement: <ErrorMsg />,
  },
]);

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={customTheme}>
        <RouterProvider router={router} />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
