const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

const contactForm = document.querySelector("[data-contact-form]");
if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = document.querySelector("[data-form-status]");
    status.textContent = "உங்கள் செய்தி பதிவு செய்யப்பட்டது. விரைவில் தொடர்பு கொள்கிறோம்.";
    contactForm.reset();
  });
}

const donationForm = document.querySelector("[data-donation-form]");
if (donationForm) {
  donationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(donationForm);
    const isSubscription = data.get("subscription") || data.get("purpose") === "மாத சந்தா";
    const serial = getNextReceiptSerial();
    const receipt = {
      serial,
      id: `ES-${String(serial).padStart(6, "0")}`,
      date: new Date().toLocaleDateString("ta-IN"),
      donorName: data.get("donorName"),
      phone: data.get("phone"),
      email: data.get("email"),
      purpose: data.get("purpose"),
      amount: `₹${Number(data.get("amount")).toLocaleString("en-IN")}`,
      subscription: isSubscription ? "ஆம் - மாத சந்தா" : "இல்லை",
      paymentStatus: "Demo Success"
    };

    localStorage.setItem("templeReceipt", JSON.stringify(receipt));
    const receipts = JSON.parse(localStorage.getItem("templeReceipts") || "[]");
    receipts.unshift(receipt);
    localStorage.setItem("templeReceipts", JSON.stringify(receipts.slice(0, 100)));
    window.location.href = "receipt.html";
  });
}

const getStoredList = (key, fallback = []) => {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
};

const setStoredList = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const getAdminCredentials = () => {
  try {
    return JSON.parse(localStorage.getItem("templeAdminCredentials") || "{}");
  } catch {
    return {};
  }
};

const getNextReceiptSerial = () => {
  const nextSerial = Number(localStorage.getItem("templeReceiptSerial") || "0") + 1;
  localStorage.setItem("templeReceiptSerial", String(nextSerial));
  return nextSerial;
};

const isAdminLoggedIn = () => localStorage.getItem("templeAdminLoggedIn") === "true";

const donationAmountInput = document.querySelector("[data-donation-form] input[name='amount']");
if (donationAmountInput) {
  const defaultAmount = localStorage.getItem("templeDefaultDonationAmount");
  if (defaultAmount) donationAmountInput.value = defaultAmount;
}

const adminLoginPanel = document.querySelector("[data-admin-login-panel]");
const adminDashboard = document.querySelector("[data-admin-dashboard]");
const adminLoginForm = document.querySelector("[data-admin-login-form]");

const refreshAdminDashboard = () => {
  if (!adminDashboard) return;

  const receipts = getStoredList("templeReceipts");
  const subscriptions = receipts.filter((receipt) => receipt.subscription?.includes("மாத சந்தா"));
  const festivals = getStoredList("templeFestivals");
  const gallery = getStoredList("templeGallery");

  const subscriptionCount = document.querySelector("[data-subscription-count]");
  const festivalCount = document.querySelector("[data-festival-count]");
  const galleryCount = document.querySelector("[data-gallery-count]");
  const adminSubscriptionList = document.querySelector("[data-admin-subscription-list]");

  if (subscriptionCount) subscriptionCount.textContent = subscriptions.length;
  if (festivalCount) festivalCount.textContent = festivals.length;
  if (galleryCount) galleryCount.textContent = gallery.length;

  if (adminSubscriptionList) {
    adminSubscriptionList.innerHTML = subscriptions.length ? subscriptions.map((receipt) => `
      <tr>
        <td>${receipt.id}</td>
        <td>${receipt.donorName}</td>
        <td>${receipt.phone}</td>
        <td>${receipt.purpose}</td>
        <td>${receipt.amount}</td>
      </tr>
    `).join("") : `<tr><td colspan="5">இன்னும் மாத சந்தா ரசீது இல்லை.</td></tr>`;
  }
};

const updateAdminVisibility = () => {
  if (!adminLoginPanel || !adminDashboard) return;

  const loggedIn = isAdminLoggedIn();
  adminLoginPanel.hidden = loggedIn;
  adminDashboard.hidden = !loggedIn;
  if (loggedIn) refreshAdminDashboard();
};

if (adminLoginForm) {
  updateAdminVisibility();
  adminLoginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(adminLoginForm);
    const status = document.querySelector("[data-admin-login-status]");
    const credentials = {
      username: "admin",
      password: "temple123",
      ...getAdminCredentials()
    };

    if (data.get("username") === credentials.username && data.get("password") === credentials.password) {
      localStorage.setItem("templeAdminLoggedIn", "true");
      adminLoginForm.reset();
      updateAdminVisibility();
    } else if (status) {
      status.textContent = "Username அல்லது Password தவறாக உள்ளது.";
    }
  });
}

