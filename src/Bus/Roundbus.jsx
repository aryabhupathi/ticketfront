import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Modal,
  Snackbar,
  Alert,
} from "@mui/material";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useAuth } from "../authContext";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useLocation } from "react-router-dom";
const RoundBus = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { formData } = location.state;
  const [selectedSeats, setSelectedSeats] = useState({
    outbound: {},
    return: {},
  });
  const [loginAlert, setLoginAlert] = useState(false);
  const [fare, setFare] = useState({ outbound: 0, return: 0 });
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [selectedBus, setSelectedBus] = useState({
    outbound: null,
    return: null,
  });
  const [expandedIndex, setExpandedIndex] = useState({
    outbound: false,
    return: false,
  });
  const [showMessage, setShowMessage] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState({
    outbound: false,
    return: false,
  });
  const [currentTripType, setCurrentTripType] = useState("");
  const [outboundTrip, setOutboundTrip] = useState([]);
  const [returnTrip, setReturnTrip] = useState([]);
  const [error, setError] = useState(null);

  const handleClose = () => setShowMessage(false);

  useEffect(() => {
    const fetchBusData = async (source, destination, setTrip) => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/bus/search?source=${source}&destination=${destination}`
        );
        if (!response.ok) throw new Error("Error fetching buses");
        const data = await response.json();
        setTrip(
          data.map((bus) => ({ ...bus, bookedSeats: bus.bookedSeats || [] }))
        );
      } catch (error) {
        setError(error.message);
        console.error("Fetch Error:", error);
      }
    };

    fetchBusData(formData.source, formData.destination, setOutboundTrip);
    fetchBusData(formData.destination, formData.source, setReturnTrip);
  }, [formData.source, formData.destination]);

  const handleSeatClick = (seat, tripType) => {
    const selectedBusForTrip = selectedBus[tripType];
    if (
      !selectedBusForTrip ||
      bookingConfirmed[tripType] ||
      selectedBusForTrip.bookedSeats.includes(seat)
    )
      return;

    if (selectedBusForTrip.noOfSeatsAvailable <= 0) return;

    setSelectedSeats((prevSelectedSeats) => {
      const currentBusSeats =
        prevSelectedSeats[tripType][selectedBusForTrip.busName] || [];
      const isSelected = currentBusSeats.includes(seat);
      const updatedSeats = isSelected
        ? currentBusSeats.filter((s) => s !== seat)
        : [...currentBusSeats, seat];
      const updatedFare = updatedSeats.length * selectedBusForTrip.fare;

      setFare((prevFare) => ({
        ...prevFare,
        [tripType]: updatedFare,
      }));

      return {
        ...prevSelectedSeats,
        [tripType]: {
          ...prevSelectedSeats[tripType],
          [selectedBusForTrip.busName]: updatedSeats,
        },
      };
    });
  };

  const handleBusSelect = (bus, tripType) => {
    setSelectedBus((prev) => ({
      ...prev,
      [tripType]: bus,
    }));

    setSelectedSeats((prevSelectedSeats) => ({
      ...prevSelectedSeats,
      [tripType]: { [bus.busName]: [] },
    }));

    setFare((prevFare) => ({
      ...prevFare,
      [tripType]: 0,
    }));

    setBookingConfirmed((prev) => ({
      ...prev,
      [tripType]: false,
    }));
  };

  const handleBookSeats = (tripType) => {
    if (user) {
      setCurrentTripType(tripType);
      setOpenConfirmModal(true);
    } else {
      setLoginAlert(true);
    }
  };

  const confirmBooking = async () => {
    const bookedSeatsOutbound =
      selectedSeats.outbound[selectedBus.outbound?.busName] || [];
    const bookedSeatsReturn =
      selectedSeats.return[selectedBus.return?.busName] || [];

    const updateSeatCount = async (bus, bookedSeats) => {
      const updatedSeatsCount = bus.noOfSeatsAvailable - bookedSeats.length;
      await updateSeatsInDatabase(bus._id, updatedSeatsCount, bookedSeats);
      return updatedSeatsCount;
    };

    if (selectedBus.outbound) {
      const updatedSeatsCountOutbound = await updateSeatCount(
        selectedBus.outbound,
        bookedSeatsOutbound
      );
      setOutboundTrip((prevTrips) =>
        prevTrips.map((bus) =>
          bus._id === selectedBus.outbound._id
            ? {
                ...bus,
                noOfSeatsAvailable: updatedSeatsCountOutbound,
                bookedSeats: [
                  ...(bus.bookedSeats || []),
                  ...bookedSeatsOutbound,
                ],
              }
            : bus
        )
      );
    }

    if (selectedBus.return) {
      const updatedSeatsCountReturn = await updateSeatCount(
        selectedBus.return,
        bookedSeatsReturn
      );
      setReturnTrip((prevTrips) =>
        prevTrips.map((bus) =>
          bus._id === selectedBus.return._id
            ? {
                ...bus,
                noOfSeatsAvailable: updatedSeatsCountReturn,
                bookedSeats: [...(bus.bookedSeats || []), ...bookedSeatsReturn],
              }
            : bus
        )
      );
    }

    setBookingConfirmed({ outbound: true, return: true });
    setOpenConfirmModal(false);
    setTimeout(() => setShowMessage(true), 2000);
  };

  const updateSeatsInDatabase = async (busId, updatedSeats, seatNo) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/bus/update-bus-seats`,
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

  const handleChange = (busIndex, tripType) => {
    const isCurrentlyExpanded = expandedIndex[tripType] === busIndex;

    setExpandedIndex((prevExpandedIndex) => ({
      ...prevExpandedIndex,
      [tripType]: isCurrentlyExpanded ? false : busIndex,
    }));

    if (!isCurrentlyExpanded) {
      const selectedBusDetails =
        tripType === "outbound" ? outboundTrip[busIndex] : returnTrip[busIndex];
      handleBusSelect(selectedBusDetails, tripType);
    } else {
      setSelectedBus((prev) => ({
        ...prev,
        [tripType]: null,
      }));
      setSelectedSeats((prevSelectedSeats) => ({
        ...prevSelectedSeats,
        [tripType]: {},
      }));
      setFare((prevFare) => ({
        ...prevFare,
        [tripType]: 0,
      }));
      setBookingConfirmed((prev) => ({
        ...prev,
        [tripType]: false,
      }));
    }
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

    // Outbound Trip
    doc.setFontSize(16);
    doc.text("Outbound Trip", margin, margin + 60);

    const outboundHeaders = [
      "Bus Name",
      "Route",
      "Start Time",
      "Seats",
      "Fare",
    ];
    const outboundTableRows = Object.keys(selectedSeats.outbound || {}).reduce(
      (rows, busId) => {
        const seats = selectedSeats.outbound[busId] || [];
        if (seats.length > 0) {
          const selectedBusDetails = outboundTrip.find(
            (bus) => bus._id === busId
          );
          console.log(selectedBusDetails, "ooooooooooooooo");
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
      },
      []
    );

    doc.autoTable({
      head: [outboundHeaders],
      body: outboundTableRows,
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

    // Move down for the return trip section
    const outboundEndY = doc.lastAutoTable.finalY + margin;

    // Return Trip
    doc.setFontSize(16);
    doc.text("Return Trip", margin, outboundEndY + 20);

    const returnHeaders = ["Bus Name", "Route", "Start Time", "Seats", "Fare"];
    const returnTableRows = Object.keys(selectedSeats.return || {}).reduce(
      (rows, busId) => {
        const seats = selectedSeats.return[busId] || [];
        if (seats.length > 0) {
          const selectedBusDetails = returnTrip.find(
            (bus) => bus._id === busId
          );
          console.log(selectedBusDetails, "rrrrrrrrrrrrrrr");
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
      },
      []
    );

    doc.autoTable({
      head: [returnHeaders],
      body: returnTableRows,
      startY: outboundEndY + 30,
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

    // Footer
    const footerText =
      "Thank you for your reservation! We look forward to serving you.";
    doc.setFontSize(10);
    doc.text(footerText, margin, pageHeight - margin);

    // Save the PDF
    doc.save("bus-reservation-details.pdf");
  };

  return (
    <Box
      sx={{
        padding: 2,
        backgroundImage:
          "url(../../bus.webp)" /* Replace with your image path */,
        backgroundSize: "cover" /* Ensure the image covers the entire area */,
        backgroundRepeat: "no-repeat" /* Prevent repeating the image */,
        backgroundPosition: "center" /* Center the image */,
        backgroundAttachment: "fixed" /* Make the background fixed */,
        minHeight:
          "100vh" /* Ensure the container is at least the height of the viewport */,
      }}
    >
      <Typography
        variant="h5"
        sx={{
          background: "linear-gradient(to right,red, green, blue)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textAlign: "center",
          margin: 0,
        }}
      >
        Available Buses from {formData.source} to {formData.destination}
      </Typography>

      {/* Outbound Trip Logic */}
      {formData.tripType === "round" && (
        <>
          <Typography variant="h5" gutterBottom>
            Outbound Trip
          </Typography>
          <Box>
            {outboundTrip.map((bus, index) => (
              <Accordion
                key={index}
                expanded={expandedIndex.outbound === index}
                onChange={() => handleChange(index, "outbound")}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography
                    variant="h6"
                    sx={{ color: "blue", fontWeight: "bold" }}
                  >
                    {bus.busName}
                    <span style={{ color: "gray" }}> &#x2794; </span>{" "}
                    {/* Arrow icon */}
                  </Typography>

                  <Typography variant="body1" sx={{ color: "green", ml: 2 }}>
                    Route: {bus.source} to {bus.destination}
                    <span style={{ color: "gray" }}> &#x2794; </span>{" "}
                    {/* Arrow icon */}
                  </Typography>

                  <Typography variant="body1" sx={{ color: "orange", ml: 2 }}>
                    Fare per seat: ${bus.fare}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
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
                        Start Time: {bus.startTime}
                      </Typography>

                      <Typography variant="body2" sx={{ color: "blue" }}>
                        | End Time: {bus.endTime} {/* Pipe to separate times */}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: "green", mt: 1 }}>
                      {" "}
                      Stops: {bus.stops.join(", ")}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "orange", mt: 1 }}>
                      {" "}
                      Seats Available: {bus.noOfSeatsAvailable}
                    </Typography>
                    <Typography variant="body1" mt={2}>
                      Selected Seats:{" "}
                      {selectedSeats.outbound[bus.busName]?.join(", ") ||
                        "None"}
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
                          {bus.layout.seatConfiguration.map(
                            (column, colIndex) => {
                              const seatNumber = `${colIndex + 1}${rowLetter}`;

                              const isBooked =
                                bus.bookedSeats.includes(seatNumber);
                              const isSelected =
                                selectedSeats.outbound[bus.busName]?.includes(
                                  seatNumber
                                );
                              const isDisabled =
                                bookingConfirmed.outbound || isBooked;

                              return (
                                <Box
                                  key={seatNumber}
                                  bgcolor={
                                    isBooked
                                      ? "orange"
                                      : isSelected
                                      ? "lightgreen"
                                      : "white"
                                  }
                                  textAlign="center"
                                  width="50px"
                                  border="1px solid black"
                                  sx={{
                                    cursor: isDisabled
                                      ? "not-allowed"
                                      : "pointer",
                                    fontSize: { xs: "0.8rem", sm: "1rem" },
                                    transition: "background-color 0.3s",
                                  }}
                                  onClick={() => {
                                    if (!isDisabled) {
                                      handleSeatClick(seatNumber, "outbound");
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
                      Total Fare: ${fare.outbound}
                    </Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>

          {/* Return Trip Logic */}
          <Typography variant="h5" gutterBottom>
            Return Trip
          </Typography>
          <Box>
            {returnTrip.map((bus, index) => (
              <Accordion
                key={index}
                expanded={expandedIndex.return === index}
                onChange={() => handleChange(index, "return")}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography
                    variant="h6"
                    sx={{ color: "blue", fontWeight: "bold" }}
                  >
                    {bus.busName}
                    <span style={{ color: "gray" }}> &#x2794; </span>{" "}
                    {/* Arrow icon */}
                  </Typography>

                  <Typography variant="body1" sx={{ color: "green", ml: 2 }}>
                    Route: {bus.source} to {bus.destination}
                    <span style={{ color: "gray" }}> &#x2794; </span>{" "}
                    {/* Arrow icon */}
                  </Typography>

                  <Typography variant="body1" sx={{ color: "orange", ml: 2 }}>
                    Fare per seat: ${bus.fare}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
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
                        Start Time: {bus.startTime}
                      </Typography>

                      <Typography variant="body2" sx={{ color: "blue" }}>
                        | End Time: {bus.endTime} {/* Pipe to separate times */}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: "green", mt: 1 }}>
                      {" "}
                      Stops: {bus.stops.join(", ")}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "orange", mt: 1 }}>
                      {" "}
                      Seats Available: {bus.noOfSeatsAvailable}
                    </Typography>
                    <Typography variant="body1" mt={2}>
                      Selected Seats:{" "}
                      {selectedSeats.return[bus.busName]?.join(", ") || "None"}
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
                          {bus.layout.seatConfiguration.map(
                            (column, colIndex) => {
                              const seatNumber = `${colIndex + 1}${rowLetter}`;

                              const isBooked =
                                bus.bookedSeats.includes(seatNumber);
                              const isSelected =
                                selectedSeats.return[bus.busName]?.includes(
                                  seatNumber
                                );
                              const isDisabled =
                                bookingConfirmed.return || isBooked;

                              return (
                                <Box
                                  key={seatNumber}
                                  bgcolor={
                                    isBooked
                                      ? "orange"
                                      : isSelected
                                      ? "lightgreen"
                                      : "white"
                                  }
                                  textAlign="center"
                                  width="50px"
                                  border="1px solid black"
                                  sx={{
                                    cursor: isDisabled
                                      ? "not-allowed"
                                      : "pointer",
                                    fontSize: { xs: "0.8rem", sm: "1rem" },
                                    transition: "background-color 0.3s",
                                  }}
                                  onClick={() => {
                                    if (!isDisabled) {
                                      handleSeatClick(seatNumber, "return");
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
                      Total Fare: ${fare.return}
                    </Typography>
                    {selectedSeats.return[bus.busName]?.length > 0 &&
                      !bookingConfirmed.return && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: 2,
                          }}
                        >
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleBookSeats()}
                            disabled={
                              selectedSeats.outbound.length === 0 ||
                              selectedSeats.return.length === 0
                            }
                          >
                            Book
                          </Button>
                        </Box>
                      )}

                    {bookingConfirmed.return && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          mt: 2,
                        }}
                      >
                        <Button
                          variant="contained"
                          color="primary"
                          sx={{ mt: 2 }}
                          onClick={downloadPDF}
                        >
                          Download Return PDF
                        </Button>
                      </Box>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </>
      )}
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
            border: "2px solid black",
          }}
        >
          <Typography variant="h6">Confirm Booking</Typography>

          <Box mt={2}>
            <Typography variant="h6" sx={{ textDecoration: "underline" }}>
              {" "}
              Starting Trip
            </Typography>
            {selectedBus.outbound && (
              <>
                <Typography variant="body2">
                  Bus: {selectedBus.outbound.busName}
                </Typography>
                <Typography variant="body2">
                  Route: {selectedBus.outbound.source} to{" "}
                  {selectedBus.outbound.destination}
                </Typography>
                <Typography variant="body2">
                  Start Time: {selectedBus.outbound.startTime}
                </Typography>
                <Typography variant="body2">
                  End Time: {selectedBus.outbound.endTime}
                </Typography>
                <Typography variant="body2" mt={2}>
                  Selected Seats (Outbound):{" "}
                  {selectedSeats.outbound[selectedBus.outbound?.busName]?.join(
                    ", "
                  ) || "None"}
                </Typography>
                <Typography variant="body2" fontWeight="bold" mt={2}>
                  Total Fare (Outbound): ${fare.outbound}
                </Typography>
              </>
            )}

            <Typography variant="h6" sx={{ textDecoration: "underline" }}>
              {" "}
              Return Trip
            </Typography>
            {selectedBus.return && (
              <>
                <Typography variant="body2">
                  Bus: {selectedBus.return.busName}
                </Typography>
                <Typography variant="body2">
                  Route: {selectedBus.return.source} to{" "}
                  {selectedBus.return.destination}
                </Typography>
                <Typography variant="body2">
                  Start Time: {selectedBus.return.startTime}
                </Typography>
                <Typography variant="body2">
                  End Time: {selectedBus.return.endTime}
                </Typography>
                <Typography variant="body2" mt={2}>
                  Selected Seats (Return):{" "}
                  {selectedSeats.return[selectedBus.return?.busName]?.join(
                    ", "
                  ) || "None"}
                </Typography>
                <Typography variant="body2" mt={2} fontWeight="bold">
                  Total Fare (Return): ${fare.return}
                </Typography>
              </>
            )}

            <Button variant="contained" onClick={confirmBooking}>
              Confirm
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default RoundBus;
