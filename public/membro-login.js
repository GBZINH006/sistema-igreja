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
    input.value = value;
  }

  function maskCpf(input) {
    let value = onlyDigits(input.value).slice(0, 11);
    value = value
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    input.value = value;
  }

  function showAlert(message, type = "info") {
    const alert = $("#auth-alert");
    alert.textContent = message;
    alert.className = `auth-alert show ${type === "error" ? "error" : ""}`.trim();
  }

  function saveMemberSession(row) {
    if (!row?.account_id || !row?.session_token) {
      throw new Error("A conta foi processada, mas a sessão não foi retornada. Confira se o SQL da área do membro foi aplicado.");
    }

    localStorage.setItem(MEMBER_SESSION_KEY, JSON.stringify({
      accountId: row.account_id,
      token: row.session_token,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone || "",
      cpf: row.cpf || "",
      avatarUrl: row.avatar_url || ""
    }));
  }

  function authMessage(error, fallback) {
    return error?.message || fallback;
  }

  function setLoading(form, loading) {
    const button = form.querySelector("button[type='submit']");
    if (!button.dataset.defaultText) button.dataset.defaultText = button.innerHTML;
    button.disabled = loading;
    button.innerHTML = loading ? '<i class="fa-solid fa-circle-notch fa-spin"></i> Aguarde...' : button.dataset.defaultText;
  }

  function switchTab(tab) {
    document.querySelectorAll(".tab").forEach((button) => {
      button.classList.toggle("active", button.dataset.tab === tab);
    });
    $("#signup-form").classList.toggle("active", tab === "signup");
    $("#login-form").classList.toggle("active", tab === "login");
    $("#auth-alert").className = "auth-alert";
  }

  async function redirectIfLogged() {
    try {
      const saved = JSON.parse(localStorage.getItem(MEMBER_SESSION_KEY) || "null");
      if (saved?.token) window.location.replace("membro.html");
    } catch (error) {
      localStorage.removeItem(MEMBER_SESSION_KEY);
    }
  }

  async function signup(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setLoading(form, true);

    const firstName = $("#signup-first-name").value.trim();
    const lastName = $("#signup-last-name").value.trim();
    const email = $("#signup-email").value.trim().toLowerCase();
    const phone = $("#signup-phone").value.trim();
    const cpf = $("#signup-cpf").value.trim();
    const password = $("#signup-password").value;

    try {
      if (onlyDigits(phone).length < 10) throw new Error("Informe um telefone válido.");
      if (onlyDigits(cpf).length !== 11) throw new Error("Informe um CPF válido.");

      const { data, error } = await db.rpc("member_register_account", {
        p_first_name: firstName,
        p_last_name: lastName,
        p_email: email,
        p_phone: phone,
        p_cpf: cpf,
        p_password: password
      });

      if (error) throw error;
      saveMemberSession(data?.[0]);
      window.location.href = "membro.html";
    } catch (error) {
      showAlert(authMessage(error, "Não foi possível criar a conta."), "error");
    } finally {
      setLoading(form, false);
    }
  }

  async function login(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setLoading(form, true);

    try {
      const { data, error } = await db.rpc("member_login_account", {
        p_email: $("#login-email").value.trim().toLowerCase(),
        p_password: $("#login-password").value
      });

      if (error) throw error;
      saveMemberSession(data?.[0]);
      window.location.href = "membro.html";
    } catch (error) {
      showAlert(authMessage(error, "Não foi possível entrar."), "error");
    } finally {
      setLoading(form, false);
    }
  }

  document.querySelectorAll(".tab").forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });

  $("#signup-phone").addEventListener("input", (event) => maskPhone(event.currentTarget));
  $("#signup-cpf").addEventListener("input", (event) => maskCpf(event.currentTarget));
  $("#signup-form").addEventListener("submit", signup);
  $("#login-form").addEventListener("submit", login);
  redirectIfLogged();
})();
