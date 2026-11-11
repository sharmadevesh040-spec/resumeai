import { hashPassword, verifyPassword, signToken, verifyToken } from "../src/lib/auth/crypto";

export function testAuthCrypto() {
  console.log("▶ Running Authentication & Crypto Tests...");

  // 1. Password hashing
  const password = "SuperSecretPassword123!";
  const hash = hashPassword(password);

  if (!hash || !hash.includes(":")) {
    throw new Error("Password hash format invalid");
  }

  const isValid = verifyPassword(password, hash);
  if (!isValid) {
    throw new Error("Password verification failed for correct password");
  }

  const isInvalid = verifyPassword("WrongPassword", hash);
  if (isInvalid) {
    throw new Error("Password verification falsely succeeded for wrong password");
  }

  // 2. JWT Session token signing & verification
  const payload = { userId: "user-12345", role: "USER" };
  const token = signToken(payload, 24);

  const decoded = verifyToken(token);
  if (!decoded || decoded.userId !== "user-12345") {
    throw new Error("Token verification failed or returned wrong payload");
  }

  // 3. Tampered token rejection
  const tamperedToken = token.slice(0, -5) + "abcde";
  const tamperedResult = verifyToken(tamperedToken);
  if (tamperedResult !== null) {
    throw new Error("Tampered token was not rejected");
  }

  console.log("  ✔ Password hashing and JWT verification tests passed.");
}
