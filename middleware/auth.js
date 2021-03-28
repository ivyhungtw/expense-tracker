module.exports = {
  authenticator: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    }
    // If user doesn't login,
    // redirect to login page and show warning message
    req.flash('warning_msg', 'Please login first!')
    res.redirect('/users/login')
  }
}
