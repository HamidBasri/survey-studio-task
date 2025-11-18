import { env } from '../config/env'

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

const levelWeights: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  fatal: 50,
}

const isDevelopment = env.NODE_ENV === 'development'
const isProduction = env.NODE_ENV === 'production'

const normaliseLevel = (value: string | undefined): LogLevel => {
  const lower = (value || '').toLowerCase()

  if (lower in levelWeights) {
    return lower as LogLevel
  }

  return isDevelopment ? 'debug' : 'info'
}

const configuredLevel = normaliseLevel(env.LOG_LEVEL)

const shouldLog = (level: LogLevel): boolean => {
  return levelWeights[level] >= levelWeights[configuredLevel]
}

interface LogContext {
  [key: string]: unknown
}

interface LogPayload {
  level: LogLevel
  time: string
  message: string
  context?: LogContext
}

const formatTimestamp = (): string => {
  return new Date().toISOString()
}

const logToConsole = (payload: LogPayload) => {
  const { level, time, message, context } = payload

  if (isProduction) {
    const json = {
      level,
      time,
      message,
      ...(context ? { context } : {}),
    }

    console.log(JSON.stringify(json))
    return
  }

  const parts: unknown[] = [`[${time}]`, level.toUpperCase(), '-', message]

  if (context && Object.keys(context).length > 0) {
    parts.push(context)
  }

  const method: keyof Console =
    level === 'debug' ? 'debug' : level === 'info' ? 'info' : level === 'warn' ? 'warn' : 'error'

  console[method](...parts)
}

class AppLogger {
  private readonly baseContext: LogContext

  constructor(baseContext: LogContext = {}) {
    this.baseContext = baseContext
  }

  private log(level: LogLevel, arg1?: unknown, arg2?: unknown) {
    if (!shouldLog(level)) {
      return
    }

    const time = formatTimestamp()

    let message = ''
    let context: LogContext | undefined

    if (typeof arg1 === 'string') {
      message = arg1
      if (arg2 && typeof arg2 === 'object') {
        context = { ...(this.baseContext || {}), ...(arg2 as LogContext) }
      } else {
        context = { ...(this.baseContext || {}) }
      }
    } else {
      message = typeof arg2 === 'string' ? arg2 : ''
      context = { ...(this.baseContext || {}), ...(arg1 as LogContext | undefined) }
    }

    logToConsole({ level, time, message, context })
  }

  debug(contextOrMessage?: unknown, maybeMessage?: string) {
    this.log('debug', contextOrMessage, maybeMessage)
  }

  info(contextOrMessage?: unknown, maybeMessage?: string) {
    this.log('info', contextOrMessage, maybeMessage)
  }

  warn(contextOrMessage?: unknown, maybeMessage?: string) {
    this.log('warn', contextOrMessage, maybeMessage)
  }

  error(contextOrMessage?: unknown, maybeMessage?: string) {
    this.log('error', contextOrMessage, maybeMessage)
  }

  fatal(contextOrMessage?: unknown, maybeMessage?: string) {
    this.log('fatal', contextOrMessage, maybeMessage)
  }

  child(context: LogContext) {
    return new AppLogger({ ...(this.baseContext || {}), ...context })
  }
}

export const logger = new AppLogger({ env: env.NODE_ENV })

export const createLogger = (context: Record<string, unknown>) => {
  return logger.child(context)
}

export type Logger = typeof logger
