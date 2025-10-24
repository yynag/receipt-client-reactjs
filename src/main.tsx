import { lazy, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { LazyLoad } from "./components/LazyLoad";

import "./main.css";

const AdminEntry = lazy(() => import("./domains/admin"));
const HomeEntry = lazy(() => import("./domains/home"));
const RedeemEntry = lazy(() => import("./domains/redeem"));

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div>
        <div>Hello World</div>
      </div>
    )
  },
  {
    path: "/home",
    element: LazyLoad(HomeEntry)
  },
  {
    path: "/admin",
    element: LazyLoad(AdminEntry)
  },
  {
    path: "/redeem",
    element: LazyLoad(RedeemEntry)
  }
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
