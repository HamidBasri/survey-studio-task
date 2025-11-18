import { env } from '@/lib/config/env'
import { createLogger } from '@/lib/logger'
import { userService } from '@/lib/services/user.service'
import type { JWT } from '@auth/core/jwt'
import type { NextAuthConfig, Session } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import * as z from 'zod'
import type { AuthUser } from './types'

const authLogger = createLogger({ scope: 'nextauth' })

const CredentialsSchema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
})

export const authOptions: NextAuthConfig = {
  secret: env.AUTH_SECRET,
  session: { strategy: 'jwt' },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', required: true },
        password: { label: 'Password', type: 'password', required: true },
      },

      /**
       * Fully typed authorize() — returns AuthUser or null.
       */
      authorize: async (creds): Promise<AuthUser | null> => {
        try {
          if (!creds) {
            authLogger.warn(
              { scope: 'credentials', reason: 'missing_credentials' },
              'Missing credentials',
            )
            return null
          }

          const parsed = CredentialsSchema.safeParse({
            email: creds.email,
            password: creds.password,
          })

          if (!parsed.success) {
            authLogger.warn(
              { scope: 'credentials', issues: parsed.error.issues },
              'Invalid credentials payload',
            )
            return null
          }

          const user = await userService.authenticate(parsed.data.email, parsed.data.password)

          if (!user) {
            authLogger.info(
              { scope: 'credentials', email: parsed.data.email },
              'Authentication failed',
            )
            return null
          }

          authLogger.info(
            { scope: 'credentials', userId: user.id, role: user.role },
            'User authenticated',
          )

          return user
        } catch (error) {
          authLogger.error(
            { scope: 'credentials', err: error },
            'Error during credentials authorization',
          )
          return null
        }
      },
    }),
  ],

  callbacks: {
    /**
     * Inject AuthUser fields into JWT
     */
    async jwt({ token, user }) {
      if (user) {
        authLogger.debug({ scope: 'jwt', userId: user.id }, 'Attaching user to JWT')

        Object.assign(token, {
          id: user.id,
          email: user.email,
          role: user.role,
        })
      }

      return token
    },

    /**
     * Expose AuthUser on session as a fully typed AuthUser.
     */
    async session({ session, token }: { session: Session; token: JWT }) {
      if (!token.id || !token.email || !token.role) {
        authLogger.debug(
          { scope: 'session' },
          'Token missing required user fields; returning base session',
        )
        return session
      }

      const user: AuthUser = {
        id: token.id,
        email: token.email,
        role: token.role,
      }

      session.user = user

      return session
    },
  },
}
