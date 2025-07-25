import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { getSpotifyLoginUrl } from './spotifyAuth';
import './App.css';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
const SCOPE = "user-top-read user-read-private";

function Home({ handleLogin }) {
  return (
    <div className="container">
      <h1>Spotify Stats Visualizer</h1>
      <p className="subtitle">Discover your top genres, artists, and tracks with beautiful charts!</p>
      <button className="login-btn" onClick={handleLogin}>
        Login with Spotify
      </button>
      <footer>
        <small>Made by Jarett and Parth • Not affiliated with Spotify</small>
      </footer>
    </div>
  );
}

function Callback({ setToken }) {
  const navigate = useNavigate();
  const { search } = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(search);
    const code = urlParams.get("code");
    const verifier = localStorage.getItem("spotify_pkce_verifier");
    console.log("Verifier in callback:", verifier);
    if (code && verifier) {
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
          console.log("Token exchange response:", data);
          setToken(data.access_token);
          localStorage.setItem("spotify_token", data.access_token);
          console.log("Set token:", data.access_token)
          navigate("/dashboard");
        });
    } else {
      navigate("/");
    }
  }, [search, navigate, setToken]);
  return <div className="container"><p>Logging in with Spotify…</p></div>;
}

function Dashboard({ token, handleLogout }) {
  console.log("DASHBOARD: token =", token);
  const [profile, setProfile] = useState(null);
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    console.log("useEffect running, token:", token);
    if (!token) return;

    // Fetch profile info
    fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(data => {
      console.log("Profile API response:", data);
      setProfile(data);
    });

    // Fetch top 5 artists from last 30 days
    fetch("https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=5", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(data => {
      console.log("Artists API response:", data);
      setArtists(data.items || []);
    });
  }, [token]);

 return (
  <div className="container">
    {/* Show loading state if profile is not loaded yet */}
    {!profile ? (
      <p>Loading your Spotify profile...</p>
    ) : (
      <>
        <img
          src={profile.images?.[0]?.url}
          alt="Profile"
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            marginBottom: 20,
            border: "2px solid #1db954",
            background: "#fff"
          }}
        />
        <h2>Welcome, {profile.display_name}!</h2>
      </>
    )}

    <h3>Top 5 Artists (Last 30 Days)</h3>
    {artists && artists.length > 0 ? (
      <ol style={{ textAlign: "left", margin: "0 auto", maxWidth: 250 }}>
        {artists.map((artist) => (
          <li key={artist.id} style={{ marginBottom: 14, display: "flex", alignItems: "center" }}>
            <img
              src={artist.images?.[2]?.url || artist.images?.[1]?.url || artist.images?.[0]?.url}
              alt={artist.name}
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                objectFit: "cover",
                marginRight: 12,
                border: "1px solid #1db954"
              }}
            />
            <span style={{ fontWeight: 500 }}>{artist.name}</span>
          </li>
        ))}
      </ol>
    ) : (
      <p>No artists found. Try listening to more music on Spotify!</p>
    )}
    <button className="logout-btn" onClick={handleLogout}>Logout</button>
  </div>
);

}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("spotify_token"));

  async function handleLogin() {
    const url = await getSpotifyLoginUrl(CLIENT_ID, REDIRECT_URI, SCOPE);
    window.location = url;

  }
  function handleLogout() {
    setToken("");
    localStorage.removeItem("spotify_token");
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={token ? <Dashboard token={token} handleLogout={handleLogout} /> : <Home handleLogin={handleLogin} />} />
        <Route path="/callback" element={<Callback setToken={setToken} />} />
        <Route path="/dashboard" element={<Dashboard token={token} handleLogout={handleLogout} />} />
        <Route path="*" element={<Home handleLogin={handleLogin} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
