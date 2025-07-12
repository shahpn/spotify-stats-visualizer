// spotifyAuth.js

// --- PURE JS PKCE GENERATOR (no external package needed) ---
function base64urlencode(str) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function pkceChallenge() {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  const code_verifier = base64urlencode(array);
  const encoder = new TextEncoder();
  const data = encoder.encode(code_verifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  const code_challenge = base64urlencode(digest);
  return { code_verifier, code_challenge };
}

export async function getSpotifyLoginUrl(clientId, redirectUri, scope) {
  const pkce = await pkceChallenge();

  if (!pkce.code_challenge || !pkce.code_verifier) {
    throw new Error("Failed to generate PKCE challenge/verifier!");
  }
  localStorage.setItem("spotify_pkce_verifier", pkce.code_verifier);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
    code_challenge_method: "S256",
    code_challenge: pkce.code_challenge,
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}
