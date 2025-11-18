import type { UserRole } from '@/lib/config/user'

/**
 * Single authoritative user type.
 * Used in:
 *  - JWT
 *  - Session
 *  - NextAuth.User
 */
export type AuthUser = {
  id: string
  email: string
  role: UserRole
}

/**
 * NextAuth module augmentation
 */
declare module 'next-auth' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface User extends AuthUser {}

  interface Session {
    user: AuthUser
  }
}

/**
 * JWT augmentation (NextAuth v5 uses @auth/core/jwt)
 */
declare module '@auth/core/jwt' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface JWT extends AuthUser {}
}
