import App from "./src/App";
interface IRoutes {
  name: string;
  path: string;
  component: any;
}

export const routesDefinition: IRoutes[] = [
  {
    name: "Portfolio Viewer",
    path: "/portfolio-viewer",
    component: App
  }
];

