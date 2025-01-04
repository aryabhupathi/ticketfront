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
  FormControl,
  Select,
  MenuItem,
  Slider,
} from "@mui/material";
import {
  FilterSection,
  FilterButton,
  MainTitle,
  FilterTitle,
  BusName,
  BusRoute,
  BusFare,
  SummaryBox,
  IconGap,
  BusTime,
  BusStop,
  BusSeat,
  AvailableText,
  AvailableBox,
  ReservedBox,
  ReservedText,
  SelectedBox,
  SelectedText,
  LegendGroup,
  LegendBox,
  FilterBox,
  FareTotal,
  DetailBox,
  BookBox,
  ErrorText,
  ConfirmBox,
  ConfirmHead,
  ConfirmButtons,
  ConfirmDetails,
  NewAccordion,
} from "./BusStyle";
import "jspdf-autotable";
import jsPDF from "jspdf";
import Grid from "@mui/material/Grid2";
import { useAuth } from "../authContext";
import { useMediaQuery } from "@mui/material";
import { useLocation } from "react-router-dom";
import LoaderAnimation from "../constants/loadme";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import DoubleArrowTwoToneIcon from "@mui/icons-material/DoubleArrowTwoTone";
import CurrencyRupeeTwoToneIcon from "@mui/icons-material/CurrencyRupeeTwoTone";
import ExpandCircleDownTwoToneIcon from "@mui/icons-material/ExpandCircleDownTwoTone";
import AirlineSeatReclineExtraSharpIcon from "@mui/icons-material/AirlineSeatReclineExtraSharp";
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
  const [loading, setLoading] = useState(true);
  const [filteredBuses, setFilteredBuses] = useState(trip);
  const [selectedStops, setSelectedStops] = useState([]);
  const [fareRange, setFareRange] = useState([0, 5000]);
  const [showFilters, setShowFilters] = useState(false);
  const [legend, setLegend] = useState(false);
  useEffect(() => {
    const filtered = trip.filter(
      (bus) =>
        (selectedStops.length === 0 ||
          selectedStops.every((stop) => bus.stops.includes(stop))) &&
        bus.baseFare >= fareRange[0] &&
        bus.baseFare <= fareRange[1]
    );
    setFilteredBuses(filtered);
  }, [selectedStops, fareRange, trip]);
  useEffect(() => {
    const fetchBusData = async () => {
      setLoading(true);
      setError("");
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
      } finally {
        setLoading(false);
      }
    };
    fetchBusData();
  }, [formData.source, formData.destination, apiUrl]);
  const handleLegend = () => {
    setLegend((prev) => !prev);
  };
  const toggleFilters = () => {
    setShowFilters((prev) => !prev);
  };
  const handleStopsChange = (event) => {
    setSelectedStops(event.target.value);
  };
  const handleFareChange = (event, newValue) => {
    setFareRange(newValue);
  };
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
              size={{ xs: 3 }}
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: selectedSeats[selectedBus?._id]?.includes(seat)
                    ? "#76ff03"
                    : "#2196f3",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "35px",
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
                    borderRadius: "50%",
                    minWidth: 0,
                    background: "white",
                  }}
                  onClick={() => handleSeatClick(seat)}
                  disabled={isBooked}
                >
                  <AirlineSeatReclineExtraSharpIcon sx={{ fontSize: "10px" }} />
                  <Typography sx={{ fontSize: "10px" }}>{seat}</Typography>
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
                    minHeight: "35px",
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
                      borderRadius: "50%",
                      minWidth: 0,
                      background: "white",
                    }}
                    onClick={() => handleSeatClick(seat)}
                    disabled={isBooked}
                  >
                    <AirlineSeatReclineExtraSharpIcon
                      sx={{ fontSize: "10px" }}
                    />
                    <Typography sx={{ fontSize: "10px" }}>{seat}</Typography>
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
    <Grid
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
      {loading && (
        <Box className="loader-overlay">
          <LoaderAnimation />
        </Box>
      )}
      {error && <Box sx={{ color: "red" }}>{error}</Box>}
      <MainTitle variant="h5">
        Available Buses from {formData.source} to {formData.destination}
      </MainTitle>
      <Grid container
        display={"flex"}
        sx={{
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Grid size={{ xs: 12, sm: 3 }} sx={{ padding: 2 }}>
          <FilterSection>
            <FilterTitle variant="h6" onClick={toggleFilters}>
              <span>Filter Buses</span>
              <FilterAltIcon sx={{ color: showFilters ? "#0288d1" : "#000" }} />
            </FilterTitle>
            {showFilters && (
              <FilterBox>
                <FormControl
                  fullWidth
                  sx={{ marginTop: "8px", marginBottom: "8px" }}
                >
                  <Select
                    multiple
                    value={selectedStops}
                    onChange={handleStopsChange}
                    renderValue={(selected) => selected.join(", ")}
                    size="small"
                  >
                    {[...new Set(trip.flatMap((bus) => bus.stops))].map(
                      (stop) => (
                        <MenuItem key={stop} value={stop}>
                          {stop}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
                <Box>
                  <Typography gutterBottom>
                    Fare (₹{fareRange[0]} - ₹{fareRange[1]})
                  </Typography>
                  <Slider
                    value={fareRange}
                    onChange={handleFareChange}
                    valueLabelDisplay="auto"
                    min={0}
                    max={5000}
                    step={100}
                    sx={{ color: "#4db6ac" }}
                    size="small"
                  />
                </Box>
                <FilterButton
                  sx={{ alignSelf: "center" }}
                  onClick={() => setFilteredBuses(trip)}
                >
                  Reset Filters
                </FilterButton>
              </FilterBox>
            )}
          </FilterSection>
        </Grid>
        <Grid size={{ xs: 12, sm: 9 }} sx={{ padding: 2 }}>
          {filteredBuses.length > 0 ? (
            filteredBuses.map((bus, index) => (
              <NewAccordion
                key={bus._id}
                expanded={expanded === index}
                onChange={() => handleChange(index, bus)}
              >
                <AccordionSummary expandIcon={<ExpandCircleDownTwoToneIcon />}>
                  <SummaryBox>
                    <Box
                      component="img"
                      src="../../image.png"
                      alt="Bus Logo"
                      sx={{
                        width: "25px",
                        height: "25px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                    <BusName variant="subtitle">{bus.busName}</BusName>
                    {!isSmallScreen && (
                      <>
                        <IconGap>
                          <DoubleArrowTwoToneIcon fontSize="small" />
                        </IconGap>
                        <BusRoute variant="body1">
                          {bus.source} -- {bus.destination}
                        </BusRoute>
                        <IconGap>
                          <DoubleArrowTwoToneIcon fontSize="small" />
                        </IconGap>
                        <BusFare variant="body1">
                          Fare:{" "}
                          <CurrencyRupeeTwoToneIcon sx={{ fontSize: "16px" }} />
                          {bus.baseFare}
                        </BusFare>
                      </>
                    )}
                  </SummaryBox>
                </AccordionSummary>
                <AccordionDetails>
                  <DetailBox
                   
                  >
                    <BusTime variant="body2">
                      Start Time: {bus.startTime} | End Time: {bus.endTime}
                    </BusTime>
                    <BusStop variant="body2">
                      Stops: {bus.stops.join(", ")}
                    </BusStop>
                    <BusSeat variant="body2">
                      Seats Available: {bus.noOfSeatsAvailable}
                    </BusSeat>
                    {isSmallScreen ? (
                      <>{renderRowsToColumns(bus.layout.seatConfiguration)}</>
                    ) : (
                      <>{renderColumnsToRows(bus.layout.seatConfiguration)}</>
                    )}
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Button onClick={handleLegend}>
                        {legend ? "Hide Legend" : "Show Legend"}
                      </Button>
                    </Box>
                    {legend && (
                      <>
                        <LegendBox>
                          <LegendGroup>
                            <AvailableBox />
                            <AvailableText>Available</AvailableText>
                          </LegendGroup>
                          <LegendGroup>
                            <ReservedBox />
                            <ReservedText>Reserved</ReservedText>
                          </LegendGroup>
                          <LegendGroup>
                            <SelectedBox />
                            <SelectedText>Selected</SelectedText>
                          </LegendGroup>
                        </LegendBox>
                      </>
                    )}
                    <FareTotal variant="h6">
                      Total Fare:{" "}
                      <CurrencyRupeeTwoToneIcon sx={{ fontSize: "16px" }} />
                      {fare}
                    </FareTotal>
                    <BookBox>
                      {selectedSeats[bus._id]?.length > 0 &&
                      !bookingConfirmed ? (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleBookSeats}
                          size="small"
                        >
                          Book
                        </Button>
                      ) : (
                        bookingConfirmed && (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={downloadPDF}
                          >
                            Download
                          </Button>
                        )
                      )}
                    </BookBox>
                  </DetailBox>
                </AccordionDetails>
              </NewAccordion>
            ))
          ) : (
            <ErrorText variant="h6">No buses available</ErrorText>
          )}
        </Grid>
      </Grid>
      <Modal open={openConfirmModal} onClose={() => setOpenConfirmModal(false)}>
        <ConfirmBox>
          <ConfirmHead variant="h5" gutterBottom>
            Confirm Your Ticket
          </ConfirmHead>
          {Object.keys(selectedSeats).map((busId, index) => {
            const busDetails = trip.find((bus) => bus._id === busId);
            return (
              selectedSeats[busId].length > 0 && (
                <ConfirmDetails key={index}>
                  <Typography
                    variant="body1"
                    textAlign="center"
                    sx={{
                      fontWeight: "bold",
                      mb: 1,
                    }}
                    color="#ff5722"
                  >
                    {busDetails.busName}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 0.5,
                    }}
                  >
                    Route: <strong>{busDetails.source}</strong> to{" "}
                    <strong>{busDetails.destination}</strong>
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 0.5,
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
                </ConfirmDetails>
              )
            );
          })}
          <ConfirmButtons>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={confirmBooking}
            >
              Confirm
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setOpenConfirmModal(false)}
            >
              Cancel
            </Button>
          </ConfirmButtons>
        </ConfirmBox>
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
    </Grid>
  );
};
export default SingleBus;
