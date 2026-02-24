import React from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";

function App() {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Login />;
  }

  return <Home />;
}

export default App;