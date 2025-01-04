import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import TicketReservationForm from "./Form/TicketForm";
import BusResults from "./Result/BusResult";
import TrainsResults from "./Result/TrainResult";
import FlightResults from "./Result/FlightResult";
import { AuthProvider } from "./authContext";
import Signup from "./Login/Signup";
import ForgotPassword from "./Login/Forgot";
import LoginHome from "./Login/LoginHome";
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<TicketReservationForm />} />
          <Route path="/login" element={<LoginHome />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/results/bus" element={<BusResults />} />
          <Route path="/results/train" element={<TrainsResults />} />
          <Route path="/results/flight" element={<FlightResults />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};
export default App;
