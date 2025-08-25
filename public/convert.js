const convertBtn = document.querySelector("#convertBtn");
const convertMessageArea = document.querySelector("#convertMessage");

const convert = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      convertMessageArea.textContent = "❌ No token found. Please login again.";
      return;
    }

    const response = await fetch("/api/file/convert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
         if (response.status === 200) {
       const result = await response.json();

       convertMessageArea.textContent = "✅ Conversion completed";

       const downloadLink = document.querySelector("#downloadLink");
       if (downloadLink && result.downloadUrl) {

         const filename = result.downloadUrl.split('/').pop();

         downloadLink.innerHTML = `
           <a href="#" id="downloadBtn" class="download-btn" data-filename="${filename}">
             📥 Download ${result.convertedFile}
           </a>
         `;

         // Enable the download button
         const downloadBtn = document.querySelector("#downloadBtn");
         if (downloadBtn) {
           downloadBtn.disabled = false;
         }
       }

       // Show download section
       const downloadSection = document.querySelector(".download-section");
       if (downloadSection) {
         downloadSection.style.display = "block";
       }
    } else {
      convertMessageArea.textContent = "❌ Error converting file";
    }
  } catch (error) {
    console.error("❌ Error converting file:", error);
    convertMessageArea.textContent = "❌ Error converting file";
  }
};

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  const convertBtn = document.querySelector("#convertBtn");
  if (convertBtn) {
    convertBtn.addEventListener("click", convert);
  }
});
