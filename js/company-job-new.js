document.addEventListener("DOMContentLoaded", async function () {
  PortalCommon.bindLogout();

  const form = document.querySelector("#jobForm");
  const jobType = document.querySelector("#jobType");
  const internshipFields = document.querySelector("#internshipFields");
  const departmentOptions = document.querySelector("#departmentOptions");
  const message = document.querySelector("#formMessage");

  function showMessage(text, type) {
    message.textContent = text;
    message.className = `form-message ${type}`;
    message.hidden = false;
  }

  try {
    const session = await PortalCommon.requireSession();

    PortalCommon.setCompanyName(
      session.company.companyShortName ||
      session.company.companyName
    );

    departmentOptions.innerHTML = `
      <p class="portal-muted">科系列表載入中…</p>
    `;

    const departments = await CompanyApi.departments();

    console.log("company.getDepartments 回傳：", departments);

    if (!Array.isArray(departments)) {
      throw new Error("科系 API 回傳格式不正確");
    }

    if (departments.length === 0) {
      departmentOptions.innerHTML = `
        <div class="status-card">
          <strong>尚未建立可用科系</strong>
          <span>
            請確認 Departments 工作表已有資料，
            且 status 欄位為 ACTIVE。
          </span>
        </div>
      `;
    } else {
      departmentOptions.innerHTML = departments
        .map(function (department) {
          return `
            <label class="checkbox-item">
              <input
                type="checkbox"
                name="departmentIds"
                value="${department.departmentId}"
              >
              <span>${department.departmentName}</span>
            </label>
          `;
        })
        .join("");
    }
  } catch (error) {
    console.error("科系列表載入失敗：", error);

    departmentOptions.innerHTML = `
      <div class="status-card">
        <strong>無法載入科系列表</strong>
        <span>${error.message}</span>
      </div>
    `;
  }

  jobType.addEventListener("change", function () {
    internshipFields.hidden = jobType.value !== "INTERNSHIP";
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    message.hidden = true;

    const data = Object.fromEntries(
      new FormData(form).entries()
    );

    data.departmentIds = Array.from(
      form.querySelectorAll(
        'input[name="departmentIds"]:checked'
      )
    ).map(function (input) {
      return input.value;
    });

    if (jobType.value !== "INTERNSHIP") {
      [
        "internshipType",
        "internshipStartDate",
        "internshipEndDate",
        "estimatedTotalHours",
        "isPaid",
        "insuranceDescription",
        "unpaidReason"
      ].forEach(function (field) {
        data[field] = "";
      });
    }

    try {
      const result = await CompanyApi.createJob(data);

      showMessage(
        `職缺 ${result.jobId} 已送出審核`,
        "success"
      );

      form.reset();
      internshipFields.hidden = true;

      setTimeout(function () {
        location.href = "company-jobs.html";
      }, 1800);
    } catch (error) {
      console.error(error);

      let text = error.message || "職缺送出失敗";

      if (Array.isArray(error.details)) {
        text += "：" + error.details
          .map(function (item) {
            return item.code;
          })
          .join("、");
      }

      showMessage(text, "error");
    }
  });
});
