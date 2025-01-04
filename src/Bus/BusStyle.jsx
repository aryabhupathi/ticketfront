import { Accordion, Box, Button, Typography } from "@mui/material";
import Grid from '@mui/material/Grid2'
import { styled } from "@mui/system";
const colors = {
  primary: "#2196f3",
  secondary: "#76ff03",
  accent: "#4db6ac",
  error: "#f50057",
  background: "#f4f4f4",
  border: "#bdbdbd",
  textPrimary: "#3f51b5",
  textSecondary: "#fafafa",
  reserved: "#bdbdbd",
};
export const FilterSection = styled(Grid)({
  display: "flex",
  flexDirection: "column",
  padding: "16px",
  backgroundColor: colors.background,
  borderRadius: "8px",
  marginBottom: "16px",
});
export const FilterBox = styled(Box)({
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
});
export const FilterButton = styled(Button)({
  backgroundColor: colors.accent,
  color: "white",
  "&:hover": {
    backgroundColor: "#009688",
  },
});
export const MainTitle = styled(Typography)({
  background: "linear-gradient(to right, black, red, black)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  textAlign: "center",
});
export const FilterTitle = styled(Typography)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  cursor: "pointer",
});
export const BusName = styled(Typography)({
  
  textAlign: "center",
  display: "inline-flex",
  alignItems: "center",
  color: "#1E3A8A", fontWeight: "bold"
});
export const BusRoute = styled(Typography)({
  color:'#6B7280',
  textAlign: "center",
  display: "inline-flex",
  alignItems: "center",
});
export const BusFare = styled(Typography)({
  color: "#F97316",
  textAlign: "center",
  display: "inline-flex",
  alignItems: "center",
  fontWeight:'bold'
});
export const SummaryBox = styled(Box)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  width: "100%",
  gap: "24px",
});
export const IconGap = styled("span")({
  color: '#F43F5E',
  marginLeft: "8px",
});
export const BusTime = styled(Typography)({
  color: "#374151",
  marginBottom: "8px",
});
export const BusStop = styled(Typography)({
  color: "#374151",
  marginBottom: "8px",
});
export const BusSeat = styled(Typography)({
  color: "#059669",
  marginBottom: "8px",
});
export const AvailableBox = styled(Box)({
  width: "16px",
  height: "16px",
  backgroundColor: colors.primary,
  borderRadius: "50%",
});
export const AvailableText = styled(Typography)({
  color: colors.primary,
  fontSize: "14px",
});
export const ReservedBox = styled(Box)({
  width: "16px",
  height: "16px",
  backgroundColor: colors.reserved,
  borderRadius: "50%",
});
export const ReservedText = styled(Typography)({
  color: colors.reserved,
  fontSize: "14px",
});
export const SelectedBox = styled(Box)({
  width: "16px",
  height: "16px",
  backgroundColor: colors.secondary,
  borderRadius: "50%",
});
export const SelectedText = styled(Typography)({
  color: colors.secondary,
  fontSize: "14px",
});
export const LegendGroup = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "4px",
});
export const LegendBox = styled(Box)({
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  alignItems: "center",
  marginTop: "16px",
  gap: "8px",
  maxWidth: "100%",
});
export const FareTotal = styled(Typography)({
  color: "#F43F5E", fontWeight: "bold",
  marginTop: "16px",
  textAlign: "right",
});
export const DetailBox = styled(Box)({
  backgroundColor: colors.textSecondary,
  padding: "16px",
  borderRadius: "16px",
});
export const BookBox = styled(Box)({
  display: "flex",
  justifyContent: "center",
  marginTop: "8px",
});
export const ErrorText = styled(Typography)({
  marginTop: "24px",
  textAlign: "center",
  color: colors.error,
});
export const ConfirmBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "#ffffff",
  boxShadow: 24,
  padding: theme.spacing(2, 4),
  width: "400px",
  maxWidth: "90%",
  borderRadius: "16px",
  border: `2px dashed ${colors.border}`,
  overflow: "hidden",
  [theme.breakpoints.down("sm")]: {
    width: "75%",
  },
}));
export const ConfirmHead = styled(Typography)({
  fontWeight: "bold",
  color: colors.textPrimary,
  textAlign: "center",
});
export const ConfirmButtons = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  marginTop: "16px",
  borderTop: `2px dashed ${colors.border}`,
  paddingTop: "16px",
});
export const ConfirmDetails = styled(Box)({
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  padding: "16px",
  marginBottom: "16px",
  backgroundColor: "#fafafa",
});
export const NewAccordion = styled(Accordion)({
  overflow: "hidden",  
  backgroundColor: "rgba(255, 255, 255, 0.9)", // Sub-accordion background
  borderRadius: "4px",
  boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
  marginBottom: "8px",
});
export const MainAccordion = styled(Grid)({

  background:
  "linear-gradient(90deg, rgba(59, 130, 246, 0.6) 0%, rgba(139, 92, 246, 0.6) 100%)",
borderRadius: "8px",
boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
marginBottom: "16px",
padding:'16px'
});


export const ConfirmHeadRound = styled(Typography)({
  fontWeight: "bold",
  color: colors.textPrimary,
  textAlign: "center",
});
export const ConfirmBoxRound = styled(Box)({
  borderBottom: "2px dashed #9e9e9e",
  paddingBottom: "16px",
  marginBottom: "16px",
});
export const LegendButton = styled(Button)({
  
  color: "#3B82F6", // Blue button text
  fontWeight: "bold",
  textTransform: "none",
})