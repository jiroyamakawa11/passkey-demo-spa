const encoder = new TextEncoder();

const base64UrlEncode = (input: Uint8Array) => {
  let binary = "";
  for (const byte of input) {
    binary += String.fromCharCode(byte);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const randomBytes = (length: number) => {
  const buffer = new Uint8Array(length);
  crypto.getRandomValues(buffer);
  return buffer;
};

export const generatePkce = async () => {
  const verifier = base64UrlEncode(randomBytes(48));
  const challengeBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(verifier));
  const challenge = base64UrlEncode(new Uint8Array(challengeBuffer));

  return { verifier, challenge };
};

export const generateNonce = (length = 24) => base64UrlEncode(randomBytes(length));
