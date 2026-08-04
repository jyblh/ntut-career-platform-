document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("#registerForm");
  const message = document.querySelector("#formMessage");
  const sendButton = document.querySelector("#sendCodeButton");
  const submitButton = document.querySelector("#registerSubmitButton");

  function showMessage(text, type) {
    message.textContent = text;
    message.className = `form-message ${type}`;
    message.hidden = false;
  }

  sendButton.addEventListener("click", async function () {
    const email = form.elements.loginEmail.value.trim();

    if (!email) {
      showMessage("請先輸入登入 Email", "error");
      return;
    }

    sendButton.disabled = true;
    sendButton.textContent = "寄送中…";

    try {
      await CompanyApi.sendCode(email);
      showMessage("驗證碼已寄送，請至信箱查收。", "success");

      let seconds = 60;
      sendButton.textContent = `${seconds} 秒後可重寄`;

      const timer = setInterval(function () {
        seconds -= 1;

        if (seconds <= 0) {
          clearInterval(timer);
          sendButton.disabled = false;
          sendButton.textContent = "重新寄送驗證碼";
          return;
        }

        sendButton.textContent = `${seconds} 秒後可重寄`;
      }, 1000);
    } catch (error) {
      sendButton.disabled = false;
      sendButton.textContent = "寄送驗證碼";
      showMessage(error.message, "error");
    }
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    message.hidden = true;

    const password = form.elements.password.value;
    const confirmPassword = form.elements.confirmPassword.value;

    if (password !== confirmPassword) {
      showMessage("兩次輸入的密碼不一致", "error");
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    delete data.confirmPassword;

    submitButton.disabled = true;
    submitButton.textContent = "建立中…";

    try {
      await CompanyApi.register(data);

      showMessage(
        "帳號建立完成，請等待平台審核。即將前往登入頁。",
        "success"
      );

      setTimeout(function () {
        location.href = "company-login.html";
      }, 2200);
    } catch (error) {
      console.error(error);
      showMessage(error.message || "建立帳號失敗", "error");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "建立企業帳號";
    }
  });
});
