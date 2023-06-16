const reservation_model = (reserved_at, started_at, ended_at, status, user_id, room_id) => {
    let Reservation = {
      reserved_at: reserved_at,
      started_at: started_at,
      ended_at: ended_at,
      status: status,
      user_id: user_id,
      room_id: room_id
    }
    return Reservation
  }

  module.exports = {
    reservation_model
  }