const url = process.env.E2E_BASE_URL || "http://127.0.0.1:3000";
for (let i = 0; i < 60; i++) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      console.log("The application is ready");
      process.exit(0);
    }
  } catch {}
  await new Promise((resolve) => setTimeout(resolve, 1000));
}
console.error("The application did not start");
process.exit(1);
