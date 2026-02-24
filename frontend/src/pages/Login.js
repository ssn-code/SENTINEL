import React, { useState } from "react";
import "./Login.css";

function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isSignup ? "register" : "login";

    const res = await fetch(`http://localhost:8000/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (isSignup) {
      if (res.ok) {
        alert("Account created. Please login.");
        setIsSignup(false);
      } else {
        alert(data.detail);
      }
    } else {
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        window.location.href = "/";
      } else {
        alert("Invalid credentials");
      }
    }
  };

  return (
    <div className="login-page">
      <div className="box">
        <div className="login">
          <div className="loginBx">
            <h2>{isSignup ? "Sign Up" : "Login"}</h2>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <input
                type="submit"
                value={isSignup ? "Create Account" : "Sign in"}
              />

              <div className="group">
  <button
    type="button"
    onClick={() => setIsSignup(!isSignup)}
    style={{
      background: "none",
      border: "none",
      color: "#ff2770",
      cursor: "pointer"
    }}
  >
    {isSignup
      ? "Already have account? Login"
      : "Create Account"}
  </button>
</div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;