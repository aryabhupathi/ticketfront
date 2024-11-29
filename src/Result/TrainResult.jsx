import React from "react";
import { useLocation } from "react-router-dom";
import SingleTrain from "../Train/SingleTrain";
import RoundTrain from "../Train/RoundTrain";
import Layout from "../Layout";
const TrainsResults = () => {
  const location = useLocation();
  const { formData } = location.state;
  return (
    <Layout>
      {formData.tripType === "single" && <SingleTrain />}
      {formData.tripType === "round" && <RoundTrain />}
    </Layout>
  );
};

export default TrainsResults;
