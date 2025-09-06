import dotenv from 'dotenv'

dotenv.config()

import { neon } from '@neondatabase/serverless'

const { PGHOST, PGUSER, PGPASSWORD, PGDATABASE } = process.env

export const sql = neon(
  `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require&channel_binding=require`
)