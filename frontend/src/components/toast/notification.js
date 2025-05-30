function toast({
    title = '', message = '', type = 'success', duration = 3000
}) {
    const main = document.getElementById('toast')
    if (main) {
        const toast = document.createElement('div');

        //auto remove
        const autoRemove = setTimeout(function () {
            main.removeChild(toast);
        }, duration + 1);
        //click remove
        toast.onclick = function (e) {
            if (e.target.closest('.toast__close')) {
                main.removeChild(toast);
                clearTimeout(autoRemove);
            }
        }

        const icons = {
            success: 'fas fa-circle-check',
            info: 'fas fa-info-circle',
            error: 'fas fa-circle-exclamation',
            warning: 'fas fa-triangle-exclamation'
        };
        const icon = icons[type];
        const delay = (duration / 1000).toFixed(2);
        toast.classList.add('toast', `toast--${type}`);
        toast.style.animation = `slideInLeft ease .3s, fadeOut linear 1s ${delay}s forwards`;
        toast.innerHTML = `
            <div class="toast__icon">
                <i class="${icon}"></i>
            </div>
            <div class="toast__body">
                <h3 class="toast__title">${title}</h3>
                <p class="toast__msg"> "${message}"</p>
            </div>
            <div class="toast__close">
                <i class="fa-solid fa-x"></i>
            </div>
        `;
        main.appendChild(toast)

    }
}

function showErrorToast(mess) {
    toast({
        title: 'Error',
        message: mess,
        type: 'error',
        duration: 5000
    });
}


function showSuccessToast(mess) {
    toast({
        title: 'Success',
        message: mess,
        type: 'success',
        duration: 5000
    });
}