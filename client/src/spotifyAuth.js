import pkceChallenge from "pkce-challenge";

export function getSpotifyLoginUrl(clientId, redirectUri, scope) {
  // Generate PKCE challenge/verifier
  const pkce = pkceChallenge(); // <-- Don't destructure, use pkce.code_challenge and pkce.code_verifier

  // Sanity check
  if (!pkce.code_challenge || !pkce.code_verifier) {
    throw new Error("Failed to generate PKCE challenge/verifier!");
  }

  // Save verifier in localStorage
  localStorage.setItem("spotify_pkce_verifier", pkce.code_verifier);

  // Build auth URL
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
