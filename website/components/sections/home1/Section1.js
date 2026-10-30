"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaCalculator, FaEye, FaPhone } from "react-icons/fa";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
} from "@mui/material";

// Import your axios instance (Update the path based on your folder structure)
import API from "@/utils/api"

// Popup Component using MUI Dialog
const BookCallPopup = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "+91",
    timeSlot: "",
    service: "",
    otherService: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    mobile: "",
    timeSlot: "",
    service: "",
    otherService: "",
    apiError: "",
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: "",
      mobile: "",
      timeSlot: "",
      service: "",
      otherService: "",
      apiError: "",
    };

    // Name validation: only letters and spaces, not empty
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    } else if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) {
      newErrors.name = "Name can only contain letters and spaces";
      isValid = false;
    }

    // Mobile validation: must start with +91 followed by 10 digits
    if (formData.mobile === "+91" || !formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
      isValid = false;
    } else if (!/^\+91\d{10}$/.test(formData.mobile.trim())) {
      newErrors.mobile =
        "Enter a valid mobile number (+91 followed by 10 digits)";
      isValid = false;
    }

    // Time slot validation: must be selected
    if (!formData.timeSlot) {
      newErrors.timeSlot = "Please select a time slot";
      isValid = false;
    }

    // Service validation: must be selected
    if (!formData.service) {
      newErrors.service = "Please select a service";
      isValid = false;
    }

    // Other service validation: required if service is "other"
    if (formData.service === "other" && !formData.otherService.trim()) {
      newErrors.otherService = "Please specify the service";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const mapTimeSlotToDateTime = (timeSlot) => {
    // Assuming bookings are for the next day (May 21, 2025)
    const baseDate = "2025-05-21";
    const timeMapping = {
      "9am-11am": `${baseDate}T09:00:00.000Z`,
      "11am-1pm": `${baseDate}T11:00:00.000Z`,
      "2pm-4pm": `${baseDate}T14:00:00.000Z`,
    };
    return timeMapping[timeSlot] || `${baseDate}T09:00:00.000Z`; // Default to 9am if invalid
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for the field being edited
    setErrors((prev) => ({ ...prev, [name]: "", apiError: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const payload = {
      name: formData.name.trim(),
      phone: formData.mobile.trim(),
      service:
        formData.service === "other"
          ? formData.otherService.trim()
          : formData.service,
      availableTime: mapTimeSlotToDateTime(formData.timeSlot),
    };

    try {
      const response = await fetch(
        "https://dks-backend-jg53.vercel.app/api/booking/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to submit booking");
      }

      console.log("Booking submitted successfully:", payload);
      onClose(); // Close popup after successful submission
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        apiError: "Failed to submit booking. Please try again.",
      }));
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="xl"
      fullWidth={true}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
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
          <DialogTitle id="dialog-title" sx={{ p: 0 }}>
            <Typography
              variant="h5"
              component="h2"
              sx={{ fontWeight: "bold", color: "#1F2937" }}
            >
              Book a Free Call
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            {errors.apiError && (
              <Typography variant="body2" sx={{ color: "#D32F2F", mb: 2 }}>
                {errors.apiError}
              </Typography>
            )}
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "medium", color: "#4B5563", mb: 1 }}
                >
                  Name
                </Typography>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  required
                  variant="outlined"
                  size="small"
                  error={!!errors.name}
                  helperText={errors.name}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#8ee013" },
                      "&:hover fieldset": { borderColor: "#8ee013" },
                      "&.Mui-focused fieldset": { borderColor: "#8ee013" },
                    },
                  }}
                />
              </div>
              <div>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "medium", color: "#4B5563", mb: 1 }}
                >
                  Mobile Number
                </Typography>
                <TextField
                  fullWidth
                  id="mobile"
                  name="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="+91 1234567890"
                  required
                  variant="outlined"
                  size="small"
                  error={!!errors.mobile}
                  helperText={errors.mobile}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#8ee013" },
                      "&:hover fieldset": { borderColor: "#8ee013" },
                      "&.Mui-focused fieldset": { borderColor: "#8ee013" },
                    },
                  }}
                />
              </div>
              <div>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: "medium", color: "#4B5563", mb: 1 }}
                >
                  Preferred Time Slot
                </Typography>
                <TextField
                  select
                  fullWidth
                  id="timeSlot"
                  name="timeSlot"
                  value={formData.timeSlot}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  size="small"
                  error={!!errors.timeSlot}
                  helperText={errors.timeSlot}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#8ee013" },
                      "&:hover fieldset": { borderColor: "#8ee013" },
                      "&.Mui-focused fieldset": { borderColor: "#8ee013" },
                    },
                  }}
                >
                  <MenuItem value="">Select a time slot</MenuItem>
                  <MenuItem value="9am-11am">9:00 AM - 11:00 AM</MenuItem>
                  <MenuItem value="11am-1pm">11:00 AM - 1:00 PM</MenuItem>
                  <MenuItem value="2pm-4pm">2:00 PM - 4:00 PM</MenuItem>
                </TextField>
              </div>
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
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  size="small"
                  error={!!errors.service}
                  helperText={errors.service}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "#8ee013" },
                      "&:hover fieldset": { borderColor: "#8ee013" },
                      "&.Mui-focused fieldset": { borderColor: "#8ee013" },
                    },
                  }}
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
                    id="otherService"
                    name="otherService"
                    type="text"
                    value={formData.otherService}
                    onChange={handleInputChange}
                    placeholder="Please specify the service"
                    required
                    variant="outlined"
                    size="small"
                    error={!!errors.otherService}
                    helperText={errors.otherService}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#8ee013" },
                        "&:hover fieldset": { borderColor: "#8ee013" },
                        "&.Mui-focused fieldset": { borderColor: "#8ee013" },
                      },
                    }}
                  />
                </div>
              )}
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={onClose}
                  className="btn btn-brand-4-medium-outline hover-up m-2 d-flex align-items-center justify-content-center mx-2 w-100 w-md-auto"
                  sx={{
                    px: 2,
                    py: 1,
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  className="btn btn-brand-4-medium hover-up m-2 d-flex align-items-center justify-content-center mx-2 w-100 w-md-auto"
                  sx={{
                    px: 2,
                    py: 1,
                  }}
                >
                  Submit
                </Button>
              </Box>
            </form>
          </DialogContent>
        </Box>
      </motion.div>
    </Dialog>
  );
};

