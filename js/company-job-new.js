const departments = await CompanyApi.departments();

options.innerHTML = departments
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
