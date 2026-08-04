window.CompanyApi = Object.freeze({
  TOKEN_KEY: "ntutCompanySession",

  async post(action, data = {}) {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbzOqnAfLMuF9XN7uqTE9i7CXyVPSEIVk1OM6OX4ewaT2YpukH05IY34AwnRvWTiWr1f/exec",
      {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(
          Object.assign(
            { action: action },
            data
          )
        )
      }
    );

    const payload = await response.json();

    if (!payload.success) {
      const error = new Error(
        payload?.error?.message || "系統處理失敗"
      );

      error.code = payload?.error?.code;
      error.details = payload?.error?.details;

      throw error;
    }

    return payload.data;
  },

  sendCode(email) {
    return this.post(
      "company.sendVerificationCode",
      { email: email }
    );
  },

  register(data) {
    return this.post(
      "company.register",
      { data: data }
    );
  },

  async login(email, password) {
    const data = await this.post(
      "company.login",
      {
        email: email,
        password: password
      }
    );

    localStorage.setItem(
      this.TOKEN_KEY,
      data.token
    );

    return data;
  },

  token() {
    return localStorage.getItem(this.TOKEN_KEY) || "";
  },

  session() {
    return this.post(
      "company.getSession",
      {
        token: this.token()
      }
    );
  },

  dashboard() {
    return this.post(
      "company.getDashboard",
      {
        token: this.token()
      }
    );
  },

  profile() {
    return this.post(
      "company.getProfile",
      {
        token: this.token()
      }
    );
  },

  updateProfile(data) {
    return this.post(
      "company.updateProfile",
      {
        token: this.token(),
        data: data
      }
    );
  },

  jobs() {
    return this.post(
      "company.getJobs",
      {
        token: this.token()
      }
    );
  },

  createJob(data) {
    return this.post(
      "company.createJob",
      {
        token: this.token(),
        data: data
      }
    );
  },

  departments() {
    return this.post(
      "company.getDepartments",
      {
        token: this.token()
      }
    );
  },

  async logout() {
    const token = this.token();

    localStorage.removeItem(this.TOKEN_KEY);

    try {
      await this.post(
        "company.logout",
        {
          token: token
        }
      );
    } catch (error) {
      console.warn(error);
    }
  }
});