export default function Section1() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Fallback defaults to ensure no UI layout shift before the API call finishes.
  const [heroData, setHeroData] = useState({
    heading: "We Don’t Just Build Websites. We Build Digital Businesses.",
    description:
      "Every Big Brand Begins with a Bold Idea. We bring that idea to life with powerful solutions — from websites and apps to design, strategy, and marketing. Empowering your growth while building a brand.",
    image: "https://res.cloudinary.com/drpyepp9t/image/upload/v1773731335/dkswebsite_qlphft.png",
    buttons: {
      seeOurWork: {
        text: "See Our Work",
        link: "/feature",
      },
      bookCall: {
        text: "Book a Free Call",
      },
    },
  });

  // Fetch Homepage Data
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const { data } = await API.get("/pages/homepage");
        if (data.success && data.data.hero) {
          const apiHero = data.data.hero;
          setHeroData((prev) => ({
            ...prev,
            heading: apiHero.heading || prev.heading,
            description: apiHero.description || prev.description,
            image: apiHero.image || prev.image,
            buttons: {
              seeOurWork: {
                text: apiHero.buttons?.seeOurWork?.text || prev.buttons.seeOurWork.text,
                link: apiHero.buttons?.seeOurWork?.link || prev.buttons.seeOurWork.link,
              },
              bookCall: {
                text: apiHero.buttons?.bookCall?.text || prev.buttons.bookCall.text,
              },
            },
          }));
        }
      } catch (error) {
        console.error("Failed to fetch hero data", error);
      }
    };

    fetchHeroData();
  }, []);

  // Animation variants for the container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  // Animation variants for text and buttons
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  // Animation variants for author images
  const authorVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  // Animation for blur background
  const blurVariants = {
    animate: {
      x: [0, 20, -20, 0],
      y: [0, -15, 15, 0],
      transition: {
        repeat: Infinity,
        duration: 10,
        ease: "easeInOut",
      },
    },
  };

  // Animation for img-bg
  const bgVariants = {
    hidden: { opacity: 0, scale: 1.1 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 1.2, ease: "easeOut" },
    },
  };

  return (
    <>
      <section className="section-box">
        <div className="banner-hero hero-5 mb-hero">
          <div className="banner-image-main">
            <motion.div
              className="img-bg"
              variants={bgVariants}
              initial="hidden"
              animate="visible"
              style={{
                backgroundImage: `url('${heroData.image}')`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "bottom right",
                backgroundSize: "contain",
                transformOrigin: "bottom right",
                willChange: "transform",
              }}
            />
            <motion.div
              className="blur-bg blur-move"
              variants={blurVariants}
              animate="animate"
            />
          </div>
          {/* make a div */}
          <motion.div
            className="banner-inner-top"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div
              className="container"
              style={
                {
                  // margin: 0,
                }
              }
            >
              <div className="box-banner-left">
                <motion.h1
                  className="display-2 mb-30 neutral-0"
                  variants={itemVariants}
                >
                  {heroData.heading}
                </motion.h1>
                <motion.p
                  className="text-lg neutral-500 mb-55 "
                  style={{ opacity: 1, color: "#fff" }}
                  variants={itemVariants}
                >
                  {heroData.description}
                </motion.p>
                <motion.div
                  className="d-flex mb-5 flex-column align-items-center flex-md-row align-items-md-start"
                  variants={containerVariants}
                >
                  <motion.div
                    className="d-none d-md-flex"
                    variants={itemVariants}
                  >
                    <Link
                      className="btn btn-brand-4-medium hover-up m-2 d-flex align-items-center justify-content-center mx-2 w-100 w-md-auto"
                      href={heroData.buttons.seeOurWork.link}
                    >
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="d-flex justify-content-center align-items-center mx-2 text-nowrap text-wrap-md"
                      >
                        <FaEye className="text-lg mx-2 justify-content-center align-items-center" />
                        {heroData.buttons.seeOurWork.text}
                      </motion.span>
                    </Link>
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <button
                      onClick={() => setIsPopupOpen(true)}
                      className="btn btn-brand-4-medium hover-up m-2 d-flex align-items-center justify-content-center mx-2 w-100 w-md-auto"
                    >
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="d-flex justify-content-center align-items-center mx-2 text-nowrap text-wrap-md"
                      >
                        <FaPhone className="text-lg mx-2 justify-content-center align-items-center" />
                        {heroData.buttons.bookCall.text}
                      </motion.span>
                    </button>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="banner-inner-bottom"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="container">
              <div className="box-joined">
                <motion.div
                  className="box-authors"
                  variants={containerVariants}
                >
                  {[
                    "/assets/imgs/page/homepage1/author.png",
                    "/assets/imgs/page/homepage1/author2.png",
                    "/assets/imgs/page/homepage1/author3.png",
                  ].map((src, index) => (
                    <motion.span
                      key={index}
                      className="item-author"
                      variants={authorVariants}
                    >
                      <img src={src} alt="Nivia" />
                    </motion.span>
                  ))}
                  <motion.span
                    className="item-author"
                    variants={authorVariants}
                  >
                    <span className="text-num-author text-md-bold color-brand-2">
                      +2k
                    </span>
                  </motion.span>
                </motion.div>
                <motion.span
                  className="text-lg d-inline-block"
                  variants={itemVariants}
                >
                  Trusted by thousands of clients
                  <br className="d-none d-md-block" />
                  all around the world.
                </motion.span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      <BookCallPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </>
  );
}