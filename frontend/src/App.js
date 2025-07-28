import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GameDashboard from "./components/GameDashboard";
import { GameProvider } from "./contexts/GameContext";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <div className="App">
      <GameProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<GameDashboard />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </GameProvider>
    </div>
  );
}

export default App;
