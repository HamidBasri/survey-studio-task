import NextAuth from 'next-auth'
import { authOptions } from './nextauth-options'

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions)
