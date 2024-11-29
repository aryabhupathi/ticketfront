// useEffect(() => {
//   const fetchStartBusData = async () => {
//     try {
//       const response = await fetch(
//         `http://localhost:5000/api/bus/search?source=${formData.source}&destination=${formData.destination}`
//       );
//       if (!response.ok) {
//         throw new Error("Error fetching buses");
//       }
//       const data = await response.json();
//       setOutboundTrip(
//         data.map((bus) => ({
//           ...bus,
//           bookedSeats: bus.bookedSeats || [],
//         }))
//       );
//     } catch (error) {
//       setError(error.message);
//       console.log(error, "Fetch Error");
//     }
//   };

//   fetchStartBusData();
// }, [formData.source, formData.destination]);

// useEffect(() => {
//   const fetchEndBusData = async () => {
//     try {
//       const response = await fetch(
//         `http://localhost:5000/api/bus/search?source=${formData.destination}&destination=${formData.source}`
//       );
//       if (!response.ok) {
//         throw new Error("Error fetching buses");
//       }
//       const data = await response.json();
//       setReturnTrip(
//         data.map((bus) => ({
//           ...bus,
//           bookedSeats: bus.bookedSeats || [],
//         }))
//       );
//     } catch (error) {
//       setError(error.message);
//       console.log(error, "Fetch Error");
//     }
//   };

//   fetchEndBusData();
// }, [formData.source, formData.destination]);
