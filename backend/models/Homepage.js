const mongoose = require("mongoose");

const HomepageSchema = new mongoose.Schema(
  {
    pageName: { type: String, default: "Homepage", unique: true },

    // HERO SECTION
    hero: {
      heading: { type: String },
      description: { type: String },
      image: { type: String }, // Image URL
      buttons: {
        seeOurWork: {
          text: { type: String, default: "See our Work" },
          link: { type: String, default: "/projects" },
        },
        bookCall: {
          text: { type: String, default: "Book a free call" },
        },
      },
      companyLogos: [{ type: String }], // Array of image URLs/icons
    },

    // VIDEO SECTION
    videoSection: {
      heading: { type: String },
      description: { type: String },
      videoLink: { type: String }, // YouTube/Vimeo/Cloudinary URL
    },

    // SERVICES SECTION
    servicesSection: {
      heading: { type: String },
      description: { type: String },
      cards: [
        {
          heading: { type: String },
          description: { type: String },
          icon: { type: String }, // Optional: Lucide icon name or URL
        },
      ],
    },

    // PROJECT SECTION
    projectSection: {
      heading: { type: String },
      projects: [
        {
          image: { type: String },
          category: { type: String },
          icon: { type: String }, // Category icon identifier
        },
      ],
    },

    // STATS SECTION (Ab yeh dynamic card array ban gaya hai)
    statsSection: {
      heading: { type: String }, // Optional heading for stats section
      cards: [
        {
          label: { type: String }, // e.g., "Happy Clients", "Projects Done"
          value: { type: Number, default: 0 }, // e.g., 1200, 50
          icon: { type: String }, // Optional icon for the stat card
        },
      ],
    },

    // TESTIMONIALS SECTION
    testimonials: [
      {
        quote: { type: String },
        clientName: { type: String },
        designation: { type: String },
        photo: { type: String },
        ratings: { type: Number },
      },
    ],

    // FAQ SECTION
    faqs: [
      {
        question: { type: String },
        answer: { type: String },
      },
    ],

    // FOOTER SECTION
    footer: {
      logo: { type: String },
      address: { type: String },
      operatingHours: { type: String }, // e.g., "9 AM - 6 PM, Mon - Sat"
      socialMedia: [
        {
          platform: { type: String }, // e.g., "LinkedIn", "Twitter", "Instagram"
          link: { type: String }, // e.g., "https://linkedin.com/..."
          icon: { type: String }, // Optional: Icon class, lucide name, or URL
        },
      ],
      // Quick Links groups
      aboutPages: [
        {
          label: { type: String },
          link: { type: String },
        },
      ],
      services: [
        {
          label: { type: String },
          link: { type: String },
        },
      ],
      resources: [
        {
          label: { type: String },
          link: { type: String },
        },
      ],
      support: [
        {
          label: { type: String },
          link: { type: String },
        },
      ],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("homePage", HomepageSchema);
