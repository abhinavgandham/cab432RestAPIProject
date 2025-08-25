const loginMessage = document.querySelector("#message");
const currentUser = document.querySelector("#currentUser");
const logout = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    localStorage.removeItem('token');
    loginMessage.innerHTML = "Logged out successfully";
    currentUser.innerHTML = "";
    document.querySelector('body').removeChild(document.querySelector('#logoutBtn'));
    setTimeout(() => {
        loginMessage.innerHTML = "";
        currentUser.innerHTML = "";
    }, 5000);
}