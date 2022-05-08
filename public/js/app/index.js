import { showNotification } from '/utils/showNotification.js'

$(async () => {
    $('#search-profile').on('click', async () => {
        let publicUrl = $('#public-url').val()
        if (publicUrl === '') {
            showNotification('danger', 'URL Vacío', 'Necesita ingresar un URL de Linkedin', 'fas fa-times')
            $('#public-url').addClass('is-invalid')
            setTimeout(() => {
                $('#public-url').removeClass('is-invalid')
            }, 1500)
            return;
        }

        let publicId = publicUrl.split('/')[4] // Get the publicId which is the linkedin publicUrl last part 
        window.location.replace(`/profile?publicId=${publicId}`)
    })
});