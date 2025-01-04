import React from "react";
import { useState } from "react";
import { Container, Typography, Box, Card } from "@mui/material";
import Layout from "../Layout";
import Login from "./Login";
import Signup from "./Signup";
const LoginHome = () => {
  const [signup, setSignup] = useState(false);
  const toggleSignup = () => setSignup((prev) => !prev);
  return (
    <Layout>
      <Container maxWidth="lg" sx={{ border: "5px solid black" }}>
        <Card
          sx={{
            border: "2px solid red",
            display: "flex",
            flexDirection: "row",
            gap: 2,
            p: 2,
            marginTop: 5,
            width: "90%",
          }}
        >
          <Box
            sx={{
              flex: 1,
              border: "2px solid yellow",
              borderRadius: "30px",
              width: "350px",
              height: "auto",
              p: 2,
              overflow: "hidden",
              position: "relative",
              bgcolor: "white",
              boxShadow: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              "&::before": {
                content: '""',
                width: "60px",
                height: "8px",
                backgroundColor: "gray",
                borderRadius: "8px",
                position: "absolute",
                top: "10px",
                left: "50%",
                transform: "translateX(-50%)",
              },
            }}
          >
            <Typography variant="h5" align="center" gutterBottom>
              Welcome
            </Typography>
            <Typography variant="body2" align="center" sx={{ mb: 2 }}>
              Enter your details to log in and access your account.
            </Typography>
          </Box>
          <Box sx={{ flex: 2, p: 2 }}>
            {signup ? (
              <Signup toggleSignup={toggleSignup} />
            ) : (
              <Login toggleSignup={toggleSignup} />
            )}
          </Box>
        </Card>
      </Container>
    </Layout>
  );
};
export default LoginHome;
