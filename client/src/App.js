import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import "./App.css";
import Registration from "./pages/Registration";
import Main from "./pages/Main";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/registration" element={<Registration />} />
        <Route path="/" element={<Main />} />
      </Routes>
    </Router>
  );
}

export default App;
