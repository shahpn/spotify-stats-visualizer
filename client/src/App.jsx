// import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useState, useEffect } from 'react';
import { getSpotifyLoginUrl } from './spotifyAuth'; // You need to create this helper file, as described above

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
const SCOPE = "user-top-read user-read-private";

function App() {
  const [count, setCount] = useState(0)
  const [token, setToken] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code && !token) {
      const verifier = localStorage.getItem("spotify_pkce_verifier");
      fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          grant_type: "authorization_code",
          code,
          redirect_uri: REDIRECT_URI,
          code_verifier: verifier,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setToken(data.access_token);
          localStorage.setItem("spotify_token", data.access_token);
          window.history.replaceState({}, document.title, "/");
        });
    } else {
      const t = localStorage.getItem("spotify_token");
      if (t) setToken(t);
    }
  }, [token]);

  function handleLogin() {
    window.location = getSpotifyLoginUrl(CLIENT_ID, REDIRECT_URI, SCOPE);
  }

  function handleLogout() {
    setToken("");
    localStorage.removeItem("spotify_token");
  }

  return (
    <>

      <h1>Your Genre List</h1>
      <p>Built by Jarett and Parth</p>

      {!token ? (
        <button onClick={handleLogin}>Login with Spotify</button>
      ) : (
        <>
          <button onClick={handleLogout}>Logout</button>
          <p>You're logged in! Ready to fetch data.</p>
        </>
      )}

      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
