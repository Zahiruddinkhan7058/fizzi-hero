const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("../models/Product");

dotenv.config();

const products = [
  {
    _id: "6a9426177ba1bfc22cb977d5",
    name: "HELL Energy Classic",
    flavor: "Classic Tutti-Frutti",
    description: "Classic HELL energy drink packed with 32 mg/100 ml caffeine, B-group vitamins, and crisp refreshing carbonation.",
    price: 110,
    category: "Energy Drink",
    image: "/product-images/hell-energy.jpg",
    images: ["/product-images/hell-energy.jpg"],
    stock: 120,
    isAvailable: true,
    isFeatured: true,
    rating: 4.9,
    totalReviews: 184
  },
  {
    _id: "6a9426177ba1bfc22cb977d8",
    name: "STING Energy Drink",
    flavor: "Red Rush",
    description: "Electrifying burst of energy with bold strawberry sweetness, caffeine kick, and invigorating ginseng flavor.",
    price: 50,
    category: "Energy Drink",
    image: "/product-images/sting-energy.jpg",
    images: ["/product-images/sting-energy.jpg"],
    stock: 200,
    isAvailable: true,
    isFeatured: true,
    rating: 4.8,
    totalReviews: 240
  },
  {
    _id: "6a9426177ba1bfc22cb977db",
    name: "Predator Energy Gold Strike",
    flavor: "Gold Strike",
    description: "Fierce refreshment with an intense, crisp kick designed to unleash your inner predator and conquer the day.",
    price: 50,
    category: "Energy Drink",
    image: "/product-images/predator-energy.jpg",
    images: ["/product-images/predator-energy.jpg"],
    stock: 140,
    isAvailable: true,
    isFeatured: true,
    rating: 4.7,
    totalReviews: 95
  },
  {
    _id: "6a9426177ba1bfc22cb977df",
    name: "Gorilla Energy Drink",
    flavor: "Original Power",
    description: "High-voltage energy beverage enriched with taurine, L-carnitine, and an explosive citrus punch.",
    price: 120,
    category: "Energy Drink",
    image: "/product-images/gorilla-energy.jpg",
    images: ["/product-images/gorilla-energy.jpg"],
    stock: 90,
    isAvailable: true,
    isFeatured: true,
    rating: 4.7,
    totalReviews: 110
  },
  {
    _id: "6a9426177ba1bfc22cb977e1",
    name: "Coca-Cola Original Taste",
    flavor: "Classic Cola",
    description: "The timeless, deliciously uplifting sparkling refreshment enjoyed ice-cold all around the world.",
    price: 40,
    category: "Carbonated Soda",
    image: "/product-images/coca-cola.jpg",
    images: ["/product-images/coca-cola.jpg"],
    stock: 250,
    isAvailable: true,
    isFeatured: true,
    rating: 5.0,
    totalReviews: 520
  },
  {
    _id: "6a9426177ba1bfc22cb977da",
    name: "Fanta Orange",
    flavor: "Orange Burst",
    description: "Bright, bubbly, and wildly fruity sparkling soda with vibrant natural orange notes and refreshing carbonation.",
    price: 40,
    category: "Carbonated Soda",
    image: "/product-images/fanta.jpg",
    images: [
      "/product-images/fanta.jpg",
      "/product-images/fanta-grape.jpg",
      "/product-images/fanta-strawberry.jpg"
    ],
    stock: 180,
    isAvailable: true,
    isFeatured: true,
    rating: 4.8,
    totalReviews: 310
  },
  {
    _id: "6a9426177ba1bfc22cb977dc",
    name: "Red Bull Energy Drink",
    flavor: "Classic Energy",
    description: "Vitalizes body and mind. Appreciated worldwide by top athletes, busy professionals, and college students.",
    price: 125,
    category: "Energy Drink",
    image: "/product-images/red-bull.jpg",
    images: ["/product-images/red-bull.jpg"],
    stock: 150,
    isAvailable: true,
    isFeatured: true,
    rating: 4.9,
    totalReviews: 430
  },
  {
    _id: "6a9426177ba1bfc22cb977d9",
    name: "Monster Energy Original",
    flavor: "Original Green",
    description: "Tear into a can of the meanest energy drink on the planet. Unleash the Beast with smooth monster flavor.",
    price: 125,
    category: "Energy Drink",
    image: "/product-images/monster-energy.jpg",
    images: ["/product-images/monster-energy.jpg"],
    stock: 160,
    isAvailable: true,
    isFeatured: true,
    rating: 4.9,
    totalReviews: 380
  },
  {
    _id: "6a9426177ba1bfc22cb977d7",
    name: "Sprite Lemon-Lime",
    flavor: "Crisp Lemon-Lime",
    description: "Crisp, clean, thirst-quenching lemon and lime sparkling soda that hits the spot with refreshing bubbles.",
    price: 40,
    category: "Carbonated Soda",
    image: "/product-images/sprite.jpg",
    images: ["/product-images/sprite.jpg"],
    stock: 220,
    isAvailable: true,
    isFeatured: true,
    rating: 4.8,
    totalReviews: 290
  },
  {
    _id: "6a9426177ba1bfc22cb977d6",
    name: "Fanta Grape Goodness",
    flavor: "Grape Blast",
    description: "Deliciously sweet purple grape sparkling soda bursting with fizzy fruit goodness in every sip.",
    price: 45,
    category: "Carbonated Soda",
    image: "/product-images/fanta-grape.jpg",
    images: [
      "/product-images/fanta-grape.jpg",
      "/product-images/fanta-grape-ice.jpg"
    ],
    stock: 100,
    isAvailable: true,
    isFeatured: false,
    rating: 4.7,
    totalReviews: 105
  },
  {
    _id: "6a9426177ba1bfc22cb977de",
    name: "ZR Fresh Raspberry Fizz",
    flavor: "Wild Raspberry",
    description: "Intensely refreshing raspberry sparkling drink with explosive fruit flavor, ice-cold chill, and vibrant pink splash.",
    price: 99,
    category: "Sparkling Soda",
    image: "/product-images/zr-fresh.jpg",
    images: ["/product-images/zr-fresh.jpg"],
    stock: 110,
    isAvailable: true,
    isFeatured: true,
    rating: 4.9,
    totalReviews: 142
  },
  {
    _id: "6a9426177ba1bfc22cb977e0",
    name: "Double Seven Energy Drink",
    flavor: "Cool Rush 77",
    description: "High-octane Double Seven energy drink served on crushed ice with taurine, vitamin complex, and a smooth refreshing punch.",
    price: 95,
    category: "Energy Drink",
    image: "/product-images/double-seven.jpg",
    images: ["/product-images/double-seven.jpg"],
    stock: 130,
    isAvailable: true,
    isFeatured: true,
    rating: 4.8,
    totalReviews: 165
  },
  {
    _id: "6a9426177ba1bfc22cb977dd",
    name: "Appy FIZZ Sparkling Apple",
    flavor: "Crisp Sparkling Apple",
    description: "The cool drink to hang out with! Bubbly, rich apple juice blended with crisp carbonation for an unforgettable crisp fizz.",
    price: 45,
    category: "Sparkling Soda",
    image: "/product-images/appy-fizz.jpg",
    images: ["/product-images/appy-fizz.jpg"],
    stock: 220,
    isAvailable: true,
    isFeatured: true,
    rating: 4.9,
    totalReviews: 310
  },
  {
    _id: "6a9426177ba1bfc22cb977e2",
    name: "Power Horse Energy Drink",
    flavor: "Ice Frost Edition",
    description: "Sub-zero glacial energy power! Premium Power Horse energy drink chilled in deep snow with invigorating taurine and caffeine.",
    price: 115,
    category: "Energy Drink",
    image: "/product-images/power-horse.jpg",
    images: ["/product-images/power-horse.jpg"],
    stock: 95,
    isAvailable: true,
    isFeatured: true,
    rating: 4.9,
    totalReviews: 215
  },
  {
    _id: "6a9426177ba1bfc22cb977e3",
    name: "JERK Energy Drink",
    flavor: "Blazing Citrus Fire",
    description: "Ignite your senses! Natural plant-based caffeine, taurine, and fiery citrus kick brewed for relentless stamina and drive.",
    price: 110,
    category: "Energy Drink",
    image: "/product-images/jerk-energy.jpg",
    images: ["/product-images/jerk-energy.jpg"],
    stock: 105,
    isAvailable: true,
    isFeatured: true,
    rating: 4.8,
    totalReviews: 128
  },
  {
    _id: "6a9426177ba1bfc22cb977e4",
    name: "IZEM Energy Drink",
    flavor: "Electric Green Citrus",
    description: "Unleash the lightning roar! Premium IZEM energy drink by ifri packed with natural caffeine, B-vitamins, and electrifying green citrus punch.",
    price: 120,
    category: "Energy Drink",
    image: "/product-images/izem-energy.jpg",
    images: ["/product-images/izem-energy.jpg"],
    stock: 125,
    isAvailable: true,
    isFeatured: true,
    rating: 4.8,
    totalReviews: 94
  }
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log("MongoDB connected");

    for (const p of products) {
      await Product.findOneAndUpdate(
        { name: p.name },
        { $set: p },
        { upsert: true, new: true }
      );
    }

    console.log(`Successfully seeded ${products.length} products with local images`);
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedProducts();
}

module.exports = products;