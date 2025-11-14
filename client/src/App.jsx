import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TransferCoursesPage from "./pages/TransferCoursesPage";
import Planner from "./pages/Planner";
import "./styles/Planner.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TransferCoursesPage />} />
        <Route path="/planner" element={<Planner />} />
      </Routes>
    </Router>
  );
}

export default App;