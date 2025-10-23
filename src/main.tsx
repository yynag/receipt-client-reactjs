import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import AdminEntry from "./admin";
import GuideEntry from "./guide";

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
    path: "/guide",
    element: <GuideEntry />
  },
  {
    path: "/admin",
    element: <AdminEntry />
  }
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />,
  </StrictMode>
);
