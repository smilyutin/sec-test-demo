import fs from 'node:fs';
import path from 'node:path';

const STATE_FILE = path.join(process.cwd(), '.playwright', 'global-browser.json');

export default async function globalTeardown() {
  const browser = (globalThis as any).__GLOBAL_BROWSER__;

  if (browser) {
    await browser.close();
    return;
  }

  // Fallback: if the runner process doesn't share globals between setup/teardown,
  // attempt to kill the launched browser process by PID.
  try {
    const raw = fs.readFileSync(STATE_FILE, 'utf-8');
    const { pid } = JSON.parse(raw) as { pid?: number | null };

    if (pid) {
      try {
        process.kill(pid, 'SIGTERM');
      } catch {
        // ignore
      }

      // Give it a moment to exit gracefully, then force-kill if needed.
      await new Promise((r) => setTimeout(r, 750));

      try {
        // Signal 0 checks for existence.
        process.kill(pid, 0);
        process.kill(pid, 'SIGKILL');
      } catch {
        // already gone
      }
    }
  } catch {
    // ignore
  } finally {
    try {
      fs.unlinkSync(STATE_FILE);
    } catch {
      // ignore
    }
  }
}
