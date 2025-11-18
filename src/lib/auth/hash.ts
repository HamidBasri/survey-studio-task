/**
 * Hash a password using Bun's built-in argon2id.
 */
export async function hashPassword(password: string): Promise<string> {
  return await Bun.password.hash(password, {
    algorithm: 'argon2id',
    memoryCost: 65536, // 64MB (recommended)
    timeCost: 4, // safe, recommended default
  })
}

/**
 * Verify a password using Bun's built-in password API.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await Bun.password.verify(password, hash)
}
