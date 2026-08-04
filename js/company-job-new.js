document.addEventListener("DOMContentLoaded", async function () {
  PortalCommon.bindLogout();

  const form = document.querySelector("#jobForm");
  const jobType = document.querySelector("#jobType");
  const internshipFields = document.querySelector("#internshipFields");
  const departmentOptions = document.querySelector("#departmentOptions");
  const message = document.querySelector("#formMessage");
  const submitButton =
    document.querySelector("#jobSubmitButton") ||
    form.querySelector('button[type="submit"]');

  let isSubmitting = false;

  const errorMessages = {
    INVALID_APPLICATION_URL:
      "投遞連結格式不正確，請輸入完整的 https:// 網址",
    APPLICATION_DEADLINE_IN_PAST:
      "投遞截止日不可早於今天",
    SALARY_REQUIRED:
      "請填寫最低薪資",
    FULL_TIME_CANNOT_BE_UNPAID:
      "正職職缺不可設定為無薪",
    FULL_TIME_SALARY_TOO_LOW:
      "正職最低月薪不得低於 35,000 元",
    HOURLY_WAGE_TOO_LOW:
      "時薪不得低於法定最低時薪",
    MONTHLY_WAGE_TOO_LOW:
      "月薪不得低於法定最低月薪",
    INTERNSHIP_FIELDS_MISSING:
      "實習資料尚未填寫完整",
    SUMMER_INTERNSHIP_HOURS_TOO_LOW:
      "暑期實習總時數須達 320 小時以上",
    SEMESTER_INTERNSHIP_PERIOD_TOO_SHORT:
      "學期實習期間須達 4.5 個月以上",
    UNPAID_REASON_REQUIRED:
      "無薪實習必須填寫無薪原因",
    REQUIRED_FIELDS_MISSING:
      "尚有必填欄位未填寫",
    JOB_VALIDATION_FAILED:
      "職缺資料不符合刊登規則"
  };

  function showMessage(text, type) {
    message.textContent = text;
    message.className = `form-message ${type}`;
    message.hidden = false;
    message.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }

  function readableError(error) {
    if (Array.isArray(error.details)) {
      const list = error.details.map(function (item) {
        return errorMessages[item.code] || item.code;
      });

      if (list.length > 0) {
        return [...new Set(list)].join("；");
      }
    }

    if (error.code && errorMessages[error.code]) {
      return errorMessages[error.code];
    }

    return error.message || "職缺送出失敗，請稍後再試";
  }

  function setSubmitting(value) {
    isSubmitting = value;

    if (!submitButton) {
      throw new Error("找不到送出審核按鈕");
    }

    submitButton.disabled = value;
    submitButton.textContent = value ? "送出中…" : "送出審核";
  }

  try {
    const session = await PortalCommon.requireSession();

    PortalCommon.setCompanyName(
      session.company.companyShortName ||
      session.company.companyName
    );

    departmentOptions.innerHTML =
      '<p class="portal-muted">科系列表載入中…</p>';

    const departments = await CompanyApi.departments();

    if (!Array.isArray(departments)) {
      throw new Error("科系 API 回傳格式不正確");
    }

    departmentOptions.innerHTML = departments.length
      ? departments.map(function (department) {
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
        }).join("")
      : `
        <div class="status-card">
          <strong>尚未建立可用科系</strong>
          <span>請確認 Departments 工作表已有 ACTIVE 科系。</span>
        </div>
      `;
  } catch (error) {
    console.error(error);

    departmentOptions.innerHTML = `
      <div class="status-card">
        <strong>無法載入科系列表</strong>
        <span>${error.message}</span>
      </div>
    `;
  }

  jobType.addEventListener("change", function () {
    internshipFields.hidden =
      jobType.value !== "INTERNSHIP";
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (isSubmitting) return;

    if (!form.reportValidity()) {
      return;
    }

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
      setSubmitting(true);

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
      console.error("職缺送出失敗：", error);
      showMessage(readableError(error), "error");
      setSubmitting(false);
    }
  });
});
