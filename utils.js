const checkPassword = (str) => {
    var re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return re.test(str);
}

const checkEmail = (str) => {
    var re = /^[A-Za-z0-9._%+-]+@(gmail|yahoo|outlook)\.com$/;
    return re.test(str);
}

const checkName = (str) => {
    var re = /[!@#$%^&*(),.?":{}|<>]/;
    return re.test(str);
}

const checkNumber = (str) => {
    var re = /^\+639\d{9}$/;
    return re.test(str);
}

const calculateAge = (birthdate) => {
    const today = new Date()
    const birthDate = new Date(birthdate)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

module.exports = {
    checkEmail,
    checkPassword,
    checkName,
    checkNumber,
    calculateAge
}