document.querySelector("[data-admin-logout]")?.addEventListener("click", () => {
  localStorage.removeItem("templeAdminLoggedIn");
  updateAdminVisibility();
});

const adminSettingsForm = document.querySelector("[data-admin-settings-form]");
if (adminSettingsForm) {
  adminSettingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(adminSettingsForm);
    localStorage.setItem("templeAdminCredentials", JSON.stringify({
      username: data.get("username"),
      password: data.get("password")
    }));
    document.querySelector("[data-settings-status]").textContent = "Admin username மற்றும் password மாற்றப்பட்டது.";
    adminSettingsForm.reset();
  });
}

const adminAmountForm = document.querySelector("[data-admin-amount-form]");
if (adminAmountForm) {
  const savedAmount = localStorage.getItem("templeDefaultDonationAmount") || "501";
  adminAmountForm.querySelector("input[name='amount']").value = savedAmount;
  adminAmountForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(adminAmountForm);
    localStorage.setItem("templeDefaultDonationAmount", data.get("amount"));
    document.querySelector("[data-amount-status]").textContent = "Default donation amount மாற்றப்பட்டது.";
  });
}

const adminPoojaForm = document.querySelector("[data-admin-pooja-form]");
if (adminPoojaForm) {
  adminPoojaForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(adminPoojaForm);
    const poojaList = getStoredList("templePoojaTimes");
    poojaList.unshift({
      name: data.get("name"),
      time: data.get("time"),
      details: data.get("details")
    });
    setStoredList("templePoojaTimes", poojaList.slice(0, 30));
    document.querySelector("[data-pooja-status]").textContent = "பூஜை நேரம் சேமிக்கப்பட்டது.";
    adminPoojaForm.reset();
  });
}

const adminFestivalForm = document.querySelector("[data-admin-festival-form]");
if (adminFestivalForm) {
  adminFestivalForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(adminFestivalForm);
    const festivals = getStoredList("templeFestivals");
    festivals.unshift({
      title: data.get("title"),
      date: data.get("date"),
      body: data.get("body")
    });
    setStoredList("templeFestivals", festivals.slice(0, 50));
    document.querySelector("[data-festival-status]").textContent = "விழா அறிவிப்பு சேமிக்கப்பட்டது.";
    adminFestivalForm.reset();
    refreshAdminDashboard();
  });
}

const adminGalleryForm = document.querySelector("[data-admin-gallery-form]");
if (adminGalleryForm) {
  adminGalleryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(adminGalleryForm);
    const gallery = getStoredList("templeGallery");
    gallery.unshift({
      title: data.get("title"),
      imageUrl: data.get("imageUrl")
    });
    setStoredList("templeGallery", gallery.slice(0, 60));
    document.querySelector("[data-gallery-status]").textContent = "புகைப்படம் சேமிக்கப்பட்டது.";
    adminGalleryForm.reset();
    refreshAdminDashboard();
  });
}

const poojaListNode = document.querySelector("[data-pooja-list]");
if (poojaListNode) {
  const poojaList = getStoredList("templePoojaTimes");
  if (poojaList.length) {
    poojaListNode.innerHTML = poojaList.map((item) => `
      <tr><td>${item.name}</td><td>${item.time}</td><td>${item.details}</td></tr>
    `).join("");
  }
}

const festivalListNode = document.querySelector("[data-festival-list]");
if (festivalListNode) {
  const festivals = getStoredList("templeFestivals");
  if (festivals.length) {
    festivalListNode.innerHTML = festivals.map((item) => `
      <article class="event-card"><time>${item.date}</time><h2>${item.title}</h2><p>${item.body}</p></article>
    `).join("");
  }
}

const galleryListNode = document.querySelector("[data-gallery-list]");
if (galleryListNode) {
  const gallery = getStoredList("templeGallery");
  if (gallery.length) {
    galleryListNode.innerHTML = gallery.map((item) => `
      <div class="gallery-item uploaded-photo" style="background-image: linear-gradient(rgba(0,0,0,.12), rgba(0,0,0,.45)), url('${item.imageUrl}')"><span>${item.title}</span></div>
    `).join("");
  }
}

