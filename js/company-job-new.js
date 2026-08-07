document.addEventListener("DOMContentLoaded",function(){
PortalCommon.bindLogout();
const form=document.querySelector("#jobForm");
const jobType=document.querySelector("#jobType");
const salaryType=document.querySelector("#salaryType");
const internshipFields=document.querySelector("#internshipFields");
const departmentOptions=document.querySelector("#departmentOptions");
const message=document.querySelector("#formMessage");
const submitButton=document.querySelector("#jobSubmitButton")||form.querySelector('button[type="submit"]');
const internshipType=form.elements.internshipType;
const isPaid=form.elements.isPaid;
const internshipStartDate=form.elements.internshipStartDate;
const internshipEndDate=form.elements.internshipEndDate;
const estimatedTotalHours=form.elements.estimatedTotalHours;
const insuranceDescription=form.elements.insuranceDescription;
const unpaidReason=form.elements.unpaidReason;
const salaryMin=form.elements.salaryMin;
const salaryMax=form.elements.salaryMax;
let isSubmitting=false;

const errors={
INVALID_APPLICATION_URL:"投遞連結格式不正確，請輸入完整的 https:// 網址",
APPLICATION_DEADLINE_IN_PAST:"投遞截止日不可早於今天",
SALARY_REQUIRED:"請填寫最低薪資",
FULL_TIME_CANNOT_BE_UNPAID:"正職職缺不可設定為無薪",
FULL_TIME_SALARY_TOO_LOW:"正職最低月薪不得低於 35,000 元",
HOURLY_WAGE_TOO_LOW:"時薪不得低於法定最低時薪",
MONTHLY_WAGE_TOO_LOW:"月薪不得低於法定最低月薪",
INTERNSHIP_FIELDS_MISSING:"實習資料尚未填寫完整",
SUMMER_INTERNSHIP_HOURS_TOO_LOW:"暑期實習總時數須達 320 小時以上",
SEMESTER_INTERNSHIP_PERIOD_TOO_SHORT:"學期實習期間須達 4.5 個月以上",
UNPAID_REASON_REQUIRED:"無薪實習必須填寫無薪原因",
REQUIRED_FIELDS_MISSING:"尚有必填欄位未填寫"
};

function showMessage(text,type){message.textContent=text;message.className=`form-message ${type}`;message.hidden=false;message.scrollIntoView({behavior:"smooth",block:"center"})}
function readableError(error){if(Array.isArray(error.details)){const list=error.details.map(x=>errors[x.code]||x.code);if(list.length)return[...new Set(list)].join("；")}return errors[error.code]||error.message||"職缺送出失敗，請稍後再試"}
function setRequired(el,v){if(el)el.required=v}
function updateUnpaidReason(){const need=jobType.value==="INTERNSHIP"&&isPaid&&isPaid.value==="false";unpaidReason.required=need;if(!need)unpaidReason.value=""}
function updateSalaryFields(){const unpaid=salaryType.value==="UNPAID";salaryMin.disabled=unpaid;salaryMin.required=!unpaid;salaryMax.disabled=unpaid||salaryType.value!=="SALARY_RANGE";if(unpaid){salaryMin.value="";salaryMax.value=""}if(salaryType.value!=="SALARY_RANGE")salaryMax.value=""}
function updateJobTypeFields(){const internship=jobType.value==="INTERNSHIP";internshipFields.hidden=!internship;[internshipType,internshipStartDate,internshipEndDate,estimatedTotalHours,insuranceDescription].forEach(el=>setRequired(el,internship));if(!internship){[internshipType,internshipStartDate,internshipEndDate,estimatedTotalHours,insuranceDescription,unpaidReason].forEach(el=>{if(el)el.value=""});if(isPaid)isPaid.value="true";if(salaryType.value==="UNPAID")salaryType.value=""}updateSalaryFields();updateUnpaidReason()}
function setSubmitting(v){isSubmitting=v;submitButton.disabled=v;submitButton.textContent=v?"送出中…":"送出審核"}
function renderDepartments(departments){if(!Array.isArray(departments))throw new Error("科系 API 回傳格式不正確");departmentOptions.innerHTML=departments.length?departments.map(d=>`<label class="checkbox-item"><input type="checkbox" name="departmentIds" value="${d.departmentId}"><span>${d.departmentName}</span></label>`).join(""):`<div class="status-card"><strong>尚未建立可用科系</strong><span>請確認 Departments 工作表已有 ACTIVE 科系。</span></div>`}

jobType.addEventListener("change",updateJobTypeFields);
salaryType.addEventListener("change",updateSalaryFields);
if(isPaid)isPaid.addEventListener("change",updateUnpaidReason);
updateJobTypeFields();

(async function init(){
departmentOptions.innerHTML='<p class="portal-muted">科系列表載入中…</p>';
try{
const [session,departments]=await Promise.all([PortalCommon.requireSession(),CompanyApi.departments()]);
PortalCommon.setCompanyName(session.company.companyShortName||session.company.companyName);
renderDepartments(departments);
}catch(error){
console.error(error);
departmentOptions.innerHTML=`<div class="status-card"><strong>無法載入科系列表</strong><span>${error.message}</span></div>`;
}
})();

form.addEventListener("submit",async function(event){
event.preventDefault();
if(isSubmitting)return;
updateJobTypeFields();
if(!form.reportValidity())return;
message.hidden=true;
const data=Object.fromEntries(new FormData(form).entries());
data.departmentIds=[...form.querySelectorAll('input[name="departmentIds"]:checked')].map(x=>x.value);
if(jobType.value!=="INTERNSHIP"){["internshipType","internshipStartDate","internshipEndDate","estimatedTotalHours","isPaid","insuranceDescription","unpaidReason"].forEach(k=>data[k]="")}
try{
setSubmitting(true);
const result=await CompanyApi.createJob(data);
showMessage(`職缺 ${result.jobId} 已送出審核`,"success");
form.reset();
updateJobTypeFields();
setTimeout(()=>location.href="company-jobs.html",1800);
}catch(error){
console.error(error);
showMessage(readableError(error),"error");
setSubmitting(false);
}
});
});
