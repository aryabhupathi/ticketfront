/* eslint-disable no-unused-vars */
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
import Grid from "@mui/material/Grid2";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useAuth } from "../authContext";
import { useLocation } from "react-router-dom";
import AirlineSeatReclineExtraSharpIcon from "@mui/icons-material/AirlineSeatReclineExtraSharp";
import DoubleArrowTwoToneIcon from "@mui/icons-material/DoubleArrowTwoTone";
import ExpandCircleDownTwoToneIcon from "@mui/icons-material/ExpandCircleDownTwoTone";
import CurrencyRupeeTwoToneIcon from "@mui/icons-material/CurrencyRupeeTwoTone";
import { useMediaQuery } from "@mui/material";
const RoundBus = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { formData } = location.state;
  const apiUrl = process.env.REACT_APP_API_URL;
  const isSmallScreen = useMediaQuery("(max-width:1100px)");
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
          `${apiUrl}/api/bus/search?source=${source}&destination=${destination}`
        );
        if (!response.ok) throw new Error("Error fetching buses");
        const data = await response.json();
        setTrip(
          data.map((bus) => ({ ...bus, bookedSeats: bus.bookedSeats || [] }))
        );
      } catch (error) {
        setError(error.message);
      }
    };
    fetchBusData(formData.source, formData.destination, setOutboundTrip);
    fetchBusData(formData.destination, formData.source, setReturnTrip);
  }, [formData.source, formData.destination, apiUrl]);
  const handleSeatClick = (seat, tripType) => {
    const selectedBusForTrip = selectedBus[tripType];
    if (
      !selectedBusForTrip ||
      bookingConfirmed[tripType] ||
      selectedBusForTrip.bookedSeats.includes(seat)
    )
      return;
    setSelectedSeats((prevSelectedSeats) => {
      const currentBusSeats =
        prevSelectedSeats[tripType][selectedBusForTrip.busName] || [];
      const isSelected = currentBusSeats.includes(seat);
      const updatedSeats = isSelected
        ? currentBusSeats.filter((s) => s !== seat)
        : [...currentBusSeats, seat];
      const updatedFare = updatedSeats.length * selectedBusForTrip.baseFare;
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
  const getTotalSelectedSeats = (tripType) => {
    return Object.values(selectedSeats[tripType] || {}).reduce(
      (total, seats) => total + seats.length,
      0
    );
  };
  const outboundLength = getTotalSelectedSeats("outbound");
  const returnLength = getTotalSelectedSeats("return");
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
    doc.setFont("helvetica", "bold");
    doc.text("Bus Reservation Details", margin, margin);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin - 50, margin)
    doc.setFontSize(14);
    doc.text(`User Name: ${user.name}`, margin, margin + 20);
    doc.text(`From: ${formData.source}`, margin, margin + 30);
    doc.text(`To: ${formData.destination}`, margin, margin + 40);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Outbound Trip", margin, margin + 60);
    const outboundHeaders = ["Bus Name", "Route", "Start Time", "Seats", "Fare"];
    const outboundTableRows = Object.keys(selectedSeats.outbound || {}).reduce(
      (rows, busId) => {
        const seats = selectedSeats.outbound[busId] || [];
        if (seats.length > 0) {
          const selectedBusDetails = outboundTrip.find(
            (bus) => bus._id === busId
          );
          if (selectedBusDetails) {
            const fare = selectedBusDetails.baseFare * seats.length;
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
      styles: {
        halign: "center",
        font: "helvetica",
        fontSize: 10,
        cellPadding: 5,
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 60 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30 },
        4: { cellWidth: 20 },
      },
    });
    const outboundEndY = doc.lastAutoTable.finalY + margin;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Return Trip", margin, outboundEndY + 20);
    const returnHeaders = ["Bus Name", "Route", "Start Time", "Seats", "Fare"];
    const returnTableRows = Object.keys(selectedSeats.return || {}).reduce(
      (rows, busId) => {
        const seats = selectedSeats.return[busId] || [];
        if (seats.length > 0) {
          const selectedBusDetails = returnTrip.find(
            (bus) => bus._id === busId
          );
          if (selectedBusDetails) {
            const fare = selectedBusDetails.baseFare * seats.length;
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
      styles: {
        halign: "center",
        font: "helvetica",
        fontSize: 10,
        cellPadding: 5,
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
    doc.setFont("helvetica", "normal");
    doc.text(footerText, margin, pageHeight - margin - 10);
    doc.save("bus-reservation-details.pdf");
  };
  const renderRowsToColumns = (seatConfiguration, tripType, bus) => {
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
          const isBooked = bus.bookedSeats.includes(seat);
          const isSelected =
            selectedSeats[tripType]?.[bus.busName]?.includes(seat);
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
                  borderColor: isSelected ? "#76ff03" : "#2196f3",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "40px",
                  backgroundColor: isBooked
                    ? "#bdbdbd"
                    : isSelected
                    ? "rgba(76, 175, 80, 0.3)"
                    : "rgba(33, 150, 243, 0.3)",
                }}
              >
                <Button
                  variant="outlined"
                  color={isSelected ? "success" : "primary"}
                  sx={{
                    height: "40px",
                    width: "40px",
                    borderRadius: "50%",
                    minWidth: 0,
                    background: "white",
                    padding: 0,
                    fontSize: "14px",
                  }}
                  onClick={() => handleSeatClick(seat, tripType)}
                  disabled={isBooked || bookingConfirmed[tripType]}
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
  const renderColumnsToRows = (seatConfiguration, tripType, bus) => {
    const numColumns = seatConfiguration[0].length;
    const numRows = seatConfiguration.length;
    return Array.from({ length: numColumns }, (_, colIndex) => (
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
          const isBooked = bus.bookedSeats.includes(seat);
          const isSelected =
            selectedSeats[tripType]?.[bus.busName]?.includes(seat);
          return (
            <Grid item key={seat} padding={1} sx={{ flexShrink: 0 }}>
              <Box
                sx={{
                  padding: 1,
                  backgroundColor: isBooked
                    ? "#bdbdbd"
                    : isSelected
                    ? "rgba(76, 175, 80, 0.3)"
                    : "rgba(33, 150, 243, 0.3)",
                  borderColor: isBooked
                    ? "#bdbdbd"
                    : isSelected
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
                  color={isSelected ? "success" : "primary"}
                  sx={{
                    height: "40px",
                    width: "40px",
                    borderRadius: "50%",
                    minWidth: 0,
                    background: "white",
                    padding: 0,
                  }}
                  onClick={() => handleSeatClick(seat, tripType)}
                  disabled={isBooked || bookingConfirmed[tripType]}
                >
                  <AirlineSeatReclineExtraSharpIcon fontSize="small" />
                  {seat}
                </Button>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    ));
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
          background: "linear-gradient(to right,red, green, blue)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textAlign: "center",
          margin: 0,
        }}
      >
        Available Buses from {formData.source} to {formData.destination}
      </Typography>
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
                      {bus.busName}
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
                      {bus.source} -- {bus.destination}
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
                      {bus.baseFare}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box
                    sx={{
                      border: "1px solid light #bdbdbd",
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
                        Start Time: {bus.startTime}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#2196f3" }}>
                        | End Time: {bus.endTime}{" "}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ color: "#76ff03", mt: 1 }}
                    >
                      Stops: {bus.stops.join(", ")}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "orange", mt: 1 }}>
                      Seats Available: {bus.noOfSeatsAvailable}
                    </Typography>
                    <Typography
                      variant="body1"
                      mt={2}
                      sx={{ color: "#212121", mt: 1 }}
                    >
                      Selected Seats:{" "}
                      {selectedSeats.outbound[bus.busName]?.join(", ") ||
                        "None"}
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
                        {renderRowsToColumns(
                          bus.layout.seatConfiguration,
                          "outbound",
                          bus
                        )}
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
                        {renderColumnsToRows(
                          bus.layout.seatConfiguration,
                          "outbound",
                          bus
                        )}
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
                      {fare.outbound}
                    </Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
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
                      {bus.busName}
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
                      {bus.source} -- {bus.destination}
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
                      {bus.baseFare}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box
                    sx={{
                      border: "1px solid light #bdbdbd",
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
                        Start Time: {bus.startTime}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#2196f3" }}>
                        | End Time: {bus.endTime}{" "}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ color: "#76ff03", mt: 1 }}
                    >
                      Stops: {bus.stops.join(", ")}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "orange", mt: 1 }}>
                      Seats Available: {bus.noOfSeatsAvailable}
                    </Typography>
                    <Typography
                      variant="body1"
                      mt={2}
                      sx={{ color: "#212121", mt: 1 }}
                    >
                      Selected Seats:{" "}
                      {selectedSeats.outbound[bus.busName]?.join(", ") ||
                        "None"}
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
                        {renderRowsToColumns(
                          bus.layout.seatConfiguration,
                          "return",
                          bus
                        )}
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
                        {renderColumnsToRows(
                          bus.layout.seatConfiguration,
                          "return",
                          bus
                        )}
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
                      {fare.return}
                    </Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
            {outboundLength && returnLength && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 2,
                }}
              >
                {!bookingConfirmed ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleBookSeats}
                  >
                    Book
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={downloadPDF}
                  >
                    Download Ticket
                  </Button>
                )}
              </Box>
            )}
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
            borderRadius: 4,
            p: { xs: 2, sm: 3, md: 4 },
            border: "2px dashed #9e9e9e",
            width: { xs: "90%", sm: "80%", md: 500 },
            maxWidth: "90%",
            overflow: "auto",
            fontFamily: "'Roboto', sans-serif",
          }}
        >
          <Typography
            variant="h5"
            align="center"
            sx={{
              fontWeight: "bold",
              color: "#3f51b5",
              mb: 2,
              fontSize: { xs: "20px", sm: "24px", md: "28px" },
            }}
          >
            Bus Ticket Confirmation
          </Typography>
          <Box
            sx={{ borderBottom: "2px dashed #9e9e9e", paddingBottom: 2, mb: 2 }}
          >
            <Typography
              variant="h6"
              sx={{ textDecoration: "underline", mb: 1 }}
            >
              Outbound Trip
            </Typography>
            {selectedBus.outbound && (
              <>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "bold",
                    mb: 1,
                    fontSize: { xs: "16px", sm: "18px" },
                  }}
                  color="#ff5722"
                >
                  {selectedBus.outbound.busName}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Route: <strong>{selectedBus.outbound.source}</strong> to{" "}
                  <strong>{selectedBus.outbound.destination}</strong>
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Origin Time: {selectedBus.outbound.startTime}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Destination Time: {selectedBus.outbound.endTime}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 0.5,
                    fontWeight: "bold",
                    color: "#4caf50",
                  }}
                >
                  Seats:{" "}
                  {selectedSeats.outbound[selectedBus.outbound.busName]?.join(
                    ", "
                  ) || "None"}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    mt: 1,
                    color: "#ff9800",
                    fontWeight: "bold",
                    fontSize: { xs: "18px", sm: "20px" },
                  }}
                >
                  Fare: ${fare.outbound}
                </Typography>
              </>
            )}
          </Box>
          <Box
            sx={{ borderBottom: "2px dashed #9e9e9e", paddingBottom: 2, mb: 2 }}
          >
            <Typography
              variant="h6"
              sx={{ textDecoration: "underline", mb: 1 }}
            >
              Return Trip
            </Typography>
            {selectedBus.return && (
              <>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "bold",
                    mb: 1,
                    fontSize: { xs: "16px", sm: "18px" },
                  }}
                  color="#ff5722"
                >
                  {selectedBus.return.busName}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Route: <strong>{selectedBus.return.source}</strong> to{" "}
                  <strong>{selectedBus.return.destination}</strong>
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Origin Time: {selectedBus.return.startTime}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Destination Time: {selectedBus.return.endTime}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 0.5,
                    fontWeight: "bold",
                    color: "#4caf50",
                  }}
                >
                  Seats:{" "}
                  {selectedSeats.return[selectedBus.return.busName]?.join(
                    ", "
                  ) || "None"}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    mt: 1,
                    color: "#ff9800",
                    fontWeight: "bold",
                    fontSize: { xs: "18px", sm: "20px" },
                  }}
                >
                  Fare: ${fare.return}
                </Typography>
              </>
            )}
          </Box>
          <Typography
            variant="h6"
            align="right"
            sx={{
              mt: 2,
              fontWeight: "bold",
              fontSize: { xs: "16px", sm: "18px" },
            }}
          >
            Total Fare: ${fare.outbound + fare.return}
          </Typography>
          <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              color="success"
              onClick={confirmBooking}
              sx={{
                borderRadius: "20px",
                padding: "10px 30px",
                textTransform: "uppercase",
                fontSize: { xs: "14px", sm: "16px" },
              }}
            >
              Confirm Booking
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};
export default RoundBus;
