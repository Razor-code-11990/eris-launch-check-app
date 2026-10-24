// The Scheduled Task of the launch check: FAIL=1 makes a Run fail.
if (process.env.FAIL === '1') {
  console.error('failing as FAIL=1 asks');
  process.exit(1);
}

console.log(`task ran at ${new Date().toISOString()}`);
