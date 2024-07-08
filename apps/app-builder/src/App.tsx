import PortfolioViewer from "../../portfolio-viewer";
import OrderflowManager from "../../orderflow-manager";
import { Link, Outlet, Route, Routes } from "react-router-dom";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="portfolio-viewer" element={<PortfolioViewer />} />
          <Route path="order-manager" element={<OrderflowManager />} />
        </Route>
      </Routes>
    </>
  )
}

function Layout() {
  return (
    <div>
      <nav>
        <ul>
          <li><Link to="/">Home</Link>          </li>
          <li><Link to="/portfolio-viewer">Portfolio Viewer</Link> </li>
          <li><Link to="/order-manager">Order Manager</Link> </li>
        </ul>
      </nav>
      <Outlet />
      <hr />
    </div>
  )
}

function Home() {
  return (
    <div>
      <h2>Home</h2>
    </div>
  );
}

export default App
