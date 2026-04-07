import React from "react";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
function App() {
  return (
    <div className="min-h-screen w-full">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </div>
  );
}

export default App;
