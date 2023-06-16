const user_model = (first_name, last_name, contact_no, role, email_add, password, status, address, birthdate, emergency_contact, position)=>{

    let User = {
        first_name: first_name,
        last_name: last_name,
        contact_no: contact_no,
        role: role,
        email_add: email_add,
        password: password,
        status: status,
        address: address,
        birthdate: birthdate,
        emergency_contact: emergency_contact,
        position: position
    }
    return User
}

module.exports = {
    user_model
}
