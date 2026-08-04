window.CompanyApi=Object.freeze({
TOKEN_KEY:"ntutCompanySession",
async post(action,data={}){const r=await fetch("https://script.google.com/macros/s/AKfycbzOqnAfLMuF9XN7uqTE9i7CXyVPSEIVk1OM6OX4ewaT2YpukH05IY34AwnRvWTiWr1f/exec",{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(Object.assign({action},data))});const p=await r.json();if(!p.success){const e=new Error(p?.error?.message||"系統處理失敗");e.code=p?.error?.code;e.details=p?.error?.details;throw e}return p.data},
sendCode(email){return this.post("company.sendVerificationCode",{email})},
register(data){return this.post("company.register",{data})},
async login(email,password){const d=await this.post("company.login",{email,password});localStorage.setItem(this.TOKEN_KEY,d.token);return d},
token(){return localStorage.getItem(this.TOKEN_KEY)||""},
session(){return this.post("company.getSession",{token:this.token()})},
dashboard(){return this.post("company.getDashboard",{token:this.token()})},
profile(){return this.post("company.getProfile",{token:this.token()})},
updateProfile(data){return this.post("company.updateProfile",{token:this.token(),data})},
jobs(){return this.post("company.getJobs",{token:this.token()})},
createJob(data){return this.post("company.createJob",{token:this.token(),data})},
async logout(){const token=this.token();localStorage.removeItem(this.TOKEN_KEY);try{await this.post("company.logout",{token})}catch(e){console.warn(e)}}
});

departments() {
  return this.post("company.getDepartments", {
    token: this.token()
  });
},
