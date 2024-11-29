import React from "react";
import { useLocation } from "react-router-dom";
import Layout from "../Layout"
import Progress from "../Progress/Progress";
import TicketStepper from "../Flight/TicketStepper";
import SingleFlight from "../Flight/SingleFlight";
import RoundFlight from "../Flight/RoundFlight";

const FlightResults = () => {
  const location = useLocation();
  const { formData } = location.state;
  return (
    <Layout>
      {formData.tripType === "single" && <SingleFlight />}
      {formData.tripType === "round" && <RoundFlight />}
    </Layout>
  );
};

export default FlightResults;
