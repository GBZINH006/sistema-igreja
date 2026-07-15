(function () {
  const { createClient } = window.supabase;
  const db = createClient(window.CONFIG.SUPABASE_URL, window.CONFIG.SUPABASE_KEY);
  const MEMBER_SESSION_KEY = "ad_bela_vista_member_session";

  const $ = (selector) => document.querySelector(selector);

  function onlyDigits(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function maskPhone(input) {
    let value = onlyDigits(input.value).slice(0, 11);
    if (value.length <= 10) {
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    } else {
      value = value.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
    }
    input.value = value.trim();
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
  }

  function clearInvalid(form) {
    form.querySelectorAll(".invalid").forEach((input) => input.classList.remove("invalid"));
  }

  function markInvalid(input) {
    input?.classList.add("invalid");
    input?.focus();
  }

  function showAlert(message, type = "info") {
    const alert = $("#auth-alert");
    alert.textContent = message;
    alert.className = `auth-alert show ${type}`.trim();
  }

  function getSessionStorageTarget() {
    return $("#remember-access")?.checked ? localStorage : sessionStorage;
  }

  function saveMemberSession(row) {
    if (!row?.account_id || !row?.session_token) {
      throw new Error("A conta foi processada, mas não foi possível iniciar a sessão. Tente entrar novamente.");
    }

    const session = JSON.stringify({
      accountId: row.account_id,
      token: row.session_token,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone || "",
      cpf: row.cpf || "",
      avatarUrl: row.avatar_url || ""
    });

    localStorage.removeItem(MEMBER_SESSION_KEY);
    sessionStorage.removeItem(MEMBER_SESSION_KEY);
    getSessionStorageTarget().setItem(MEMBER_SESSION_KEY, session);
  }

  function friendlyError(error, fallback) {
    const raw = String(error?.message || "").toLowerCase();
    if (raw.includes("e-mail ou senha")) return "E-mail ou senha não conferem. Verifique os dados e tente novamente.";
    if (raw.includes("duplicate") || raw.includes("unique") || raw.includes("ja possui") || raw.includes("já possui")) {
      return "Já existe uma conta com este e-mail. Use o login ou solicite ajuda para recuperar o acesso.";
    }
    if (raw.includes("network") || raw.includes("fetch")) return "Não foi possível conectar agora. Verifique a internet e tente novamente.";
    return fallback;
  }

  function setLoading(form, loading, text = "Aguarde...") {
    const button = form.querySelector("button[type='submit']");
    if (!button.dataset.defaultText) button.dataset.defaultText = button.innerHTML;
    button.disabled = loading;
    button.innerHTML = loading ? `<i class="fa-solid fa-circle-notch fa-spin"></i> ${text}` : button.dataset.defaultText;
  }

  function switchTab(tab) {
    document.querySelectorAll(".tab").forEach((button) => {
      button.classList.toggle("active", button.dataset.tab === tab);
    });
    $("#signup-form").classList.toggle("active", tab === "signup");
    $("#login-form").classList.toggle("active", tab === "login");
    $("#auth-alert").className = "auth-alert";

    const title = $(".auth-card-head h2");
    const copy = $(".auth-card-head p");
    if (tab === "login") {
      title.textContent = "Já possui uma conta? Faça login.";
      copy.textContent = "Use o e-mail e a senha cadastrados para entrar no portal.";
    } else {
      title.textContent = "Ainda não tem acesso? Solicite cadastro.";
      copy.textContent = "A solicitação exige consentimento LGPD e pode ser revisada pela administração da igreja.";
    }
  }

  async function redirectIfLogged() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(MEMBER_SESSION_KEY) || localStorage.getItem(MEMBER_SESSION_KEY) || "null");
      if (saved?.token) window.location.replace("membro.html");
    } catch (error) {
      localStorage.removeItem(MEMBER_SESSION_KEY);
      sessionStorage.removeItem(MEMBER_SESSION_KEY);
    }
  }

  function validateLogin(form) {
    clearInvalid(form);
    const email = $("#login-email");
    const password = $("#login-password");
    if (!isValidEmail(email.value)) {
      markInvalid(email);
      throw new Error("Informe um e-mail válido para entrar.");
    }
    if (!password.value) {
      markInvalid(password);
      throw new Error("Informe sua senha para continuar.");
    }
  }

  function validateSignup(form) {
    clearInvalid(form);
    const firstName = $("#signup-first-name");
    const lastName = $("#signup-last-name");
    const email = $("#signup-email");
    const phone = $("#signup-phone");
    const password = $("#signup-password");
    const consent = $("#lgpd-consent");

    if (firstName.value.trim().length < 2) {
      markInvalid(firstName);
      throw new Error("Informe seu nome.");
    }
    if (lastName.value.trim().length < 2) {
      markInvalid(lastName);
      throw new Error("Informe seu sobrenome.");
    }
    if (!isValidEmail(email.value)) {
      markInvalid(email);
      throw new Error("Informe um e-mail válido.");
    }
    if (onlyDigits(phone.value).length < 10) {
      markInvalid(phone);
      throw new Error("Informe um telefone válido com DDD.");
    }
    const passwordBytes = new TextEncoder().encode(password.value).length;
    if (passwordBytes < 8 || passwordBytes > 72 || !/[a-zA-Z]/.test(password.value) || !/\d/.test(password.value)) {
      markInvalid(password);
      throw new Error("Use uma senha com pelo menos 8 caracteres, contendo letras e números.");
    }
    if (!consent.checked) {
      markInvalid(consent);
      throw new Error("Para solicitar cadastro, é necessário aceitar os termos de privacidade.");
    }
  }

  async function signup(event) {
    event.preventDefault();
    const form = event.currentTarget;

    try {
      validateSignup(form);
    } catch (error) {
      showAlert(error.message, "error");
      return;
    }

    setLoading(form, true, "Enviando solicitação...");

    const firstName = $("#signup-first-name").value.trim();
    const lastName = $("#signup-last-name").value.trim();
    const email = $("#signup-email").value.trim().toLowerCase();
    const phone = $("#signup-phone").value.trim();
    const password = $("#signup-password").value;

    try {
      const { data, error } = await db.rpc("member_register_account", {
        p_first_name: firstName,
        p_last_name: lastName,
        p_email: email,
        p_phone: phone,
        p_password: password
      });

      if (error) throw error;
      saveMemberSession(data?.[0]);
      showAlert("Conta criada com segurança. Redirecionando para o portal do membro...", "success");
      window.location.href = "cadastro.html?origem=membro&primeiro_acesso=1";
    } catch (error) {
      showAlert(friendlyError(error, "Não foi possível solicitar o cadastro agora. Revise os dados ou tente novamente."), "error");
    } finally {
      setLoading(form, false);
    }
  }

  async function login(event) {
    event.preventDefault();
    const form = event.currentTarget;

    try {
      validateLogin(form);
    } catch (error) {
      showAlert(error.message, "error");
      return;
    }

    setLoading(form, true, "Autenticando...");

    try {
      const { data, error } = await db.rpc("member_login_account", {
        p_email: $("#login-email").value.trim().toLowerCase(),
        p_password: $("#login-password").value
      });

      if (error) throw error;
      saveMemberSession(data?.[0]);
      showAlert("Acesso confirmado. Redirecionando...", "success");
      window.location.href = "membro.html";
    } catch (error) {
      showAlert(friendlyError(error, "Não foi possível entrar. Verifique seus dados e tente novamente."), "error");
    } finally {
      setLoading(form, false);
    }
  }

  function forgotPassword() {
    showAlert("Para proteger seus dados, a recuperação de senha deve ser solicitada à secretaria ou administração da igreja. Por segurança, não informamos se o e-mail está cadastrado.", "info");
  }

  document.querySelectorAll(".tab").forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });

  $("#signup-phone").addEventListener("input", (event) => maskPhone(event.currentTarget));
  $("#signup-form").addEventListener("submit", signup);
  $("#login-form").addEventListener("submit", login);
  $("#forgot-password").addEventListener("click", forgotPassword);
  redirectIfLogged();
})();
