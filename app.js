function switchTabs() {
  const fileTabBtn = document.querySelector(".file-tab-btn");
  const textTabBtn = document.querySelector(".text-tab-btn");

  const textTab = document.querySelector(".text-tab");
  const fileTab = document.querySelector(".file-tab");
  
  textTabBtn.addEventListener("click", () => {
    textTab.classList.add("active");
    fileTab.classList.remove("active");
  });

  fileTabBtn.addEventListener("click", () => {
    fileTab.classList.add("active");

    textTab.classList.remove("active");
  });

  const allTabs = document.querySelectorAll(".tab");

  allTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      allTabs.forEach((t) => {
        t.classList.remove("active");
        tab.classList.add("active");
      });
    });
  });
}

switchTabs();
