// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   AppBar,
//   Toolbar,
//   Typography,
//   Button,
//   Snackbar,
//   Drawer,
//   IconButton,
//   Avatar,
//   Menu,
//   MenuItem,
// } from "@mui/material";
// import { deepOrange, grey } from "@mui/material/colors";
// import { useNavigate } from "react-router-dom";
// import Chatbot from "./ChatBot/ChatBot";
// import { useAuth } from "./authContext";
// const Layout = ({ children }) => {
//   const navigate = useNavigate();
//   const { user, message, logout, clearMessage } = useAuth();
//   const [botOpen, setBotOpen] = useState(false);
//   const [snackbarOpen, setSnackbarOpen] = useState(false);
//   const [isDrawerOpen, setIsDrawerOpen] = useState(false);
//   const [anchorElUser, setAnchorElUser] = useState(null);
//   const handleSnackbarClose = () => {
//     setSnackbarOpen(false);
//     clearMessage();
//   };
//   const handleLogin = () => {
//     navigate("/login");
//     setIsDrawerOpen(false);
//   };
//   const handleOpenUserMenu = (event) => {
//     setAnchorElUser(event.currentTarget);
//   };
//   const handleCloseUserMenu = () => {
//     setAnchorElUser(null);
//   };
//   const handleLogout = () => {
//     logout();
//     navigate("/");
//     setAnchorElUser(null);
//   };
//   const toggleDrawer = () => {
//     setIsDrawerOpen(!isDrawerOpen);
//   };
//   useEffect(() => {
//     if (message) {
//       setSnackbarOpen(true);
//     }
//   }, [message]);
//   const getInitial = (name) => {
//     return name ? name.charAt(0).toUpperCase() : "U"; 
//   };
//   return (
//     <Box sx={{ position: "relative", minHeight: "100vh" }}>
//       <AppBar position="static" sx = {{backgroundColor:'red', height:'60px'}}>
//         <Toolbar sx={{ justifyContent: "space-between" }}>
//           <Typography variant="h6">TripSure</Typography>
//           <Box sx={{ flexGrow: 0 }}>
//             {user ? (
//               <>
//                 <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
//                   <Avatar sx={{ bgcolor: deepOrange[500] }}>
//                     {getInitial(user.name)}
//                   </Avatar>
//                 </IconButton>
//                 <Menu
//                   sx={{ mt: "45px" }}
//                   id="menu-appbar"
//                   anchorEl={anchorElUser}
//                   anchorOrigin={{ vertical: "top", horizontal: "right" }}
//                   keepMounted
//                   transformOrigin={{ vertical: "top", horizontal: "right" }}
//                   open={Boolean(anchorElUser)}
//                   onClose={handleCloseUserMenu}
//                 >
//                   <MenuItem key="profile">
//                     <Typography textAlign="center">
//                       {user.name}
//                     </Typography>
//                   </MenuItem>
//                   <MenuItem key="logout" onClick={handleLogout}>
//                     <Typography textAlign="center">Logout</Typography>
//                   </MenuItem>
//                 </Menu>
//               </>
//             ) : (
//               <>
//                 {/* Guest avatar with login menu */}
//                 <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
//                   <Avatar sx={{ bgcolor: grey[500] }}>G</Avatar>
//                 </IconButton>
//                 <Menu
//                   sx={{ mt: "45px" }}
//                   id="menu-appbar"
//                   anchorEl={anchorElUser}
//                   anchorOrigin={{ vertical: "top", horizontal: "right" }}
//                   keepMounted
//                   transformOrigin={{ vertical: "top", horizontal: "right" }}
//                   open={Boolean(anchorElUser)}
//                   onClose={handleCloseUserMenu}
//                 >
//                   <Typography
//                     sx={{ padding: "8px 16px", fontWeight: 600, color: grey[800] }}
//                   >
//                     Welcome Guest
//                   </Typography>
//                   <MenuItem key="login" onClick={handleLogin}>
//                     <Typography textAlign="center">Login / Sign Up</Typography>
//                   </MenuItem>
//                 </Menu>
//               </>
//             )}
//           </Box>
//         </Toolbar>
//       </AppBar>
//       <Drawer
//         anchor="top"
//         open={isDrawerOpen}
//         onClose={toggleDrawer}
//         PaperProps={{ sx: { top: "64px", height: "auto" } }} // Adjust drawer position
//       >
//         <Box sx={{ padding: 2 }}>
//           <Typography variant="h6">
//             {user ? `Welcome, ${user.name}` : "Welcome, Guest"}
//           </Typography>
//           {user ? (
//             <Button
//               variant="contained"
//               color="primary"
//               onClick={handleLogout}
//               fullWidth
//               sx={{ mt: 2 }}
//             >
//               Logout
//             </Button>
//           ) : (
//             <Button
//               variant="contained"
//               color="primary"
//               onClick={handleLogin}
//               fullWidth
//               sx={{ mt: 2 }}
//             >
//               Login
//             </Button>
//           )}
//         </Box>
//       </Drawer>
//      {children}
//       <Snackbar
//         open={snackbarOpen}
//         autoHideDuration={6000}
//         onClose={handleSnackbarClose}
//         message={message}
//       />
//       <Box
//         sx={{
//           position: "absolute",
//           bottom: 16,
//           right: 16,
//           cursor: "pointer",
//           borderRadius: "50%",
//           backgroundColor: "#faf4cd",
//           boxShadow: 2,
//           padding: 1,
//         }}
//         onClick={() => setBotOpen((prev) => !prev)} 
//       >
//         <img
//           src={botOpen ? '../../cancel.png' : '../../robot.png'} 
//           alt={botOpen ? "Close Chatbot" : "Open Chatbot"}
//           height={50}
//           width={50}
//         />
//       </Box>
//       {botOpen && <Chatbot open={botOpen} onClose={() => setBotOpen(false)} />}
//     </Box>
//   );
// };
// export default Layout;


