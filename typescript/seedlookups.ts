// Run: npx ts-node seedlookups.ts
// Populates Leave Management leave types.
import dotenv from 'dotenv'
dotenv.config()
import mysql from 'mysql2/promise'

async function run(): Promise<void> {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  })

  await connection.query(
    `INSERT INTO leave_types (id, name, max_days_per_year) VALUES
      (1, 'Casual Leave', 12),
      (2, 'Sick Leave', 10),
      (3, 'Unpaid Leave', 15)
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       max_days_per_year = VALUES(max_days_per_year)`
  )
  console.log('✅ leave_types seeded')

  await connection.end()
  console.log('\nDone')
}

run().catch((err: Error) => console.error('❌ Failed:', err.message))
