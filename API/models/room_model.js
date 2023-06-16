const room_model = (number, status, price, room_type_id)=>{
    let Room = {
        number: number,
        status: status,
        price: price,
        room_type_id: room_type_id
    }
    return Room
}

module.exports = {
    room_model
}
