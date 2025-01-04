/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  AccordionSummary,
  AccordionDetails,
  Modal,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Slider,
  MenuItem,
  Select,
} from "@mui/material";
import {
  FilterSection,
  FilterButton,
  FilterTitle,
  NewAccordion,
  SummaryBox,
  BusName,
  IconGap,
  BusRoute,
  BusFare,
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
  FareTotal,
  DetailBox,
  BookBox,
  ErrorText,
  ConfirmBox,
  ConfirmHead,
  ConfirmHeadRound,
  ConfirmBoxRound,
  ConfirmButtons,
  LegendButton,
  MainAccordion,
} from "./BusStyle";
import "jspdf-autotable";
import jsPDF from "jspdf";
import Grid from "@mui/material/Grid2";
import { useAuth } from "../authContext";
import { useMediaQuery } from "@mui/material";
import { useLocation } from "react-router-dom";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import DoubleArrowTwoToneIcon from "@mui/icons-material/DoubleArrowTwoTone";
import CurrencyRupeeTwoToneIcon from "@mui/icons-material/CurrencyRupeeTwoTone";
import ExpandCircleDownTwoToneIcon from "@mui/icons-material/ExpandCircleDownTwoTone";
import AirlineSeatReclineExtraSharpIcon from "@mui/icons-material/AirlineSeatReclineExtraSharp";
const RoundBus = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { formData } = location.state;
  const apiUrl = process.env.REACT_APP_API_URL;
  const isSmallScreen = useMediaQuery("(max-width:1100px)");
  const [error, setError] = useState(null);
  const [legend, setLegend] = useState(false);
  const [returnTrip, setReturnTrip] = useState([]);
  const [loginAlert, setLoginAlert] = useState(false);
  const [outboundTrip, setOutboundTrip] = useState([]);
  const [showMessage, setShowMessage] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentTripType, setCurrentTripType] = useState("");
  const [fare, setFare] = useState({ outbound: 0, return: 0 });
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [selectedTripType, setSelectedTripType] = useState("outbound");
  const [selectedSeats, setSelectedSeats] = useState({
    outbound: {},
    return: {},
  });
  const [selectedBus, setSelectedBus] = useState({
    outbound: null,
    return: null,
  });
  const [expandedIndex, setExpandedIndex] = useState({
    outbound: false,
    return: false,
  });
  const [bookingConfirmed, setBookingConfirmed] = useState({
    outbound: false,
    return: false,
  });
  const [filters, setFilters] = useState({
    outbound: { selectedStops: [], fareRange: [0, 5000] },
    return: { selectedStops: [], fareRange: [0, 5000] },
  });
  const [filteredTrips, setFilteredTrips] = useState({
    outbound: [],
    return: [],
  });
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
  useEffect(() => {
    const newFilteredTrips = {
      outbound: outboundTrip.filter(
        (bus) =>
          (filters.outbound.selectedStops.length === 0 ||
            filters.outbound.selectedStops.every((stop) =>
              bus.stops.includes(stop)
            )) &&
          bus.baseFare >= filters.outbound.fareRange[0] &&
          bus.baseFare <= filters.outbound.fareRange[1]
      ),
      return: returnTrip.filter(
        (bus) =>
          (filters.return.selectedStops.length === 0 ||
            filters.return.selectedStops.every((stop) =>
              bus.stops.includes(stop)
            )) &&
          bus.baseFare >= filters.return.fareRange[0] &&
          bus.baseFare <= filters.return.fareRange[1]
      ),
    };
    setFilteredTrips(newFilteredTrips);
  }, [filters, outboundTrip, returnTrip]);
  const resetFilters = () => {
    setFilters({
      outbound: { selectedStops: [], fareRange: [0, 5000] },
      return: { selectedStops: [], fareRange: [0, 5000] },
    });
  };
  const handleLegend = () => {
    setLegend((prev) => !prev);
  };
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
  const toggleFilters = () => {
    setShowFilters((prev) => !prev);
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
    setSelectedTripType(tripType);
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
    doc.setFont("helvetica", "bold");
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
  const handleStopsChange = (type, value) => {
    setFilters((prev) => ({
      ...prev,
      [type]: { ...prev[type], selectedStops: value },
    }));
  };
  const handleFareChange = (type, value) => {
    setFilters((prev) => ({
      ...prev,
      [type]: { ...prev[type], fareRange: value },
    }));
  };
  const handleClose = () => setShowMessage(false);
  const outboundLength = getTotalSelectedSeats("outbound");
  const returnLength = getTotalSelectedSeats("return");
  const renderRowsToColumns = (seatConfiguration, tripType, bus) => {
    return seatConfiguration.map((row, rowIndex) => (
      <Grid
        container
        key={rowIndex}
        spacing={1}
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
              size={{ xs: 3 }}
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  border: "1px dotted",
                  borderColor: isSelected ? "#76ff03" : "#2196f3",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: isBooked
                    ? "#bdbdbd"
                    : isSelected
                    ? "rgba(76, 175, 80, 0.3)"
                    : "rgba(33, 150, 243, 0.3)",
                  width: "100%",
                  minHeight: "35px",
                }}
              >
                <Button
                  variant="outlined"
                  color={isSelected ? "success" : "primary"}
                  size="small"
                  sx={{
                    borderRadius: "50%",
                    minWidth: 0,
                    background: "white",
                  }}
                  onClick={() => handleSeatClick(seat, tripType)}
                  disabled={isBooked || bookingConfirmed[tripType]}
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
                  minHeight: "35px",
                }}
              >
                <Button
                  variant="outlined"
                  color={isSelected ? "success" : "primary"}
                  size="small"
                  sx={{
                    borderRadius: "50%",
                    minWidth: 0,
                    background: "white",
                  }}
                  onClick={() => handleSeatClick(seat, tripType)}
                  disabled={isBooked || bookingConfirmed[tripType]}
                >
                  <AirlineSeatReclineExtraSharpIcon sx={{ fontSize: "12px" }} />
                  <Typography sx={{ fontSize: "10px" }}>{seat}</Typography>
                </Button>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    ));
  };
  return (
    <Grid item
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
        <Grid container
          display="flex"
          sx={{
            justifyContent:'center',
            flexDirection: { xs: "column", sm: "row" }
          }}
        >
         
        <Grid size={{xs:12, sm:3}} sx={{padding:2}}>
            <FilterSection>
              <FilterTitle variant="h6" onClick={toggleFilters}>
                <span>Filter Buses</span>
                <FilterAltIcon
                  sx={{ color: showFilters ? "#0288d1" : "#000" }}
                />
              </FilterTitle>
              {showFilters && (
                <>
                  {selectedTripType === "outbound" && (
                    <Grid container direction="column" spacing={2}>
                      <Grid item>
                        <Typography variant="h6" sx={{ color: "#0288d1" }}>
                          Outbound Buses
                        </Typography>
                      </Grid>
                      <Grid item>
                        <FormControl fullWidth>
                          <InputLabel>Stops</InputLabel>
                          <Select
                            multiple
                            value={filters.outbound.selectedStops}
                            onChange={(event) =>
                              handleStopsChange("outbound", event.target.value)
                            }
                            renderValue={(selected) => selected.join(", ")}
                          >
                            {[
                              ...new Set(
                                outboundTrip.flatMap((bus) => bus.stops)
                              ),
                            ].map((stop) => (
                              <MenuItem key={stop} value={stop}>
                                {stop}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item>
                        <Box>
                          <Typography gutterBottom sx={{ color: "#00796b" }}>
                            Fare (₹{filters.outbound.fareRange[0]} - ₹
                            {filters.outbound.fareRange[1]})
                          </Typography>
                          <Slider
                            value={filters.outbound.fareRange}
                            onChange={(event, newValue) =>
                              handleFareChange("outbound", newValue)
                            }
                            valueLabelDisplay="auto"
                            min={0}
                            max={5000}
                            step={100}
                            sx={{ color: "#0288d1" }}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  )}
                  {selectedTripType === "return" && (
                    <Grid container direction="column" spacing={2}>
                      <Grid item>
                        <Typography variant="h6" sx={{ color: "#d32f2f" }}>
                          Return Buses
                        </Typography>
                      </Grid>
                      <Grid item>
                        <FormControl fullWidth>
                          <InputLabel>Stops</InputLabel>
                          <Select
                            multiple
                            value={filters.return.selectedStops}
                            onChange={(event) =>
                              handleStopsChange("return", event.target.value)
                            }
                            renderValue={(selected) => selected.join(", ")}
                          >
                            {[
                              ...new Set(
                                returnTrip.flatMap((bus) => bus.stops)
                              ),
                            ].map((stop) => (
                              <MenuItem key={stop} value={stop}>
                                {stop}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item>
                        <Box>
                          <Typography gutterBottom sx={{ color: "#d84315" }}>
                            Fare (₹{filters.return.fareRange[0]} - ₹
                            {filters.return.fareRange[1]})
                          </Typography>
                          <Slider
                            value={filters.return.fareRange}
                            onChange={(event, newValue) =>
                              handleFareChange("return", newValue)
                            }
                            valueLabelDisplay="auto"
                            min={0}
                            max={5000}
                            step={100}
                            sx={{ color: "#d32f2f" }}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  )}
                  <Box
                    sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}
                  >
                    <FilterButton
                      onClick={() => resetFilters()}
                      sx={{
                        backgroundColor: "#1976d2",
                        color: "#ffffff",
                        "&:hover": { backgroundColor: "#1565c0" },
                      }}
                    >
                      Reset Filters
                    </FilterButton>
                  </Box>
                </>
              )}
            </FilterSection>
          </Grid>
         
        <Grid size={{xs:12, sm:9}} sx={{padding:2}}>
            <MainAccordion>
              <Typography
                variant="h5"
                sx={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)",
                  color: "#F97316",
                }}
                gutterBottom
              >
                Outbound Trip
              </Typography>
              {filteredTrips.outbound.map((bus, index) => (
                <NewAccordion
                  key={index}
                  expanded={expandedIndex.outbound === index}
                  onChange={() => handleChange(index, "outbound")}
                >
                  <AccordionSummary
                    expandIcon={<ExpandCircleDownTwoToneIcon />}
                  >
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
                            <CurrencyRupeeTwoToneIcon
                              sx={{ fontSize: "16px", color: "#F97316" }}
                            />
                            {bus.baseFare}
                          </BusFare>
                        </>
                      )}
                    </SummaryBox>
                  </AccordionSummary>
                  <AccordionDetails>
                    <DetailBox>
                      <BusTime variant="body2">
                        Start Time: {bus.startTime} | End Time: {bus.endTime}
                      </BusTime>
                      <BusStop variant="body2">
                        Stops: {bus.stops.join(", ")}
                      </BusStop>
                      <BusSeat variant="body2">
                        Seats Available: {bus.noOfSeatsAvailable}
                      </BusSeat>
                      <BusSeat variant="body2">
                        Selected Seats:{" "}
                        {selectedSeats.outbound[bus.busName]?.join(", ") ||
                          "None"}
                      </BusSeat>
                      {isSmallScreen
                        ? renderRowsToColumns(
                            bus.layout.seatConfiguration,
                            "outbound",
                            bus
                          )
                        : renderColumnsToRows(
                            bus.layout.seatConfiguration,
                            "outbound",
                            bus
                          )}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                        }}
                      >
                        <LegendButton onClick={handleLegend}>
                          {legend ? "Hide Legend" : "Show Legend"}
                        </LegendButton>
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
                    </DetailBox>
                    <FareTotal variant="h6">
                      Total Fare:
                      <CurrencyRupeeTwoToneIcon
                        sx={{ fontSize: "16px", color: "#F43F5E" }}
                      />
                      {fare.outbound}
                    </FareTotal>
                  </AccordionDetails>
                </NewAccordion>
              ))}
            </MainAccordion>
            <MainAccordion>
              <Typography
                variant="h5"
                sx={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)",
                  color: "#F97316",
                }}
                gutterBottom
              >
                Return Trips
              </Typography>
              {filteredTrips.return.map((bus, index) => (
                <NewAccordion
                  key={index}
                  expanded={expandedIndex.return === index}
                  onChange={() => handleChange(index, "return")}
                >
                  <AccordionSummary
                    expandIcon={<ExpandCircleDownTwoToneIcon />}
                  >
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
                            Fare :{" "}
                            <CurrencyRupeeTwoToneIcon
                              sx={{ fontSize: "16px" }}
                            />
                            {bus.baseFare}
                          </BusFare>
                        </>
                      )}
                    </SummaryBox>
                  </AccordionSummary>
                  <AccordionDetails>
                    <DetailBox>
                      <BusTime variant="body2">
                        Start: {bus.startTime} | | End: {bus.endTime}
                      </BusTime>
                      <BusStop variant="body2">
                        Stops: {bus.stops.join(", ")}
                      </BusStop>
                      <BusSeat variant="body2">
                        Seats Available: {bus.noOfSeatsAvailable}
                      </BusSeat>
                      <BusSeat variant="body2">
                        Selected Seats:{" "}
                        {selectedSeats.return[bus.busName]?.join(", ") ||
                          "None"}
                      </BusSeat>
                      {isSmallScreen
                        ? renderRowsToColumns(
                            bus.layout.seatConfiguration,
                            "return",
                            bus
                          )
                        : renderColumnsToRows(
                            bus.layout.seatConfiguration,
                            "return",
                            bus
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
                        Total Fare:
                        <CurrencyRupeeTwoToneIcon sx={{ fontSize: "16px" }} />
                        {fare.return}
                      </FareTotal>
                    </DetailBox>
                  </AccordionDetails>
                </NewAccordion>
              ))}
            </MainAccordion>
            {outboundLength && returnLength && (
              <Box display="flex" justifyContent="center" margin="16px 0">
                {!bookingConfirmed.outbound || !bookingConfirmed.return ? (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleBookSeats()}
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
          </Grid>
        </Grid>
      )}
      {error && (
        <ErrorText variant="h6">No buses available for this trip</ErrorText>
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
        <ConfirmBox>
          <ConfirmHead variant="h5" gutterBottom>
            Confirm Your Ticket
          </ConfirmHead>
          <ConfirmBoxRound>
            <ConfirmHeadRound>Outbound Trip</ConfirmHeadRound>
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
          </ConfirmBoxRound>
          <ConfirmBoxRound>
            <ConfirmHeadRound>Return Trip</ConfirmHeadRound>
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
          </ConfirmBoxRound>
          <Typography
            variant="h6"
            align="right"
            sx={{
              mt: 2,
              fontWeight: "bold",
            }}
          >
            Total Fare: ${fare.outbound + fare.return}
          </Typography>
          <ConfirmButtons>
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
          </ConfirmButtons>
        </ConfirmBox>
      </Modal>
    </Grid>
  );
};
export default RoundBus;
