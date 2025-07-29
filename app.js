import { client } from "./backend/backend.js";

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

function uploadFile() {
  const fileInput = document.getElementById("file-input");

  fileInput.addEventListener("change", (event) => {
    const files = event.target.files[0];
    render(files);
    // deleteFile();
  });
}

function render(files) {
  const filesContainer = document.querySelector(".file-info-container");

  filesContainer.innerHTML += `<div class="file-info">
    <i class="fas fa-file-alt file-icon"></i>
    <div class="file-details">
                <div class="file-name">${files.name}</div>
                <div class="file-size">${files.size}</div>
              </div>
              <i class="fas fa-times remove-file"></i>
              </div>`;
}
uploadFile();

function deleteFile() {
  const removeBtns = document.querySelectorAll(".remove-file");
  removeBtns.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      console.log(btn);
    });
  });
}
