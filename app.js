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

  fileInput.addEventListener("change", async (event) => {
    const files = event.target.files[0];
    uploadData(files);
  });
}
const filesContainer = document.querySelector(".file-info-container");
uploadFile();
async function render() {
  const databaseFile = await fetchImage();
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

  // Inject all HTML at once
  filesContainer.innerHTML = html;

  // Attach delete listeners after rendering
  deleteFile();
}

async function deleteFile() {
  const databaseFile = await fetchImage();
  const removeBtns = document.querySelectorAll(".remove-file");
  console.log(removeBtns);
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

async function uploadData(files) {
  const { data, error } = await client.storage
    .from("quickdrop")
    .upload(`public/${files.name}`, files);
  if (error) {
    console.log(error, error.message);
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
