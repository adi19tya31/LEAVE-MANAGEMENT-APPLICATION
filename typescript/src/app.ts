import express, { Request, Response } from 'express'
import cors from 'cors'
import errorHandler from './middleware/errorHandler'
import {
  authRoutes,
  compOffRoutes,
  departmentRoutes,
  employeeRoutes,
  leaveRoutes,
  leaveTypeRoutes,
  notificationRoutes,
  publicHolidayRoutes,
} from './routes'

const app = express()

app.use(cors())
app.use(express.json())
app.use((req, res, next) => {
  console.log(' app.ts REQUEST:', req.method, req.originalUrl)
  next()
})

app.get('/api/health', (req: Request, res: Response) => res.json({ ok: true }))

app.use('/api/auth', authRoutes)
app.use('/api', employeeRoutes)
app.use('/api', departmentRoutes)
app.use('/api', leaveRoutes)
app.use('/api', publicHolidayRoutes)
app.use('/api', compOffRoutes)
app.use('/api', notificationRoutes)
app.use('/api', leaveTypeRoutes)

// must be registered last — catches every next(err) from the routes above
app.use(errorHandler)

export default app
