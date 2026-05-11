function getSentEmails() {
  return JSON.parse(localStorage.getItem("sent_emails")) || [];
}

function saveSentEmails(data) {
  localStorage.setItem("sent_emails", JSON.stringify(data));
}

function getDrafts() {
  return JSON.parse(localStorage.getItem("draft_emails")) || [];
}

function saveDrafts(data) {
  localStorage.setItem("draft_emails", JSON.stringify(data));
}

const inboxEmails = [
  { title: "Welcome", from: "admin@repohive.com", body: "Mailbox working." },
  { title: "OTP Verified", from: "security@repohive.com", body: "Success." }
];

const archivedEmails = [
  { title: "Archived Message", from: "archive@repohive.com", body: "This is archived." }
];

let currentBox = "inbox";

function loadMailbox() {
  updateCounts();
  showInbox();
}

function updateCounts() {
  const inbox = document.getElementById("inboxCount");
  const sent = document.getElementById("sentCount");
  const draft = document.getElementById("draftCount");
  const archived = document.getElementById("archivedCount");

  if (inbox) inbox.innerText = inboxEmails.length;
  if (sent) sent.innerText = getSentEmails().length;
  if (draft) draft.innerText = getDrafts().length;
  if (archived) archived.innerText = archivedEmails.length;
}

function showInbox() {
  currentBox = "inbox";
  const t = document.getElementById("mailTitle");
  if (t) t.innerText = "Inbox";
  render(inboxEmails);
}

function showSent() {
  currentBox = "sent";
  const t = document.getElementById("mailTitle");
  if (t) t.innerText = "Sent";
  render(getSentEmails());
}

function showDrafts() {
  currentBox = "drafts";
  const t = document.getElementById("mailTitle");
  if (t) t.innerText = "Drafts";
  render(getDrafts());
}

function showArchived() {
  currentBox = "archived";
  const t = document.getElementById("mailTitle");
  if (t) t.innerText = "Archived";
  render(archivedEmails);
}

function render(data) {
  const list = document.getElementById("mailList");
  if (!list) return;

  list.innerHTML = "";

  if (!data || data.length === 0) {
    list.innerHTML = "<p style='padding:20px;'>No emails found</p>";
    return;
  }

  data.forEach(m => {
    const div = document.createElement("div");
    div.className = "mail-item";

    div.innerHTML = `<strong>${m.title}</strong><small>${m.from}</small>`;

    div.onclick = () => openEmail(m);
    list.appendChild(div);
  });
}

function openEmail(mail) {
  const t = document.getElementById("previewTitle");
  const m = document.getElementById("previewMeta");
  const b = document.getElementById("previewBody");

  if (t) t.innerText = mail.title || "";
  if (m) m.innerText = mail.from || "";
  if (b) b.innerText = mail.body || "";
}

function openCompose() {
  const modal = document.getElementById("composeModal");
  if (modal) modal.classList.add("active");
}

function closeCompose() {
  const modal = document.getElementById("composeModal");
  if (modal) modal.classList.remove("active");
}

function sendEmail() {
  const to = document.getElementById("composeTo")?.value.trim();
  const subject = document.getElementById("composeSubject")?.value.trim();
  const body = document.getElementById("composeBody")?.value.trim();

  if (!to || !subject || !body) {
    alert("Fill all fields");
    return;
  }

  let sent = getSentEmails();

  sent.unshift({
    title: subject,
    from: to,
    body: body
  });

  saveSentEmails(sent);

  updateCounts();
  showSent();
  closeCompose();
}

function saveDraft() {
  const to = document.getElementById("composeTo")?.value.trim();
  const subject = document.getElementById("composeSubject")?.value.trim();
  const body = document.getElementById("composeBody")?.value.trim();

  if (!to && !subject && !body) return;

  let drafts = getDrafts();

  drafts.unshift({
    title: subject || "(No Subject)",
    from: to || "(Draft)",
    body: body || ""
  });

  saveDrafts(drafts);
  updateCounts();
}

