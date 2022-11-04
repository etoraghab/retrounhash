import Swal from 'sweetalert2'

export var toast = Swal.mixin({
    toast: true,
    position: 'bottom-right',
    timerProgressBar: true,
    showConfirmButton: false,
})

export function alert(title, text, buttonText = 'ok') {
    Swal.fire({
        title: title,
        text: text,
        confirmButtonText: buttonText,
        showCloseButton: false
    })
}