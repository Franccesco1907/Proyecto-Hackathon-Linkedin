export const showNotification = (type, title, message, icon) => {
  $.notify({
    icon: icon,
    title,
    message,
    url: ''
  }, {
    element: 'body',
    type: type,
    allow_dismiss: true,
    placement: {
      from: 'top',
      align: 'center'
    },
    offset: {
      x: 15, // Keep this as default
      y: 15 // Unless there'll be alignment issues as this value is targeted in CSS
    },
    spacing: 10,
    z_index: 1080,
    delay: 2500,
    timer: 1000,
    url_target: '_blank',
    mouse_over: false,
    animate: {
      enter: 'animated fadeInDown',
      exit: 'animated fadeOutUp'
    },
    template: '<div data-notify="container" class="alert alert-dismissible alert-{0} alert-notify" role="alert">' +
      '<span class="alert-icon" data-notify="icon"></span> ' +
      '<div class="alert-text"</div> ' +
      '<span class="alert-title" data-notify="title">{1}</span> ' +
      '<span data-notify="message">{2}</span>' +
      '</div>' +
      // '<div class="progress" data-notify="progressbar">' +
      // '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
      // '</div>' +
      // '<a href="{3}" target="{4}" data-notify="url"></a>' +
      '<button type="button" class="close" data-notify="dismiss" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
      '</div>'
  });
}