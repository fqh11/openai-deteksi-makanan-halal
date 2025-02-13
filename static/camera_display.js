const openCameraBtn = document.getElementById('openCamera');
const cameraInput = document.getElementById('camera-input');
const previewContainer = document.getElementById("preview-container");
const previewImg = document.getElementById("preview-img");
const capture = document.getElementById("capture");
const output = document.getElementById("output");
const previewVideo = document.getElementById("preview-video");
const fileInput = document.getElementById("fileInput");
const selectFileBtn = document.getElementById("selectFile");

// Store the selected file globally (only one file at a time)
window.selectedFile = null;

// Detect mobile device
const isMobileDevice = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// 📱 Function for mobile camera
function useMobileCamera() {
    console.log("Using Mobile Camera 📱");
    cameraInput.click();
}

// 💻 Function for desktop camera
function useDesktopCamera() {
    console.log("Using Desktop Camera 💻");
    navigator.mediaDevices.getUserMedia({ video: { width: 400, height: 400 } })
        .then(stream => {
            capture.classList.remove("hidden");
            previewVideo.classList.remove("hidden");
            previewVideo.srcObject = stream;
        })
        .catch(error => console.error("Failed to access camera:", error));
}

// 📤 Function to handle file selection (from any source)
function handleFileSelection(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        previewImg.src = e.target.result;
        previewContainer.classList.remove("hidden");

        // Store the file globally
        window.selectedFile = file;

        console.log("Selected File:", window.selectedFile);
    };
    reader.readAsDataURL(file);
}

// 🖼 Handle file upload from computer
selectFileBtn.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", (event) => {
    handleFileSelection(event.target.files[0]);
});

// 🎥 Open camera based on device type
openCameraBtn.addEventListener("click", () => {
    if (isMobileDevice()) {
        useMobileCamera();
    } else {
        useDesktopCamera();
    }
});

// 📱 Capture image from mobile camera input
cameraInput.addEventListener("change", (event) => {
    handleFileSelection(event.target.files[0]);
});

// 📸 Capture image from desktop video stream
capture.addEventListener("click", () => {
    console.log("Capturing image...");
    const context = output.getContext("2d");
    output.width = 400;
    output.height = 400;

    context.drawImage(previewVideo, 0, 0, output.width, output.height);

    // Convert canvas image to Blob (file format)
    output.toBlob((blob) => {
        window.selectedFile = new File([blob], "captured_image.png", { type: "image/png" });
        console.log("Captured File:", window.selectedFile);

        // Show preview
        previewImg.src = URL.createObjectURL(blob);
        previewContainer.classList.remove("hidden");
    }, "image/png");
});
