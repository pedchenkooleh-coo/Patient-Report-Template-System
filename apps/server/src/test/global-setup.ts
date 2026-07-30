import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

/** Create a fresh SQLite test database before the test run. */
export default function setup() {
  execSync('npx prisma db push --force-reset --skip-generate', {
    cwd: serverRoot,
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
    stdio: 'inherit',
  })
}
