
const RoundBus = () => {
  const location = useLocation();
  const { formData } = location.state;
  const [selectedSeats, setSelectedSeats] = useState({
    outbound: {},
    return: {},
  });
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
  const [bookingConfirmed, setBookingConfirmed] = useState({
    outbound: false,
    return: false,
  });
  const [currentTripType, setCurrentTripType] = useState("");
  const [showMessage, setshowMessage] = useState(false);
  const [outboundTrip, setOutboundTrip] = useState([])
  const [returnTrip, setReturnTrip] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStartTripData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/bus/search?source=${formData.source}&destination=${formData.destination}`
        );
        if (!response.ok) {
          throw new Error("Error fetching buses");
        }
        const data = await response.json();
        setOutboundTrip(data);
      } catch (error) {
        setError(error.message);
        console.error("Fetch Error: ", error);
      }
    };

    fetchStartTripData();
  }, [formData.source, formData.destination]);

  // Fetch data for the return trip
  useEffect(() => {
    const fetchReturnTripData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/bus/search?source=${formData.destination}&destination=${formData.source}`
        );
        if (!response.ok) {
          throw new Error("Error fetching return buses");
        }
        const data = await response.json();
        setReturnTrip(data);
      } catch (error) {
        setError(error.message);
        console.error("Fetch Error: ", error);
      }
    };

    fetchReturnTripData();
  }, [formData.source, formData.destination]);

  const handleClose = () => setshowMessage(false);

  const handleSeatClick = (seat, tripType) => {
    // Ensure that a bus is selected and booking is not confirmed
    if (!selectedBus[tripType] || bookingConfirmed[tripType]) return;
  
    setSelectedSeats((prevSelectedSeats) => {
      const currentSelection =
        prevSelectedSeats[tripType][selectedBus[tripType].busName] || [];
      const isSelected = currentSelection.includes(seat);
      const updatedSelection = isSelected
        ? currentSelection.filter((s) => s !== seat)
        : [...currentSelection, seat];
  
      // Update the fare based on the selected seats
      setFare((prevFare) => ({
        ...prevFare,
        [tripType]: updatedSelection.length * selectedBus[tripType].fare,
      }));
  
      // Update the number of available seats in the selected bus
      setSelectedBus((prevSelectedBus) => {
        const updatedBus = {
          ...prevSelectedBus,
          [tripType]: {
            ...prevSelectedBus[tripType],
            noOfSeatsAvailable: isSelected
              ? prevSelectedBus[tripType].noOfSeatsAvailable + 1 // Add seat back if deselected
              : prevSelectedBus[tripType].noOfSeatsAvailable - 1, // Reduce seat if selected
          },
        };
  
        return updatedBus;
      });
  
      return {
        ...prevSelectedSeats,
        [tripType]: {
          ...prevSelectedSeats[tripType],
          [selectedBus[tripType].busName]: updatedSelection,
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
      [tripType]: { [bus.busName]: [] }, // Reset selected seats for the new bus
    }));

    setFare((prevFare) => ({
      ...prevFare,
      [tripType]: 0, // Reset fare when changing bus
    }));

    setBookingConfirmed((prev) => ({
      ...prev,
      [tripType]: false, // Reset booking confirmation state
    }));
  };

  const handleBookSeats = (tripType) => {
    setCurrentTripType(tripType); // Set the current trip type for confirmation
    setOpenConfirmModal(true); // Open the confirmation modal
  };

  const confirmBooking = () => {
    setBookingConfirmed((prev) => ({
      ...prev,
      [currentTripType]: true, // Set the current trip type booking as confirmed
    }));
    setOpenConfirmModal(false); // Close confirmation modal
    setTimeout(() => {
      setshowMessage(true);
    }, 2000);
  };

  const downloadPDF = (tripType) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    // Header
    doc.setFontSize(22);
    doc.text("Reservation Details", margin, margin);
    doc.setFontSize(12);
    doc.text(
      `Date: ${new Date().toLocaleDateString()}`,
      pageWidth - margin - 50,
      margin
    );

    // Table header
    const headerY = 40;
    doc.setFontSize(12);
    const headers = ["Bus Name", "Route", "Seats", "Fare"];
    const columnWidths = [60, 80, 50, 30];

    // Draw header row
    headers.forEach((header, index) => {
      doc.text(
        header,
        margin + columnWidths.slice(0, index).reduce((a, b) => a + b, 0),
        headerY
      );
    });

    // Data rows
    let y = headerY + 10;

    const selectedSeatsForTrip = selectedSeats[tripType];
    const selectedBusDetails = selectedBus[tripType];

    if (selectedSeatsForTrip[selectedBusDetails.busName]?.length > 0) {
      const seats = selectedSeatsForTrip[selectedBusDetails.busName];
      const fare = selectedBusDetails.fare * seats.length;

      // Aligning data in rows
      doc.text(selectedBusDetails.busName, margin, y);
      doc.text(
        `${selectedBusDetails.source} to ${selectedBusDetails.destination}`,
        margin + columnWidths[0],
        y
      );
      doc.text(seats.join(", "), margin + columnWidths[0] + columnWidths[1], y);
      doc.text(
        `$${fare}`,
        margin + columnWidths[0] + columnWidths[1] + columnWidths[2],
        y
      );

      y += 10;

      // Add page break if necessary
      if (y > pageHeight - margin) {
        doc.addPage();
        y = headerY + 10; // Reset y for new page
        // Reprint the header on the new page
        headers.forEach((header, index) => {
          doc.text(
            header,
            margin + columnWidths.slice(0, index).reduce((a, b) => a + b, 0),
            headerY
          );
        });
      }
    }

    // Footer
    doc.setFontSize(10);
    doc.text("Thank you for your reservation!", margin, pageHeight - margin);

    // Save the PDF
    doc.save("reservation-details.pdf");
  };

  const handleChange = (busIndex, tripType) => {
    // Check if the clicked bus is already expanded
    const isCurrentlyExpanded = expandedIndex[tripType] === busIndex;

    // Collapse if already expanded
    setExpandedIndex((prevExpandedIndex) => ({
      ...prevExpandedIndex,
      [tripType]: isCurrentlyExpanded ? false : busIndex, // Set to false to collapse
    }));

    // If not currently expanded, select the bus
    if (!isCurrentlyExpanded) {
      const selectedBusDetails =
        tripType === "outbound"
          ? outboundTrip[busIndex]
          : returnTrip[busIndex];
      handleBusSelect(selectedBusDetails, tripType);
    } else {
      // If it is currently expanded, clear the selection
      setSelectedBus((prev) => ({
        ...prev,
        [tripType]: null, // Clear selected bus
      }));
      setSelectedSeats((prevSelectedSeats) => ({
        ...prevSelectedSeats,
        [tripType]: {}, // Reset selected seats
      }));
      setFare((prevFare) => ({
        ...prevFare,
        [tripType]: 0, // Reset fare when collapsing
      }));
      setBookingConfirmed((prev) => ({
        ...prev,
        [tripType]: false, // Reset booking confirmation state
      }));
    }
  };
#   t i c k e t f r o n t  
 