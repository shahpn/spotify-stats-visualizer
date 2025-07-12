import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { getSpotifyLoginUrl } from './spotifyAuth';
import './App.css';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
const SCOPE = "user-top-read user-read-private user-read-email";

function Dashboard({ token, handleLogout }) {
  const [profile, setProfile] = useState(null);
  const [artists, setArtists] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    // Log token for debugging
    console.log("Spotify access token:", token);

    if (!token) {
      setError("No Spotify token found. Please log in again.");
      return;
    }

    // --- Fetch Spotify Profile Info ---
    // Docs: https://developer.spotify.com/documentation/web-api/reference/get-current-users-profile
    fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(data => {
        console.log("Profile API response:", data); // Log for debugging
        if (data.error) {
          setError(data.error.message || "Could not load profile.");
          setProfile(null);
        } else {
          setProfile(data);
        }
      })
      .catch(e => {
        console.log("Network/profile error:", e);
        setError("Network error loading profile.");
      });

    // --- Fetch Top 5 Artists (Last 30 Days) ---
    // Docs: https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
    // Endpoint: /v1/me/top/artists
    // Query: time_range=short_term (last 4 weeks), limit=5
    fetch("https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=5", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(data => {
        console.log("Top artists API response:", data); // Log for debugging
        if (data.error) {
          setError(data.error.message || "Could not load top artists.");
          setArtists([]);
        } else {
          setArtists(data.items || []);
        }
      })
      .catch(e => {
        console.log("Network/artists error:", e);
        setError("Network error loading artists.");
      });
  }, [token]);

  return (
    <div className="container">
      {/* Show error if present */}
      {error && (
        <p style={{ color: "#ff5c5c", marginBottom: 12, fontWeight: "bold" }}>
          {error}
        </p>
      )}

      {/* Show loading message if profile not loaded and no error */}
      {!profile && !error && <p>Loading your Spotify profile...</p>}

      {/* Show profile info when loaded */}
      {profile && (
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

      {/* Show artists if available */}
      {artists.length > 0 ? (
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
        !error && <p>No artists found. Try listening to more music on Spotify!</p>
      )}
      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("spotify_token"));

  function handleLogin() {
    window.location = getSpotifyLoginUrl(CLIENT_ID, REDIRECT_URI, SCOPE);
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
