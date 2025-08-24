// Global variables to track current file and conversion state
let currentFile = null;
let currentJobId = null;
const token = localStorage.getItem('token');
const messageArea = document.querySelector('#uploadMessage');

const openFilePicker = () => {
    const fileInput = document.querySelector('#fileInput');
    fileInput.click();
}

const selectFile = async () => {
    const fileInput = document.querySelector('#fileInput');
    const fileInfo = document.querySelector('#fileInfo');
    const uploadBtn = document.querySelector('#uploadBtn');
    const convertBtn = document.querySelector('#convertBtn');
    const fileName = document.querySelector('#fileName');
    const fileSize = document.querySelector('#fileSize');
    const fileType = document.querySelector('#fileType');

    if (!fileInput.files.length) return;

    const file = fileInput.files[0];

    // Store current file globally
    currentFile = file;

    // Display file info
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    fileType.textContent = file.type || 'Unknown';
    fileInfo.style.display = 'block';
    uploadBtn.disabled = false;
    convertBtn.disabled = true; // Disable until upload is complete

    // Clear any previous messages
    showMessage('File selected successfully!', 'success');
}

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const upload = async () => {
    if (!currentFile) {
        messageArea.textContent = 'No file selected';
        return;
    }

    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        messageArea.textContent = 'Please login first';
        return;
    }

    const uploadBtn = document.querySelector('#uploadBtn');
    const convertBtn = document.querySelector('#convertBtn');

    try {
        // Disable upload button and show loading state
        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Uploading...';

        const formData = new FormData();
        formData.append('file', currentFile);

        const response = await fetch('/api/file/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            messageArea.textContent = 'File uploaded successfully!';
            convertBtn.disabled = false; // Enable conversion after successful upload
            uploadBtn.textContent = 'Upload File';
        } else if (response.status === 401) {
            messageArea.textContent = 'Unauthorized: Please login again';
            uploadBtn.textContent = 'Upload File';
        } else {
            messageArea.textContent = `Error uploading file: ${result.message || 'Unknown error'}`;
            uploadBtn.textContent = 'Upload File';
        }
    } catch(error) {
        console.error('Error uploading file:', error);
        messageArea.textContent = 'Network error: Unable to upload file';
        uploadBtn.textContent = 'Upload File';
    }

    uploadBtn.disabled = false;
}

const showMessage = (message, type = 'info') => {
    messageArea.textContent = message;
    messageArea.className = `message-area ${type}`;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // File input change shows file info
    const fileInput = document.querySelector('#fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', selectFile);
    }
});