function filterMail() {
  const keyword = (document.getElementById("searchMail")?.value || "").toLowerCase();

  let data = [];

  if (currentBox === "inbox") data = inboxEmails;
  else if (currentBox === "sent") data = getSentEmails();
  else if (currentBox === "drafts") data = getDrafts();
  else if (currentBox === "archived") data = archivedEmails;

  const filtered = data.filter(m =>
    (m.title || "").toLowerCase().includes(keyword) ||
    (m.from || "").toLowerCase().includes(keyword) ||
    (m.body || "").toLowerCase().includes(keyword)
  );

  render(filtered);
}

/* ================= OTP ================= */

function sendPhoneOtp() {
  const phone = document.getElementById("phone");
  const warn = document.getElementById("phoneWarn");

  const value = phone?.value.trim();

  if (!value) {
    if (warn) warn.innerText = "Phone number required";
    return;
  }

  if (!/^[0-9+]+$/.test(value)) {
    if (warn) warn.innerText = "Numbers only allowed";
    return;
  }

  localStorage.setItem("otp_code", "123456");
  localStorage.setItem("otp_type", "phone");
  localStorage.setItem("otp_target", value);

  window.location.href = "validate-otp.html";
}

function sendEmailOtp() {
  const email = document.getElementById("email");
  const warn = document.getElementById("emailWarn");

  const value = email?.value.trim();

  if (!value) {
    if (warn) warn.innerText = "Email required";
    return;
  }

  if (!value.includes("@")) {
    if (warn) warn.innerText = "Email must include @";
    return;
  }

  localStorage.setItem("otp_code", "123456");
  localStorage.setItem("otp_type", "email");
  localStorage.setItem("otp_target", value);

  window.location.href = "validate-otp.html";
}

/* ================= OTP PAGE ================= */

function loadOtpTarget() {
  const target = document.getElementById("otpTarget");
  if (!target) return;

  target.innerText = localStorage.getItem("otp_target") || "";
}

function validateOtp() {
  const inputs = document.querySelectorAll(".otp");
  let code = "";

  inputs.forEach(i => code += i.value);

  const real = localStorage.getItem("otp_code");
  const msg = document.getElementById("message");

  if (code.length !== 6) {
    msg.style.color = "red";
    msg.innerText = "Enter 6-digit OTP";
    return;
  }

  if (code === real) {
    msg.style.color = "green";
    msg.innerText = "OTP VERIFIED ✅";

    setTimeout(() => {
      window.location.href = "mailbox.html";
    }, 800);
  } else {
    msg.style.color = "red";
    msg.innerText = "Wrong OTP";
  }
}

document.addEventListener("input", (e) => {
  if (e.target.classList.contains("otp")) {
    if (e.target.value.length === 1) {
      e.target.nextElementSibling?.focus();
    }
  }
});

/* ================= CHATBOT ================= */

function sendChat() {
  const input = document.getElementById("chatInput");
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  addChat("user", text);
  input.value = "";

  setTimeout(() => {
    addChat("bot", botReply(text));
  }, 400);
}

function handleChatKey(e) {
  if (e.key === "Enter") sendChat();
}

function addChat(type, text) {
  const chat = document.getElementById("chatWindow");
  if (!chat) return;

  const div = document.createElement("div");
  div.className = `chat-message ${type}`;

  div.innerHTML = `
    <div class="avatar">${type === "bot" ? "🤖" : "🧑"}</div>
    <div class="bubble">${text}</div>
  `;

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function botReply(text) {
  text = text.toLowerCase();

  if (text.includes("hello") || text.includes("hi")) {
    return "Hello 👋 I can help you with OTP, mailbox, drafts, and email system.";
  }

  if (text.includes("otp")) {
    return "Your OTP is 123456. After verification you will be redirected to mailbox.";
  }

  if (text.includes("mail")) {
    return "Mailbox contains Inbox, Sent, Drafts, and Archived sections.";
  }

  if (text.includes("draft")) {
    return "Drafts are saved locally so you can continue your email later.";
  }

  return "I can help with OTP system, mailbox, drafts, and chat support.";
}

/* ================= GOOGLE LOGIN FIX ================= */

function loginWithGoogle() {
  localStorage.setItem("google_user", JSON.stringify({
    name: "Google User",
    email: "googleuser@gmail.com"
  }));

  const toast = document.getElementById("toast");

  if (toast) {
    toast.innerText = "Google Login Success ✅";
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 2000);
  }

  setTimeout(() => {
    window.location.href = "mailbox.html";
  }, 1200);
}