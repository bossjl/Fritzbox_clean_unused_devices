async function wipeAllInactiveWlan() {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const form = document.querySelector('form[name="main_form"]');
  if (!form) {
    console.error("Form not found. Make sure you are on WLAN > Sicherheit.");
    return;
  }

  // Collect all inactive delete buttons currently in the table
  const rows = Array.from(document.querySelectorAll('#uiWlanDevs tr[id^="uiViewRow"]'));
  const inactiveBtns = rows
    .filter(row => row.querySelector('.wlan_rssi0') || (row.querySelector('button.delete')?.getAttribute('onclick') || '').includes(",'0',"))
    .map(row => row.querySelector('button.delete'))
    .filter(Boolean);

  console.log(`Found ${inactiveBtns.length} inactive devices to delete...`);

  for (let i = 0; i < inactiveBtns.length; i++) {
    const btn = inactiveBtns[i];
    const formData = new URLSearchParams(new FormData(form));
    formData.set(btn.name, btn.value); // Sets delete=wlanXX:XX:XX:XX:XX:XX

    console.log(`[${i + 1}/${inactiveBtns.length}] Deleting ${btn.value}...`);

    try {
      await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });
    } catch (err) {
      console.error(`Failed on ${btn.value}:`, err);
    }

    // Give the FRITZ!Box 7390 CPU 1.5 seconds to save each deletion
    await sleep(1500);
  }

  console.log("All inactive devices deleted! Reloading page...");
  location.reload();
}

wipeAllInactiveWlan();
