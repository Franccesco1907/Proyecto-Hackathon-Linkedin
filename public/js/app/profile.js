import { postData } from '/utils/fetch.js'
import { showNotification } from '/utils/showNotification.js'

let data = undefined

const getInformation = async () => {
  $('body').css('background-color', '#00629C')
  $('#main-panel').hide()
  $('#loader').show()
  $('#loader-data').modal('show')
  let response = await postData('/search-person-information', { publicId })
  if (response.result === 'OK') {
    data = response.content
    console.log(data)
    $('#loader-data').modal('hide')
    $('body').css('background-color', '')
    $('#main-panel').show()
    $('#loader').hide()
  } else {
    console.log('Algo salió mal')
    $('#loader-data').modal('hide')
  }
  $('#loader-data').modal('hide')
}

const loadInformation = () => {
  if (data) {
    $('#name-user').html(data.linkedin.name.toUpperCase())
    $('.headline-user').html(data.linkedin.headline)
    $('#location-user').html(`${data.linkedin.countryName} (${data.linkedin.location.basicLocation.countryCode.toUpperCase()})`)
    if (data.google.inline_images !== undefined) {
      $('#photo-user').attr('src', data.google.inline_images[0].thumbnail)
    } else if (data.twitter.existsData) {
      $('#photo-user').attr('src', data.twitter.data.profile_image_url)
      $('#photo-user').attr('height', '80px')
    }

    $('#industry-name').html(`(${data.linkedin.industryName != undefined ? data.linkedin.industryName : "No definido"})`)
    if (data.photoInformation.data) {
      $('#age-user').html(' entre ' + Object.keys(data.photoInformation.age)[0].split('-').join(' y ') + ' años')
      let ethnics = []
      for (let ethnic in data.photoInformation.ethnic) {
        ethnics.push({
          type: ethnic,
          value: parseFloat(data.photoInformation.ethnic[ethnic])
        })
      }
      ethnics.sort((a, b) => b.value - a.value)
      $('#ethnic-user').html(' ' + ethnics[0].type)
    } else {
      $('#age-user').html(' no calculada')
      $('#ethnic-user').html(' no calculada')
    }
    for (let work of data.linkedin.experience) loadWork(work)
    for (let education of data.linkedin.education) loadEducation(education)

    if (data.linkedin.skills.length) {
      $('#skills-user').html(data.linkedin.skills.map(s => `<span class="badge badge-pill badge-success mr-1" data-toggle="tooltip" data-placement="top" title="${s.name}">${s.name.length > 30 ? s.name.slice(0, 30) + '...' : s.name}</span>`).join(''))
    } else {
      $('#skills-user').html('No se encontraron')
    }

    for (let page of data.linkedin.contact.websites) {
      $('#web-pages').append(`<a href="${page.url}" class="btn btn-sm btn-info mr-4" target="_blank">${page.label}</a>`)
    }

    if (data.linkedin.contact.websites.length === 0) {
      $('#web-pages').html('No se encontró')
    }

    if (data.linkedin.contact.twitter.length) {
      $('#twitter-username').html(data.linkedin.contact.twitter[0].name)
    } else {
      $('#twitter-username').html(' no encontrado')
    }

    $('#email-username').html(data.linkedin.contact.email_address || 'No se encontró')
    $('#birthdate-username').html(data.linkedin.contact.birthdate || 'No se encontró')
  }
}

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

  await getInformation()
  loadInformation()
  setTimeout(() => {
    $('#loader-data').modal('hide')
  }, 1000)
});

const loadEducation = (education) => {
  let htmlEducation =
    `<div class="timeline-block">
    <span class="timeline-step badge-info">
      <i class="fas fa-university"></i>
    </span>
    <div class="timeline-content">
      <h2 class="text-white mt-0 mb-0">${education.fieldOfStudy || education.degreeName} en <span class="text-info">${education.schoolName || education.school.schoolName}</span></h2>
      <h3 class="font-weight-bold mt-0 mb-0" style="color: #ff8d00;">Desde ${education.timePeriod.startDate.year} hasta ${education.timePeriod.endDate ? education.timePeriod.endDate.year : ' la actualidad'}</h3>
      <h3 class="text-white font-weight-bold mt-3 mb-0">Actividades</h3>
      <p class="text-light text-sm mt-0 mb-0">${education.activities || 'Sin Actividad'}</p>
      <h3 class="text-white font-weight-bold mt-3 mb-0">Descripción</h3>
      <p class="text-light text-sm mt-0 mb-0">${education.description || 'Sin Descripción'}</p>
    </div>
  </div>`

  $('#education-user').append(htmlEducation)
}

const loadWork = (work) => {
  let workDescriptions
  if (work.description) {
    workDescriptions = work.description.split('-')
    workDescriptions.shift()
    workDescriptions = workDescriptions.map(w => `<p class="text-light text-sm mt-1 mb-0">- ${w}</p>`).join('')
  } else {
    workDescriptions = 'Sin Descripción'
  }
  let htmlWork =
    `<div class="timeline-block">
    <span class="timeline-step badge-success">
      <i class="fas fa-briefcase"></i>
    </span>
    <div class="timeline-content">
      <h2 class="text-white mt-0 mb-0">${work.title} en <span class="text-info">${work.companyName}</span></h2>
      <h3 class="font-weight-bold mt-0 mb-0" style="color: #ff8d00;">Desde ${work.timePeriod.startDate.month}/${work.timePeriod.startDate.year} hasta ${work.timePeriod.endDate ? work.timePeriod.endDate.month + '/' + work.timePeriod.endDate.year : ' la actualidad'}</h3>
      ${work.locationName ? `<h3 class="text-white mt-0 mb-2">(${work.locationName})</h3>` : ''}
      <h3 class="text-white font-weight-bold mt-3 mb-0">Descripción</h3>
      ${workDescriptions}
    </div>
  </div>`

  $('#works-user').append(htmlWork)
}