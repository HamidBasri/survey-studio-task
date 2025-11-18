'use client'

import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm, type ControllerRenderProps } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { USER_ROLES, type UserRole } from '@/lib/config/user'

type RegisterFormValues = {
  email: string
  password: string
  confirmPassword: string
  role: UserRole
}

export default function RegisterPage() {
  const router = useRouter()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<RegisterFormValues>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user',
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setSubmitError(null)

    if (values.password !== values.confirmPassword) {
      setSubmitError('Passwords do not match')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email, password: values.password, role: values.role }),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          message?: string
          errors?: Array<{ path: string[]; message: string }>
        } | null

        // Display detailed validation errors if available
        if (data?.errors && data.errors.length > 0) {
          const errorMessages = data.errors.map((err) => err.message).join(', ')
          setSubmitError(errorMessages)
        } else {
          setSubmitError(data?.message || 'Unable to create account')
        }
        return
      }

      router.push('/login')
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold">Create account</h1>
        <p className="text-muted-foreground text-sm">Sign up with your email and password</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            rules={{ required: 'Email is required' }}
            render={({ field }: { field: ControllerRenderProps<RegisterFormValues, 'email'> }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" className="h-11" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            rules={{ required: 'Password is required' }}
            render={({
              field,
            }: {
              field: ControllerRenderProps<RegisterFormValues, 'password'>
            }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className="h-11 pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            rules={{ required: 'Please confirm your password' }}
            render={({
              field,
            }: {
              field: ControllerRenderProps<RegisterFormValues, 'confirmPassword'>
            }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className="h-11 pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            rules={{ required: 'Please select a role' }}
            render={({ field }: { field: ControllerRenderProps<RegisterFormValues, 'role'> }) => (
              <FormItem>
                <FormLabel>Account type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-row flex-wrap gap-4"
                  >
                    {USER_ROLES.map((role) => (
                      <div key={role} className="flex items-center space-x-2">
                        <RadioGroupItem value={role} id={role} />
                        <Label htmlFor={role} className="cursor-pointer font-normal capitalize">
                          {role}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {submitError && (
            <p className="text-destructive text-sm" role="alert">
              {submitError}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Sign up'}
          </Button>
        </form>
      </Form>

      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{' '}
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