import React, { useState, useEffect } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Snackbar,
  Drawer,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import { deepOrange, grey } from "@mui/material/colors";
import { useNavigate } from "react-router-dom";
import Chatbot from "./ChatBot/ChatBot";
import { useAuth } from "./authContext";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const { user, message, logout, clearMessage } = useAuth();
  const [botOpen, setBotOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    clearMessage();
  };

  const handleLogin = () => {
    navigate("/login");
    setIsDrawerOpen(false);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setAnchorElUser(null);
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  useEffect(() => {
    if (message) {
      setSnackbarOpen(true);
    }
  }, [message]);

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U"; 
  };

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        backgroundImage: "url('../../home.webp')", // Set your background image here
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <AppBar position="static" sx={{ backgroundColor: 'red', height: '60px' }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6">TripSure</Typography>
          <Box sx={{ flexGrow: 0 }}>
            {user ? (
              <>
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar sx={{ bgcolor: deepOrange[500] }}>
                    {getInitial(user.name)}
                  </Avatar>
                </IconButton>
                <Menu
                  sx={{ mt: "45px" }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{ vertical: "top", horizontal: "right" }}
                  keepMounted
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem key="profile">
                    <Typography textAlign="center">
                      {user.name}
                    </Typography>
                  </MenuItem>
                  <MenuItem key="logout" onClick={handleLogout}>
                    <Typography textAlign="center">Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar sx={{ bgcolor: grey[500] }}>G</Avatar>
                </IconButton>
                <Menu
                  sx={{ mt: "45px" }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{ vertical: "top", horizontal: "right" }}
                  keepMounted
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <Typography
                    sx={{ padding: "8px 16px", fontWeight: 600, color: grey[800] }}
                  >
                    Welcome Guest
                  </Typography>
                  <MenuItem key="login" onClick={handleLogin}>
                    <Typography textAlign="center">Login / Sign Up</Typography>
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="top"
        open={isDrawerOpen}
        onClose={toggleDrawer}
        PaperProps={{ sx: { top: "64px", height: "auto" } }} // Adjust drawer position
      >
        <Box sx={{ padding: 2 }}>
          <Typography variant="h6">
            {user ? `Welcome, ${user.name}` : "Welcome, Guest"}
          </Typography>
          {user ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogout}
              fullWidth
              sx={{ mt: 2 }}
            >
              Logout
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogin}
              fullWidth
              sx={{ mt: 2 }}
            >
              Login
            </Button>
          )}
        </Box>
      </Drawer>
      <Box sx={{ paddingBottom: botOpen ? '80px' : '16px' }}> {/* Adjust padding based on chatbot visibility */}
        {children}
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={message}
      />
      <Box
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          cursor: "pointer",
          borderRadius: "50%",
          backgroundColor: "#faf4cd",
          boxShadow: 2,
          padding: 1,
        }}
        onClick={() => setBotOpen((prev) => !prev)} 
      >
        <img
          src={botOpen ? '../../cancel.png' : '../../robot.png'} 
          alt={botOpen ? "Close Chatbot" : "Open Chatbot"}
          height={50}
          width={50}
        />
      </Box>
      {botOpen && <Chatbot open={botOpen} onClose={() => setBotOpen(false)} />}
    </Box>
  );
};

export default Layout;
