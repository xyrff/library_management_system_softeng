const Reservation = require("../models/Reservation");

exports.createReservation = async (req, res) => {
  const reservation = await Reservation.create(req.body);
  res.status(201).json(reservation);
};

exports.getReservations = async (req, res) => {
  const reservations = await Reservation.find().populate("bookId memberId");
  res.json(reservations);
};

exports.updateReservationStatus = async (req, res) => {
  // TODO: when status becomes "fulfilled", trigger notification to the member
  const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(reservation);
};
