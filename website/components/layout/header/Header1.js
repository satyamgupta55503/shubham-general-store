"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { FaCalculator } from "react-icons/fa";
import { Button } from "@mui/material";
import GetQuoteDialog from "@/components/elements/GetQuoteDialog";

export default function Header1({
  scroll,
  isMobileMenu,
  handleMobileMenu,
  topBar,
  headerCls,
  logoWhite,
}) {
  const [openQuoteDialog, setOpenQuoteDialog] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.1, ease: "easeOut" },
    },
  };

  const topBarVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const burgerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  console.log(openQuoteDialog, "openQuoteDialog");

  return (
    <>
      <header
        className={`header ${headerCls ? headerCls : ""} sticky-bar ${
          scroll ? "stick" : ""
        }`}
      >
        <div
          className="container"
          style={{
            paddingBottom: "12px",
          }}
        >
          <motion.div
            className="main-header"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="header-left">
              <motion.div className="header-logo" variants={logoVariants}>
                <Link className="d-flex" href="/">
                  <img
                    alt="Nivia"
                    src={`/assets/imgs/template/${
                      logoWhite ? "logo" : "logo"
                    }.png`}
                    style={{
                      aspectRatio: "auto",
                      width: "100%",
                      maxWidth: "170px",
                    }}
                  />
                </Link>
              </motion.div>
              <motion.div className="header-nav" variants={containerVariants}>
                <nav className="nav-main-menu d-none d-xl-block">
                  <motion.ul className="main-menu" variants={containerVariants}>
                    <motion.li className="has-children" variants={itemVariants}>
                      <Link href="/about">About</Link>
                    </motion.li>
                    <motion.li className="has-children" variants={itemVariants}>
                      <Link href="/service">Services</Link>
                    </motion.li>
                    <motion.li className="has-children" variants={itemVariants}>
                      <Link href="/feature">Projects</Link>
                    </motion.li>
                    <motion.li className="has-children" variants={itemVariants}>
                      <Link href="/blog">Blog</Link>
                    </motion.li>
                    <motion.li className="has-children" variants={itemVariants}>
                      <Link href="/seo">Seo</Link>
                    </motion.li>
                    <motion.li className="has-children" variants={itemVariants}>
                      <Link href="/contact">Contact</Link>
                    </motion.li>
                  </motion.ul>
                </nav>
              </motion.div>
            </div>
            <motion.div className="header-right" variants={containerVariants}>
              <motion.div variants={itemVariants}>
                <Button
                  onClick={() => setOpenQuoteDialog(true)}
                  variant="contained"
                  startIcon={<FaCalculator />}
                  className="btn btn-brand-4-medium hover-up"
                  sx={{
                    backgroundColor: "#212B36",
                    color: "white",
                    textTransform: "none",
                  }}
                >
                  Get a Quote
                </Button>
              </motion.div>
              <motion.div
                className="burger-icon burger-icon-white"
                onClick={handleMobileMenu}
                variants={burgerVariants}
                initial="hidden"
                animate="visible"
              >
                <span className="burger-icon-top" />
                <span className="burger-icon-mid" />
                <span className="burger-icon-bottom" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </header>
      <GetQuoteDialog
        isOpen={openQuoteDialog}
        onClose={() => setOpenQuoteDialog(false)}
      />
    </>
  );
}
