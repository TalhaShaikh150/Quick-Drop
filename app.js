import { client } from "./backend/backend.js";

//Global Variables
const filesContainer = document.querySelector(".file-info-container");
const loader = document.querySelector(".loader");
const shareTextBtn = document.querySelector(".btn-share");

const alertMessage = document.querySelector(".alert-message");
const fileName = document.querySelector(".file-error-name");
const textInput = document.querySelector(".text-area");

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

renderPreviousText();

async function shareText() {
  let userText;
  textInput.addEventListener("input", async () => {
    userText = textInput.value;
    saveTextToStorage(userText);
  });

 shareTextBtn.addEventListener("click", async () => {
  const { data, error } = await client
    .from('quickdrop')
    .upsert(
      { id: 1, quickText: userText },
      { onConflict: 'id' }             
    )
    .select();

  if (data) {
    console.log(data);
  }

  if (error) {
    console.log(error, error.message);
  }
});

  
}

shareText();

function saveTextToStorage(userText) {
  localStorage.setItem("userText", JSON.stringify(userText));
}

async function renderPreviousText() {
  // let previousText = JSON.parse(localStorage.getItem("userText")) ||
  const { data, error } = await client.from("quickdrop").select();
  data.forEach((element) => {
   let previousText  =  element.quickText

   textInput.value = previousText
   
  });
}

function uploadFile() {
  const fileInput = document.getElementById("file-input");

  fileInput.addEventListener("change", async (event) => {
    const files = event.target.files[0];
    uploadData(files);
  });
}

async function render() {
  loader.style.display = "block";

  const databaseFile = await fetchImage();

  if (databaseFile) {
    loader.style.display = "none";
  }

  filesContainer.innerHTML = "";

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
        <i class="fas fa-times remove-file"}"></i>
      </div>`;
  });

  filesContainer.innerHTML = html;
  deleteFile();
  clearAllFiles();
}

async function deleteFile() {
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

async function clearAllFiles() {
  const clearAllBtn = document.querySelector(".btn-clear");
  const databaseFile = await fetchImage();
  databaseFile.forEach((file) => {
    clearAllBtn.addEventListener("click", async () => {
      const { data, error } = await client.storage
        .from("quickdrop")
        .remove([`public/${file.name}`]);
      if (data) {
        filesContainer.innerHTML = "";

        await render();
      }
    });
  });
}

async function uploadData(files) {
  const { data, error } = await client.storage
    .from("quickdrop")
    .upload(`public/${files.name}`, files);
  if (error) {
    if (error.message == "The resource already exists") {
      alertMessage.classList.remove("none");
      fileName.innerHTML = `'${files.name}'`;
    }
  }
  if (data) {
    console.log("image send");
    filesContainer.innerHTML = "";
    fetchImage();
    render();
  }
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

render();
uploadFile();
switchTabs();
