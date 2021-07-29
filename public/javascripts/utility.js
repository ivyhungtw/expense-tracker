// Ask for confirmation before deleting
const checkDelete = () => {
  return window.confirm('Are you sure to delete it?')
}

// Toggle password type
const togglePassword = document.querySelector('#togglePassword')
const password = document.querySelector('#password')

togglePassword.addEventListener('click', function (e) {
  // toggle the type attribute
  const type =
    password.getAttribute('type') === 'password' ? 'text' : 'password'
  password.setAttribute('type', type)
  // toggle the eye / eye slash icon
  this.classList.toggle('fa-eye')
  this.classList.toggle('fa-eye-slash')
})
