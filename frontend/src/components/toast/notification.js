function toast({
    title = '', message = '', type = 'success', duration = 3000
}) {
    const main = document.getElementById('toast')
    if (main) {
        // Đảm bảo toast container có styles đúng
        main.style.position = 'fixed';
        main.style.top = '32px';
        main.style.right = '32px';
        main.style.zIndex = '9999999';
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
        
        // Thêm inline styles để đảm bảo toast hiển thị
        toast.style.position = 'relative';
        toast.style.minWidth = '400px';
        toast.style.maxWidth = '450px';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.backgroundColor = '#fff';
        toast.style.borderRadius = '2px';
        toast.style.borderLeft = '4px solid';
        toast.style.padding = '10px 0';
        toast.style.boxShadow = '0 5px 8px rgba(0, 0, 0, 0.08)';
        toast.style.marginBottom = '10px';
        
        // Set border color based on type
        const borderColors = {
            success: 'rgb(40, 188, 75)',
            error: 'red',
            warning: 'rgb(210, 143, 19)',
            info: 'rgb(60, 179, 238)'
        };
        toast.style.borderLeftColor = borderColors[type] || borderColors.success;
        toast.innerHTML = `
            <div class="toast__icon" style="font-size: 24px; margin-left: 10px; color: ${borderColors[type]};">
                <i class="${icon}"></i>
            </div>
            <div class="toast__body" style="flex-grow: 1;">
                <h3 class="toast__title" style="font-size: 16px; font-weight: 600; color: #373737; margin-left: 10px; margin-top: 3px; margin-bottom: 0;">${title}</h3>
                <p class="toast__msg" style="margin-left: 10px; line-height: 1.5; margin-top: 6px; margin-bottom: 0; color: #666;"> ${message}</p>
            </div>
            <div class="toast__close" style="padding: 0 16px; font-size: 20px; color: rgba(0, 0, 0, 0.7); cursor: pointer;">
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

export { showErrorToast, showSuccessToast };