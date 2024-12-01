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
import { useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useAuth } from "../authContext";
import AirlineSeatReclineExtraSharpIcon from "@mui/icons-material/AirlineSeatReclineExtraSharp";
import DoubleArrowTwoToneIcon from "@mui/icons-material/DoubleArrowTwoTone";
import ExpandCircleDownTwoToneIcon from "@mui/icons-material/ExpandCircleDownTwoTone";
import CurrencyRupeeTwoToneIcon from "@mui/icons-material/CurrencyRupeeTwoTone";
import { useMediaQuery } from "@mui/material";
const SingleBus = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { formData } = location.state;
  const apiUrl = process.env.REACT_APP_API_URL;
  const isSmallScreen = useMediaQuery("(max-width:1100px)");
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
      const newFare = updatedSelection.length * selectedBus.baseFare;
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
      const response = await fetch(`${apiUrl}/api/bus/update-bus-seats`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          busId,
          updatedSeats,
          seatNo,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        console.error("Failed to update seats:", result.message);
      }
    } catch (error) {
      console.error("Error updating seats in database:", error);
    }
  };
  const renderRowsToColumns = (seatConfiguration) => {
    return seatConfiguration.map((row, rowIndex) => (
      <Grid
        container
        key={rowIndex}
        spacing={0.5}
        justifyContent="center"
        sx={{
          marginTop: "16px",
          flexWrap: "wrap",
        }}
      >
        {row.map((seat) => {
          const isBooked = selectedBus?.bookedSeats?.includes(seat);
          return (
            <Grid
              item
              key={seat}
              xs={4}
              sm={2}
              md={1}
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  padding: 1,
                  border: "1px solid",
                  borderColor: selectedSeats[selectedBus?._id]?.includes(seat)
                    ? "#76ff03"
                    : "#2196f3",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "40px",
                  backgroundColor: isBooked
                    ? "#bdbdbd"
                    : selectedSeats[selectedBus?._id]?.includes(seat)
                    ? "rgba(76, 175, 80, 0.3)"
                    : "rgba(33, 150, 243, 0.3)",
                }}
              >
                <Button
                  variant="outlined"
                  color={
                    selectedSeats[selectedBus?._id]?.includes(seat)
                      ? "success"
                      : "primary"
                  }
                  sx={{
                    height: "40px",
                    width: "40px",
                    borderRadius: "50%",
                    minWidth: 0,
                    background: "white",
                    padding: 0,
                    fontSize: "14px",
                    flexGrow: 1,
                  }}
                  onClick={() => handleSeatClick(seat)}
                  disabled={isBooked}
                >
                  <AirlineSeatReclineExtraSharpIcon sx={{ fontSize: "20px" }} />
                  {seat}
                </Button>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    ));
  };
  const renderColumnsToRows = (seatConfiguration) => {
    const numColumns = seatConfiguration[0].length;
    const numRows = seatConfiguration.length;
    const columns = Array.from({ length: numColumns }, (_, colIndex) => {
      return (
        <Grid
          container
          key={colIndex}
          spacing={1}
          justifyContent="center"
          sx={{
            position: "relative",
            background: "#eeeeee",
            padding: "4px",
            borderRadius: "inherit",
            boxSizing: "border-box",
            display: "flex",
          }}
        >
          {Array.from({ length: numRows }, (_, rowIndex) => {
            const seat = seatConfiguration[rowIndex][colIndex];
            const isBooked = selectedBus?.bookedSeats?.includes(seat);
            return (
              <Grid
                item
                key={seat}
                padding={1}
                sx={{
                  flexShrink: 0,
                }}
              >
                <Box
                  sx={{
                    padding: 1,
                    backgroundColor: isBooked
                      ? "#bdbdbd"
                      : selectedSeats[selectedBus?._id]?.includes(seat)
                      ? "rgba(76, 175, 80, 0.3)"
                      : "rgba(33, 150, 243, 0.3)",
                    borderColor: isBooked
                      ? "#bdbdbd"
                      : selectedSeats[selectedBus?._id]?.includes(seat)
                      ? "#76ff03"
                      : "#2196f3",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "40px",
                  }}
                >
                  <Button
                    variant="outlined"
                    color={
                      isBooked
                        ? "default"
                        : selectedSeats[selectedBus?._id]?.includes(seat)
                        ? "success"
                        : "primary"
                    }
                    sx={{
                      height: "40px",
                      width: "40px",
                      borderRadius: "50%",
                      minWidth: 0,
                      background: "white",
                      padding: 0,
                    }}
                    onClick={() => handleSeatClick(seat)}
                    disabled={isBooked}
                  >
                    <AirlineSeatReclineExtraSharpIcon fontSize="small" />
                    {seat}
                  </Button>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      );
    });
    return columns;
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
    doc.setTextColor("#00796B");
    doc.text("Bus Reservation Details", pageWidth / 2, margin, {
      align: "center",
    });
    doc.setFontSize(12);
    doc.setTextColor("#424242");
    doc.text(
      `Date: ${new Date().toLocaleDateString()}`,
      pageWidth - margin - 50,
      margin + 10
    );
    doc.setFontSize(14);
    doc.setTextColor("#000");
    doc.text(`User Name: ${user.name}`, margin, margin + 30);
    doc.text(`From: ${formData.source}`, margin, margin + 40);
    doc.text(`To: ${formData.destination}`, margin, margin + 50);
    const headers = ["Bus Name", "Route", "Start Time", "Seats", "Fare"];
    const tableRows = Object.keys(selectedSeats).reduce((rows, busId) => {
      const seats = selectedSeats[busId];
      if (seats.length > 0) {
        const selectedBusDetails = trip.find((bus) => bus._id === busId);
        if (selectedBusDetails) {
          const fare = selectedBusDetails.baseFare * seats.length;
          rows.push([
            selectedBusDetails.busName,
            `${selectedBusDetails.source} to ${selectedBusDetails.destination}`,
            selectedBusDetails.startTime,
            seats.join(", "),
            `₹${fare}`,
          ]);
        }
      }
      return rows;
    }, []);
    doc.autoTable({
      head: [headers],
      body: tableRows,
      startY: 70,
      theme: "striped",
      styles: {
        halign: "center",
        fontSize: 12,
        lineColor: "#ddd",
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: "#00796B",
        textColor: "#fff",
        fontStyle: "bold",
      },
      bodyStyles: {
        fillColor: "#f3f3f3",
        textColor: "#333",
      },
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
    doc.setTextColor("#757575");
    doc.text(footerText, pageWidth / 2, pageHeight - margin, {
      align: "center",
    });
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
              <AccordionSummary expandIcon={<ExpandCircleDownTwoToneIcon />}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: "center",
                    width: "100%",
                    gap: 2,
                    ml: 5,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#2196f3",
                      fontWeight: "bold",
                      textAlign: "center",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    {details.busName}
                  </Typography>
                  <span style={{ color: "red", marginLeft: "8px" }}>
                    <DoubleArrowTwoToneIcon fontSize="small" />
                  </span>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#76ff03",
                      textAlign: "center",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    {details.source} -- {details.destination}
                  </Typography>
                  <span
                    style={{
                      color: "red",
                      marginLeft: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    <DoubleArrowTwoToneIcon fontSize="small" />
                  </span>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "orange",
                      textAlign: "center",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    Fare : <CurrencyRupeeTwoToneIcon fontSize="small" />
                    {details.baseFare}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Box
                    sx={{
                      border: "1px solid light#bdbdbd",
                      borderRadius: "4px",
                      padding: 2,
                      mb: 2,
                      backgroundColor: "#f9f9f9",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: "#2196f3", mr: 1 }}
                      >
                        Start Time: {details.startTime}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#2196f3" }}>
                        | End Time: {details.endTime}{" "}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ color: "#76ff03", mt: 1 }}
                    >
                      Stops: {details.stops.join(", ")}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "orange", mt: 1 }}>
                      Seats Available: {details.noOfSeatsAvailable}
                    </Typography>
                    {isSmallScreen ? (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 2,
                          textAlign: "center",
                        }}
                      >
                        {renderRowsToColumns(details.layout.seatConfiguration)}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 2,
                            marginTop: 2,
                          }}
                        >
                          <Box
                            sx={{
                              width: "16px",
                              height: "16px",
                              backgroundColor: "#2196f3",
                              borderRadius: "50%",
                            }}
                          />
                          <Typography sx={{ color: "#2196f3" }}>
                            Available
                          </Typography>
                          <Box
                            sx={{
                              width: "16px",
                              height: "16px",
                              backgroundColor: "#bdbdbd",
                              borderRadius: "50%",
                            }}
                          />
                          <Typography sx={{ color: "#bdbdbd" }}>
                            Reserved
                          </Typography>
                          <Box
                            sx={{
                              width: "16px",
                              height: "16px",
                              backgroundColor: "#76ff03",
                              borderRadius: "50%",
                            }}
                          />
                          <Typography sx={{ color: "#76ff03" }}>
                            Selected
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 2,
                          textAlign: "center",
                        }}
                      >
                        {renderColumnsToRows(details.layout.seatConfiguration)}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 2,
                            marginTop: 2,
                          }}
                        >
                          <Box
                            sx={{
                              width: "16px",
                              height: "16px",
                              backgroundColor: "#2196f3",
                              borderRadius: "50%",
                            }}
                          />
                          <Typography sx={{ color: "#2196f3" }}>
                            Available
                          </Typography>
                          <Box
                            sx={{
                              width: "16px",
                              height: "16px",
                              backgroundColor: "#bdbdbd",
                              borderRadius: "50%",
                            }}
                          />
                          <Typography sx={{ color: "#bdbdbd" }}>
                            Reserved
                          </Typography>
                          <Box
                            sx={{
                              width: "16px",
                              height: "16px",
                              backgroundColor: "#76ff03",
                              borderRadius: "50%",
                            }}
                          />
                          <Typography sx={{ color: "#76ff03" }}>
                            Selected
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    <Typography
                      variant="h6"
                      color="primary"
                      mt={2}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "right",
                        gap: 0.5,
                      }}
                    >
                      Total Fare:
                      <CurrencyRupeeTwoToneIcon
                        fontSize="small"
                        sx={{ marginLeft: 0.5 }}
                      />
                      {fare}
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
              backgroundColor: "#bdbdbd",
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
            p: { xs: 2, md: 4 },
            width: { xs: "90%", sm: "75%", md: "400px" },
            maxWidth: "100%",
            borderRadius: "16px",
            border: "2px dashed #bdbdbd",
            overflow: "hidden",
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            textAlign="center"
            sx={{
              fontWeight: "bold",
              color: "#3f51b5",
              fontSize: { xs: "18px", md: "24px" },
            }}
          >
            Confirm Your Ticket
          </Typography>
          {Object.keys(selectedSeats).map((busId, index) => {
            const busDetails = trip.find((bus) => bus._id === busId);
            return (
              selectedSeats[busId].length > 0 && (
                <Box
                  key={index}
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    padding: 2,
                    mb: 2,
                    backgroundColor: "#fafafa",
                  }}
                >
                  <Typography
                    variant="body1"
                    textAlign="center"
                    sx={{
                      fontWeight: "bold",
                      mb: 1,
                      fontSize: { xs: "16px", md: "18px" },
                    }}
                    color="#ff5722"
                  >
                    {busDetails.busName}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 0.5,
                      fontSize: { xs: "14px", md: "16px" },
                    }}
                  >
                    Route: <strong>{busDetails.source}</strong> to{" "}
                    <strong>{busDetails.destination}</strong>
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 0.5,
                      fontSize: { xs: "14px", md: "16px" },
                    }}
                  >
                    Stops: {busDetails.stops.join(", ")}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Origin Time: {busDetails.startTime}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Destination Time: {busDetails.endTime}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 0.5,
                      textAlign: "center",
                      fontWeight: "bold",
                      color: "#4caf50",
                    }}
                  >
                    Seats: {selectedSeats[busId].join(", ")}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      textAlign: "center",
                      mt: 1,
                      color: "#ff9800",
                      fontWeight: "bold",
                      fontSize: { xs: "18px", md: "20px" },
                    }}
                  >
                    Fare: ₹{busDetails.baseFare * selectedSeats[busId].length}
                  </Typography>
                </Box>
              )
            );
          })}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              mt: 2,
              borderTop: "2px dashed #bdbdbd",
              pt: 2,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              sx={{
                flex: 1,
                mr: { sm: 1 },
                mb: { xs: 1, sm: 0 },
              }}
              onClick={confirmBooking}
            >
              Confirm
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              sx={{ flex: 1 }}
              onClick={() => setOpenConfirmModal(false)}
            >
              Cancel
            </Button>
          </Box>
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
