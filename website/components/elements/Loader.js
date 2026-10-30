"use client";

import { motion } from "framer-motion";

export default function Loader() {
  // Animation for loader
  const loaderVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="d-flex justify-content-center align-items-center">
      <motion.img
        src="/assets/imgs/page/homepage1/loaderlogo.jpg" // Replace with your logo path
        alt="Logo"
        className="img-fluid"
        style={{ maxWidth: "150px" }} // Adjust size as needed
        variants={loaderVariants}
        animate="animate"
      />
    </div>
  );
}