const receiptBox = document.getElementById("receipt");
if (receiptBox) {
  const storedReceipt = JSON.parse(localStorage.getItem("templeReceipt") || "{}");
  const fallback = {
    serial: 1,
    id: "ES-DEMO",
    date: new Date().toLocaleDateString("ta-IN"),
    donorName: "டெமோ பக்தர்",
    phone: "9876543210",
    purpose: "நித்ய பூஜை",
    amount: "₹501",
    subscription: "இல்லை"
  };
  const receipt = { ...fallback, ...storedReceipt };

  document.querySelectorAll("[data-receipt]").forEach((node) => {
    node.textContent = receipt[node.dataset.receipt] || "-";
  });

  document.querySelector("[data-print-receipt]")?.addEventListener("click", () => {
    window.print();
  });

  document.querySelector("[data-download-text]")?.addEventListener("click", () => {
    const lines = [
      "அருள்மிகு ஈசன்யலிங்கேஸ்வரர் அறக்கட்டளை",
      `வரிசை எண்: ${receipt.serial || "-"}`,
      `ரசீது எண்: ${receipt.id}`,
      `தேதி: ${receipt.date}`,
      `பெயர்: ${receipt.donorName}`,
      `மொபைல்: ${receipt.phone}`,
      `வகை: ${receipt.purpose}`,
      `சந்தா: ${receipt.subscription}`,
      `தொகை: ${receipt.amount}`
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${receipt.id}-receipt.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  });
}

const adminForm = document.querySelector("[data-admin-announcement]");
if (adminForm) {
  adminForm.addEventListener("submit", (event) => {
    event.preventDefault();
    document.querySelector("[data-admin-status]").textContent = "அறிவிப்பு டெமோ முறையில் சேமிக்கப்பட்டது.";
    adminForm.reset();
  });
}

const subscriptionList = document.querySelector("[data-subscription-list]");
if (subscriptionList) {
  if (!isAdminLoggedIn()) {
    document.querySelector(".receipt-list-layout").innerHTML = `
      <div class="form-card admin-required">
        <h2>Admin Login தேவை</h2>
        <p>மாத சந்தா ரசீது பட்டியல் admin மட்டும் பார்க்க முடியும்.</p>
        <a class="btn primary" href="admin.html">Admin Login</a>
      </div>
    `;
  } else {
  const storedReceipts = getStoredList("templeReceipts");
  const subscriptions = storedReceipts.filter((receipt) => receipt.subscription?.includes("மாத சந்தா"));
  const emptyState = document.querySelector("[data-subscription-empty]");

  if (subscriptions.length) {
    subscriptionList.innerHTML = subscriptions.map((receipt) => `
      <tr>
        <td>${receipt.id}</td>
        <td>${receipt.date}</td>
        <td>${receipt.donorName}</td>
        <td>${receipt.phone}</td>
        <td>${receipt.purpose}</td>
        <td>${receipt.amount}</td>
        <td><span class="status-pill">செயலில்</span></td>
      </tr>
    `).join("");
  } else if (emptyState) {
    emptyState.hidden = false;
  }

  document.querySelector("[data-print-subscriptions]")?.addEventListener("click", () => {
    window.print();
  });
  }
}

const allReceiptsList = document.querySelector("[data-all-receipts-list]");
if (allReceiptsList) {
  if (!isAdminLoggedIn()) {
    document.querySelector(".receipt-list-layout").innerHTML = `
      <div class="form-card admin-required">
        <h2>Admin Login தேவை</h2>
        <p>அனைத்து நன்கொடை ரசீது பட்டியல் admin மட்டும் பார்க்க முடியும்.</p>
        <a class="btn primary" href="admin.html">Admin Login</a>
      </div>
    `;
  } else {
    const receipts = getStoredList("templeReceipts");
    const emptyState = document.querySelector("[data-all-receipts-empty]");

    if (receipts.length) {
      allReceiptsList.innerHTML = receipts.map((receipt) => `
        <tr>
          <td>${receipt.serial || "-"}</td>
          <td>${receipt.id}</td>
          <td>${receipt.date}</td>
          <td>${receipt.donorName}</td>
          <td>${receipt.phone}</td>
          <td>${receipt.purpose}</td>
          <td>${receipt.subscription || "இல்லை"}</td>
          <td>${receipt.amount}</td>
        </tr>
      `).join("");
    } else if (emptyState) {
      emptyState.hidden = false;
    }

    document.querySelector("[data-print-receipts]")?.addEventListener("click", () => {
      window.print();
    });
  }
}
