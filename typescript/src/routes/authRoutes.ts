import { Router } from 'express'

import { requireAuth } from '../middleware/authMiddleware'
import { provisionBalancesWithoutBlockingAuthentication } from '../services/leaveBalanceProvisioningService'

const router = Router()

router.get('/me', requireAuth, async (req, res) => {
  await provisionBalancesWithoutBlockingAuthentication(
    req.user!.centralEmployeeId,
    req.leaveManagementAccessGranted === true
  )

  res.json({
    user: req.user,
  })
})

export default router
