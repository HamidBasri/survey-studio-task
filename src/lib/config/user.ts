import { z } from 'zod'

export const USER_ROLES = ['admin', 'user'] as const
export type UserRole = (typeof USER_ROLES)[number]

export const UserRoleSchema = z.enum(USER_ROLES)

export const USER_ROLE = {
  ADMIN: 'admin',
  USER: 'user',
} as const
