import { useState, useEffect } from 'react';
import { getSpotifyLoginUrl } from './spotifyAuth';
import './App.css'

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
const SCOPE = "user-top-read user-read-private";

function App() {
  const [token, setToken] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("spotify_token");
    if (t) setToken(t);
  }, []);

  function handleLogin() {
    window.location = getSpotifyLoginUrl(CLIENT_ID, REDIRECT_URI, SCOPE);
  }

  function handleLogout() {
    setToken("");
    localStorage.removeItem("spotify_token");
  }

  return (
    <div className="container">
      <h1>Spotify Stats Visualizer</h1>
      <p className="subtitle">
        Discover your top genres, artists, and tracks with beautiful charts!
      </p>
      {!token ? (
        <button className="login-btn" onClick={handleLogin}>
          <img
            src="C:\Users\shahp\spotify-stats-visualizer-1\client\src\assets\full-logo-framed.svg"
            alt="Spotify logo"
            style={{ height: 22, verticalAlign: 'middle', marginRight: 10 }}
          />
          Login with Spotify
        </button>
      ) : (
        <>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
          <p>You’re logged in! Ready to see your stats.</p>
        </>
      )}
      <footer>
        <small>Made by Jarett and Parth • Not affiliated with Spotify</small>
      </footer>
    </div>
  );
}

export default App;