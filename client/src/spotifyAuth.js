import pkceChallenge from "pkce-challenge";

export function getSpotifyLoginUrl(clientId, redirectUri, scope) {
  const { code_challenge, code_verifier } = pkceChallenge();
  localStorage.setItem("spotify_pkce_verifier", code_verifier);

  const params = new URLSearchParams({
    response_type: "code" ,
    client_id: clientId, 
    scope,
    redirect_uri: redirectUri,
    code_challenge_method: "S256",
    code_challenge,
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;

}