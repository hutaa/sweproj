import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TransferCoursesPage from "./pages/TransferCoursesPage";
import Planner from "./pages/Planner";
import PlannerPrototype from "./pages/PlannerPrototype";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<TransferCoursesPage />} />
                <Route path="/planner" element={<Planner />} />
                <Route path="/planner-prototype" element={<PlannerPrototype />} />
            </Routes>
        </Router>
    );
}

export default App;