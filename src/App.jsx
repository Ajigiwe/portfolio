import { Routes, Route } from "react-router-dom";
import Terminal from "./components/Terminal";
import AdminPage from "./pages/AdminPage";
import PortfolioPage from "./pages/PortfolioPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Terminal />} />
      <Route path="/visual" element={<PortfolioPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}
