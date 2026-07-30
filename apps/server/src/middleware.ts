import type { NextFunction, Request, RequestHandler, Response } from 'express'
import type { PrismaClient } from '@prisma/client'
import { ZodError } from 'zod'
import { HttpError } from './errors'

declare module 'express-serve-static-core' {
  interface Request {
    clinic: { id: string; name: string; slug: string }
  }
}

/**
 * Fake auth: resolves the current clinic (tenant) from the X-Clinic-Slug
 * header. Missing or unknown slug → 401. Every downstream query is scoped by
 * req.clinic.id; cross-tenant lookups answer 404, never data.
 */
export function clinicResolver(prisma: PrismaClient): RequestHandler {
  return asyncHandler(async (req, _res, next) => {
    const slug = req.header('x-clinic-slug')
    if (!slug) {
      throw new HttpError(401, 'UNAUTHENTICATED', 'Missing X-Clinic-Slug header')
    }
    const clinic = await prisma.clinic.findUnique({ where: { slug } })
    if (!clinic) {
      throw new HttpError(401, 'UNAUTHENTICATED', `Unknown clinic "${slug}"`)
    }
    req.clinic = clinic
    next()
  })
}

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>

/** Express 4 does not forward rejected promises to the error handler. */
export function asyncHandler(fn: AsyncHandler): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next)
  }
}

/** Central error handler: consistent { error: { code, message } } shape. */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Request validation failed', issues: err.issues },
    })
    return
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message } })
    return
  }
  console.error(err)
  res.status(500).json({ error: { code: 'INTERNAL', message: 'Internal server error' } })
}
