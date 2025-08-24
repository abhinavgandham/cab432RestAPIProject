const convertBtn = document.querySelector('#convertBtn');
const convertMessageArea = document.querySelector('#convertMessage');
const downloadBtn = document.querySelector('#downloadBtn');

const convert = async () => {
   try {
       const token = localStorage.getItem('token');
       if (!token) {
           convertMessageArea.textContent = '❌ No token found. Please login again.';
           return;
       }

       const response = await fetch('/api/file/convert', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
                 // No body needed - backend gets file from user's session
    })
    if (response.status === 200) {
        convertMessageArea.textContent = '✅ Conversion completed';
        downloadBtn.disabled = false;
    }
    else {
        convertMessageArea.textContent = '❌ Error converting file';
    }
    } catch (error) {
        console.error('❌ Error converting file:', error);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const convertBtn = document.querySelector('#convertBtn');
    if (convertBtn) {
        convertBtn.addEventListener('click', convert);
    }
});