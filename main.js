// Session tracking, PIN redirect, logout timer
// EasyPay session manager

// Check session on load
(function () {
  const user = JSON.parse(localStorage.getItem("easypay-user"));
  const pin = localStorage.getItem("easypay-pin");
  const lastActive = parseInt(localStorage.getItem("last-active") || "0");

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // Timeout: 15 minutes = 900,000 ms
  const now = Date.now();
  if (now - lastActive > 15 * 60 * 1000) {
    localStorage.removeItem("easypay-user");
    localStorage.removeItem("easypay-pin");
    localStorage.removeItem("last-active");
    window.location.href = "login.html";
    return;
  }

  // If PIN is set, go to lock screen
  if (pin && location.pathname.endsWith("wallet.html")) {
    window.location.href = "lock.html";
  }

  // Keep user active timestamp refreshed
  const refreshActivity = () => {
    localStorage.setItem("last-active", Date.now());
  };

  document.addEventListener("click", refreshActivity);
  document.addEventListener("keypress", refreshActivity);
  document.addEventListener("mousemove", refreshActivity);
  document.addEventListener("touchstart", refreshActivity);
})();
