/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  Alert,
  Accordion,
  Snackbar,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useAuth } from "../authContext";
const SingleBus = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { formData } = location.state;
  const apiUrl = process.env.REACT_APP_API_URL;
  const [selectedSeats, setSelectedSeats] = useState({});
  const [fare, setFare] = useState(0);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [trip, setTrip] = useState([]);
  const [error, setError] = useState([]);
  const [loginAlert, setLoginAlert] = useState(false);

  useEffect(() => {
    const fetchBusData = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/api/bus/search?source=${formData.source}&destination=${formData.destination}`
        );
        if (!response.ok) {
          throw new Error("Error fetching buses");
        }
        const data = await response.json();
        setTrip(
          data.map((bus) => ({
            ...bus,
            bookedSeats: bus.bookedSeats || [],
          }))
        );
      } catch (error) {
        setError(error.message);
      }
    };

    fetchBusData();
  }, [formData.source, formData.destination, apiUrl]);

  const handleSeatClick = (seat) => {
    if (
      !selectedBus ||
      bookingConfirmed ||
      selectedBus.bookedSeats.includes(seat)
    ) {
      return;
    }
    setSelectedSeats((prevSelectedSeats) => {
      const currentSelection = prevSelectedSeats[selectedBus._id] || [];
      const isSelected = currentSelection.includes(seat);
      const updatedSelection = isSelected
        ? currentSelection.filter((s) => s !== seat)
        : [...currentSelection, seat];

      const newFare = updatedSelection.length * selectedBus.fare;
      setFare(newFare);

      return {
        ...prevSelectedSeats,
        [selectedBus._id]: updatedSelection,
      };
    });
  };

  const handleClose = () => setShowMessage(false);

  const updateSeatsInDatabase = async (busId, updatedSeats, seatNo) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/bus/update-bus-seats`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            busId,
            updatedSeats,
            seatNo,
          }),
        }
      );
      const result = await response.json();
      if (!response.ok) {
        console.error("Failed to update seats:", result.message);
      }
    } catch (error) {
      console.error("Error updating seats in database:", error);
    }
  };

  const handleBusSelect = (bus) => {
    setSelectedBus(bus);
    setSelectedSeats({ [bus._id]: [] });
    setFare(0);
    setBookingConfirmed(false);
  };

  const handleBookSeats = () => {
    if (user) {
      setOpenConfirmModal(true);
    } else {
      setLoginAlert(true);
    }
  };

  const confirmBooking = async () => {
    const bookedSeats = selectedSeats[selectedBus._id];
    const updatedSeatsCount =
      selectedBus.noOfSeatsAvailable - bookedSeats.length;

    await updateSeatsInDatabase(
      selectedBus._id,
      updatedSeatsCount,
      bookedSeats
    );

    setTrip((prevTrips) =>
      prevTrips.map((bus) =>
        bus._id === selectedBus._id
          ? {
              ...bus,
              noOfSeatsAvailable: updatedSeatsCount,
              bookedSeats: [...(bus.bookedSeats || []), ...bookedSeats],
            }
          : bus
      )
    );

    setBookingConfirmed(true);
    setOpenConfirmModal(false);
    setTimeout(() => {
      setShowMessage(true);
    }, 2000);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    doc.setFontSize(22);
    doc.text("Bus Reservation Details", margin, margin);
    doc.setFontSize(12);
    doc.text(
      `Date: ${new Date().toLocaleDateString()}`,
      pageWidth - margin - 50,
      margin
    );

    doc.setFontSize(14);
    doc.text(`User Name: ${user.name}`, margin, margin + 20);
    doc.text(`From: ${formData.source}`, margin, margin + 30);
    doc.text(`To: ${formData.destination}`, margin, margin + 40);

    doc.setFontSize(16);
    const headers = ["Bus Name", "Route", "Start Time", "Seats", "Fare"];
    const tableRows = Object.keys(selectedSeats).reduce((rows, busId) => {
      const seats = selectedSeats[busId];
      if (seats.length > 0) {
        const selectedBusDetails = trip.find((bus) => bus._id === busId);
        if (selectedBusDetails) {
          const fare = selectedBusDetails.fare * seats.length;
          rows.push([
            selectedBusDetails.busName,
            `${selectedBusDetails.source} to ${selectedBusDetails.destination}`,
            selectedBusDetails.startTime,
            seats.join(", "),
            `$${fare}`,
          ]);
        }
      }
      return rows;
    }, []);

    doc.autoTable({
      head: [headers],
      body: tableRows,
      startY: 80,
      theme: "grid",
      styles: { halign: "center" },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 60 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30 },
        4: { cellWidth: 20 },
      },
    });

    const footerText =
      "Thank you for your reservation! We look forward to serving you.";
    doc.setFontSize(10);
    doc.text(footerText, margin, pageHeight - margin);

    doc.save("bus-reservation-details.pdf");
  };

  const handleChange = (busIndex) => {
    setExpanded(expanded === busIndex ? false : busIndex);
    handleBusSelect(trip[busIndex]);
  };

  return (
    <Box
      sx={{
        padding: 2,
        backgroundImage: "url(../../bus.webp)",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          background: "linear-gradient(to right,black, red, black)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textAlign: "center",
          margin: 0,
        }}
      >
        Available Buses from {formData.source} to {formData.destination}
      </Typography>

      <Grid size={{ xs: 12, sm: 9 }} sx={{ padding: 2 }}>
        {trip.length > 0 ? (
          trip.map((details, index) => (
            <Accordion
              key={details._id}
              expanded={expanded === index}
              onChange={() => handleChange(index)}
              sx={{ mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  variant="h6"
                  sx={{ color: "blue", fontWeight: "bold" }}
                >
                  {details.busName}
                  <span style={{ color: "gray" }}> &#x2794; </span>{" "}
                </Typography>
                <Typography variant="body1" sx={{ color: "green", ml: 2 }}>
                  Route: {details.source} to {details.destination}
                  <span style={{ color: "gray" }}> &#x2794; </span>{" "}
                </Typography>
                <Typography variant="body1" sx={{ color: "orange", ml: 2 }}>
                  Fare per seat: ${details.fare}
                </Typography>
              </AccordionSummary>

              <AccordionDetails>
                <Box>
                  <Box
                    sx={{
                      border: "1px solid lightgray",
                      borderRadius: "4px",
                      padding: 2,
                      mb: 2,
                      backgroundColor: "#f9f9f9",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="body2" sx={{ color: "blue", mr: 1 }}>
                        Start Time: {details.startTime}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "blue" }}>
                        | End Time: {details.endTime}{" "}
                      </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ color: "green", mt: 1 }}>
                      Stops: {details.stops.join(", ")}
                    </Typography>

                    <Typography variant="body2" sx={{ color: "orange", mt: 1 }}>
                      Seats Available: {details.noOfSeatsAvailable}
                    </Typography>

                    <Box display="flex" flexDirection="column" mt={2}>
                      {["A", "B", "C", "D"].map((rowLetter, rowIndex) => (
                        <Box
                          key={rowLetter}
                          display="flex"
                          flexDirection="row"
                          justifyContent="space-around"
                          mb={1}
                          mx={1}
                        >
                          {details.layout.seatConfiguration.map(
                            (column, colIndex) => {
                              const seatNumber = `${colIndex + 1}${rowLetter}`;
                              return (
                                <Box
                                  key={seatNumber}
                                  bgcolor={
                                    details.bookedSeats.includes(seatNumber)
                                      ? "orange"
                                      : selectedSeats[details._id]?.includes(
                                          seatNumber
                                        )
                                      ? "lightgreen"
                                      : "white"
                                  }
                                  textAlign="center"
                                  width="50px"
                                  border="1px solid black"
                                  sx={{
                                    cursor:
                                      bookingConfirmed ||
                                      details.bookedSeats.includes(seatNumber)
                                        ? "not-allowed"
                                        : "pointer",
                                    fontSize: { xs: "0.8rem", sm: "1rem" },
                                    transition: "background-color 0.3s",
                                  }}
                                  onClick={() => {
                                    if (!bookingConfirmed) {
                                      handleSeatClick(seatNumber);
                                    }
                                  }}
                                >
                                  {seatNumber}
                                </Box>
                              );
                            }
                          )}
                        </Box>
                      ))}
                    </Box>

                    <Typography variant="h6" color="primary" mt={2}>
                      Total Fare: ${fare}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    {selectedSeats[details._id]?.length > 0 &&
                      !bookingConfirmed && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleBookSeats}
                          sx={{ mt: 2 }}
                        >
                          Book
                        </Button>
                      )}
                    {bookingConfirmed && (
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={downloadPDF}
                      >
                        Download
                      </Button>
                    )}
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "80vh",
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              padding: 3,
              textAlign: "center",
              backgroundImage: "url(../../nobus.png)",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          ></Box>
        )}
      </Grid>

      <Modal open={openConfirmModal} onClose={() => setOpenConfirmModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Confirm Booking
          </Typography>
          {Object.keys(selectedSeats).map((busId, index) => {
            const busDetails = trip.find((bus) => bus._id === busId);
            return (
              selectedSeats[busId].length > 0 && (
                <Box
                  key={index}
                  sx={{
                    border: "1px solid lightgray",
                    borderRadius: "4px",
                    padding: 2,
                    mb: 2,
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: "bold", mb: 1 }}
                  >
                    Bus: {busDetails.busName}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Route: {busDetails.source} to {busDetails.destination}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Time: {busDetails.startTime} -- {busDetails.endTime}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Seats: {selectedSeats[busId].join(", ")}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    Fare: ${busDetails.fare * selectedSeats[busId].length}
                  </Typography>
                </Box>
              )
            );
          })}
          <Button variant="contained" sx={{ mt: 2 }} onClick={confirmBooking}>
            Confirm
          </Button>
          <Button
            variant="outlined"
            sx={{ mt: 2, ml: 2 }}
            onClick={() => setOpenConfirmModal(false)}
          >
            Cancel
          </Button>
        </Box>
      </Modal>
      <Snackbar
        open={loginAlert}
        autoHideDuration={3000}
        onClose={() => setLoginAlert(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={() => setLoginAlert(false)} severity="warning">
          Please log in to book tickets.
        </Alert>
      </Snackbar>
      {/* Snackbar for Success Message */}
      <Snackbar
        open={showMessage}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity="success">
          Booking confirmed successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SingleBus;
