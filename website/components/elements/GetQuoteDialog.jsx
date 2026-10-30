import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Typography,
  Button,
  MenuItem,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";

const GetQuoteDialog = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    service: "",
    otherService: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    } else if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) {
      newErrors.name = "Name can only contain letters and spaces";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email.trim())
    ) {
      newErrors.email = "Invalid email address";
      isValid = false;
    }

    if (!/^\+91\d{10}$/.test(formData.contact.trim())) {
      newErrors.contact =
        "Enter a valid phone number (+91 followed by 10 digits)";
      isValid = false;
    }

    if (!formData.service) {
      newErrors.service = "Please select a service";
      isValid = false;
    }

    if (formData.service === "other" && !formData.otherService.trim()) {
      newErrors.otherService = "Please specify the other service";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setResponseMsg("");

    const formDataToSend = {
      ...formData,
      requirementDetails: formData.message,
    };

    try {
      const res = await fetch(
        "https://dks-backend-jg53.vercel.app/api/qoute/quote",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formDataToSend),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setResponseMsg("Quote submitted successfully!");

        onClose(); // Close the dialog
        setSnackbarOpen(true);
        setFormData({
          name: "",
          email: "",
          contact: "+91",
          service: "",
          otherService: "",
          message: "",
        });
      } else {
        setResponseMsg(data.message || "Submission failed");
        setSnackbarOpen(true);
      }
    } catch (error) {
      setResponseMsg("An error occurred. Please try again.");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.3 }}
        >
          <Box
            sx={{
              bgcolor: "white",
              p: 4,
              borderRadius: 2,
              boxShadow: 24,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              minWidth: "350px",
            }}
          >
            <DialogTitle sx={{ p: 0 }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", color: "#1F2937" }}
              >
                Request a Quote
              </Typography>
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
              <form
                onSubmit={handleSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {/* Name */}
                <div>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: "medium", color: "#4B5563", mb: 1 }}
                  >
                    Name
                  </Typography>
                  <TextField
                    fullWidth
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    required
                    variant="outlined"
                    size="small"
                    error={!!errors.name}
                    helperText={errors.name}
                    sx={fieldStyle}
                  />
                </div>

                {/* Email */}
                <div>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: "medium", color: "#4B5563", mb: 1 }}
                  >
                    Email
                  </Typography>
                  <TextField
                    fullWidth
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    required
                    variant="outlined"
                    size="small"
                    error={!!errors.email}
                    helperText={errors.email}
                    sx={fieldStyle}
                  />
                </div>

                {/* Phone */}
                <div>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: "medium", color: "#4B5563", mb: 1 }}
                  >
                    Phone
                  </Typography>
                  <TextField
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <Typography
                          variant="body2"
                          sx={{ mr: 1, color: "#4B5563" }}
                        >
                          +91
                        </Typography>
                      ),
                    }}
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    placeholder="+91 1234567890"
                    required
                    variant="outlined"
                    size="small"
                    error={!!errors.contact}
                    helperText={errors.contact}
                    sx={fieldStyle}
                    type="tel"
                  />
                </div>

                {/* Service */}
                <div>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: "medium", color: "#4B5563", mb: 1 }}
                  >
                    Select Service
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    size="small"
                    error={!!errors.service}
                    helperText={errors.service}
                    sx={fieldStyle}
                  >
                    <MenuItem value="">Select a service</MenuItem>
                    <MenuItem value="web-development">Web Development</MenuItem>
                    <MenuItem value="app-development">App Development</MenuItem>
                    <MenuItem value="design">Design</MenuItem>
                    <MenuItem value="marketing">Marketing</MenuItem>
                    <MenuItem value="strategy">Strategy</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </TextField>
                </div>

                {/* Other Service */}
                {formData.service === "other" && (
                  <div>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: "medium", color: "#4B5563", mb: 1 }}
                    >
                      Specify Other Service
                    </Typography>
                    <TextField
                      fullWidth
                      name="otherService"
                      value={formData.otherService}
                      onChange={handleInputChange}
                      placeholder="Please specify the service"
                      required
                      variant="outlined"
                      size="small"
                      error={!!errors.otherService}
                      helperText={errors.otherService}
                      sx={fieldStyle}
                    />
                  </div>
                )}

                {/* Message */}
                <div>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: "medium", color: "#4B5563", mb: 1 }}
                  >
                    Write your requirement
                  </Typography>
                  <TextField
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    fullWidth
                    multiline
                    placeholder="Describe your requirements..."
                    variant="outlined"
                    size="small"
                    sx={fieldStyle}
                  />
                </div>

                {/* Submit Actions */}
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
                >
                  <Button
                    variant="outlined"
                    onClick={onClose}
                    sx={{ px: 2, py: 1 }}
                    className="btn btn-brand-4-medium-outline hover-up m-2 d-flex align-items-center justify-content-center mx-2 w-100 w-md-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    type="submit"
                    sx={{ px: 2, py: 1 }}
                    disabled={loading}
                    className="btn btn-brand-4-medium hover-up m-2 d-flex align-items-center justify-content-center mx-2 w-100 w-md-auto"
                  >
                    {loading ? <CircularProgress size={20} /> : "Submit"}
                  </Button>
                </Box>
              </form>
            </DialogContent>
          </Box>
        </motion.div>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={
            responseMsg.toLowerCase().includes("success") ? "success" : "error"
          }
          sx={{ width: "100%" }}
        >
          {responseMsg}
        </Alert>
      </Snackbar>
    </>
  );
};

const fieldStyle = {
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#8ee013" },
    "&:hover fieldset": { borderColor: "#8ee013" },
    "&.Mui-focused fieldset": { borderColor: "#8ee013" },
  },
};

export default GetQuoteDialog;
