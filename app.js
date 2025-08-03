// ========== Imports ==========
import { client } from "./backend/backend.js";

// ========== Global Variables ==========
const filesContainer = document.querySelector(".file-info-container");
const loader = document.querySelector(".loader");
const shareTextBtn = document.querySelector(".btn-share");
const clearAllBtn = document.querySelector(".btn-clear");
const fileResult = document.querySelector(".result-file");
const textResult = document.querySelector(".result-text");
const alertMessage = document.querySelector(".alert-message");
const fileName = document.querySelector(".file-error-name");
const textInput = document.querySelector(".text-area");

// ========== UI Interaction ==========
function switchTabs() {
  const fileTabBtn = document.querySelector(".file-tab-btn");
  const textTabBtn = document.querySelector(".text-tab-btn");
  const textTab = document.querySelector(".text-tab");
  const fileTab = document.querySelector(".file-tab");
  const allTabs = document.querySelectorAll(".tab");

  textTabBtn.addEventListener("click", () => {
    textTab.classList.add("active");
    fileTab.classList.remove("active");
  });

  fileTabBtn.addEventListener("click", () => {
    fileTab.classList.add("active");
    textTab.classList.remove("active");
  });

  allTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      allTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
    });
  });
}

// ========== Share Text Functionality ==========
async function shareText() {
  let userText;

  textInput.addEventListener("input", async () => {
    userText = textInput.value;
    if (!userText) {
      textResult.classList.add("none");
    }
    saveTextToStorage(userText);
    shareTextBtn.disabled = false;
    shareTextBtn.classList.remove("success", "pulse");
  });

  shareTextBtn.addEventListener("click", async () => {
    shareTextBtn.classList.add("loading");
    shareTextBtn.disabled = true;

    const { data, error } = await client
      .from("quickdrop")
      .upsert({ id: 1, quickText: userText }, { onConflict: "id" })
      .select();

    if (data) {
      textResult.classList.remove("none");
      shareTextBtn.classList.remove("loading");
      shareTextBtn.classList.add("success", "pulse");
    }

    if (error) {
      console.log(error, error.message);
    }
  });
}

function saveTextToStorage(userText) {
  localStorage.setItem("userText", JSON.stringify(userText));
}

async function renderPreviousText() {
  const { data, error } = await client.from("quickdrop").select();
  data.forEach((element) => {
    let previousText = element.quickText;
    textInput.value = previousText;
  });
}

// ========== Upload Functionality ==========
function uploadFile() {
  const fileInput = document.getElementById("file-input");

  fileInput.addEventListener("change", async (event) => {
    clearAllBtn.classList.remove("success", "pulse");
    clearAllBtn.disabled = false;

    const files = event.target.files[0];
    uploadData(files);
  });
}

async function uploadData(files) {
  if (!files || !files.name) {
    console.error("No file selected or invalid file.");
    return;
  }

  const { data, error } = await client.storage
    .from("quickdrop")
    .upload(`public/${files.name}`, files);

  if (error) {
    console.log("Upload error:", error);

    if (error.message === "The resource already exists") {
      alertMessage.classList.remove("none");
      fileName.innerHTML = `'${files.name}'`;
      setTimeout(() => {
        alertMessage.classList.add("none");
      }, 3000);
      fetchImage();
      render();
    }
    return;
  }

  if (data) {
    clearAllBtn.classList.remove("none");
    fileResult.classList.remove("none");

    filesContainer.innerHTML = "";
    fetchImage();
    render();
  }
}

// ========== Render and File Management ==========
async function render() {
  filesContainer.innerHTML = "";
  loader.style.display = "block";
  clearAllBtn.classList.add("none");
  fileResult.classList.add("none");

  const databaseFile = await fetchImage();

  loader.style.display = "none";

  if (!databaseFile || databaseFile.length === 0) {
    return;
  }

  clearAllBtn.classList.remove("none");
  fileResult.classList.remove("none");

  let html = "";
  databaseFile.forEach((file) => {
    html += `
      <div class="file-info">
        <i class="fas fa-file-alt file-icon"></i>
        <div class="file-details">
          <div class="file-name">${file.name}</div>
          <div class="file-size">
            ${(file.metadata.size / (1024 * 1024)).toFixed(2)} MB
          </div>
        </div>
        <i class="fas fa-times remove-file"></i>
      </div>`;
  });

  filesContainer.innerHTML = html;
  deleteFile();
  clearAllFiles();
}

async function fetchImage() {
  const { data, error } = await client.storage.from("quickdrop").list("public");

  if (error) {
    console.error("Error fetching images:", error.message);
    return [];
  }

  if (data) {
    const validFiles = data.filter(
      (file) => file.name !== ".emptyFolderPlaceholder"
    );
    return validFiles;
  }

  return [];
}

async function deleteFile() {
  if (filesContainer.innerHTML === "") {
    clearAllBtn.classList.add("none");
  }

  const databaseFile = await fetchImage();
  const removeBtns = document.querySelectorAll(".remove-file");

  removeBtns.forEach((btn, index) => {
    btn.addEventListener("click", async () => {
      let removed = databaseFile[index].name;

      const { data, error } = await client.storage
        .from("quickdrop")
        .remove([`public/${removed}`]);

      if (data) {
        filesContainer.innerHTML = "";
        await render();
      }
    });
  });
}

const downloadBtn = document.querySelector(".download-files");

async function downloadFiles() {
  downloadBtn.disabled = true;
  downloadBtn.innerText = "Downloading...";

  const databaseFile = await fetchImage();
  const imageUrl =
    "https://oeuieksflauztarkxvsk.supabase.co/storage/v1/object/public/quickdrop/public/";

  for (const file of databaseFile) {
    const res = await fetch(`${imageUrl}${file.name}`);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = file.name; // Use the actual file name
    a.click();
    URL.revokeObjectURL(a.href);
  }

  downloadBtn.disabled = false;
  downloadBtn.innerText = "Download Files";
}

downloadBtn.addEventListener("click", downloadFiles);

async function clearAllFiles() {
  const databaseFile = await fetchImage();

  databaseFile.forEach((file) => {
    clearAllBtn.addEventListener("click", async () => {
      clearAllBtn.classList.add("loading");
      clearAllBtn.disabled = true;

      const { data, error } = await client.storage
        .from("quickdrop")
        .remove([`public/${file.name}`]);

      if (data) {
        clearAllBtn.classList.remove("loading");
        clearAllBtn.classList.add("success");
        filesContainer.innerHTML = "";

        await render();
      }
    });
  });
}

function copyLink() {
  const resultUrl = document.querySelectorAll(".result-url");
  let pageUrl = window.location.href;
  const copyBtn = document.querySelectorAll(".copy-btn");
  copyBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
      navigator.clipboard.writeText(pageUrl);

      btn.innerHTML = `<i class="fa-solid fa-check"></i> Copied`;
      setTimeout(() => {
        btn.innerHTML = `Copy Link`;
      }, 1500);
    });
  });
  resultUrl.forEach((element) => {
    element.innerHTML = pageUrl;
  });
}

function copySharedText() {
  const copyBtnText = document.querySelector(".copy-text-btn");
  copyBtnText.addEventListener("click", () => {
    navigator.clipboard.writeText(textInput.value);

    copyBtnText.innerHTML = `<i class="fa-solid fa-check"></i> Copied`;
    setTimeout(() => {
      copyBtnText.innerHTML = `Copy`;
    }, 1500);
  });
}
copySharedText();

// ========== Initial Calls ==========
copyLink();
uploadFile();
render();
switchTabs();
renderPreviousText();

shareText();
