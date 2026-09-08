import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import MemberDashboard from "./pages/MemberDashboard.jsx";
import Catalog from "./pages/Catalog.jsx";
import LibrarianDashboard from "./pages/LibrarianDashboard.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<MemberDashboard />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/librarian" element={<LibrarianDashboard />} />
    </Routes>
  );
}

export default App;
