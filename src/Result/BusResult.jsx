import React from "react";
import { useLocation } from "react-router-dom";
import SingleBus from "../Bus/SingleBus";
import RoundBus from "../Bus/Roundbus";
import Layout from "../Layout";
import NewSingleBus from "../Bus/NewSingleBus";

const BusResults = () => {
  const location = useLocation();
  const { formData } = location.state;
  return (
    <Layout>
      {formData.tripType === "single" && <SingleBus />}
      {formData.tripType === "round" && <RoundBus />}
    </Layout>
  );
};

export default BusResults;
