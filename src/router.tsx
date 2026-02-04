import { createBrowserRouter } from "react-router-dom";
import { Home } from "./pages/Home";
import { Callback } from "./pages/Callback";
import { MyPage } from "./pages/MyPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/callback",
    element: <Callback />,
  },
  {
    path: "/mypage",
    element: <MyPage />,
  },
]);
