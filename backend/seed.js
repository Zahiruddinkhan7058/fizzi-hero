require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("./models/Product");

const products = [
  {
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
    name: "Fanta Orange",
    flavor: "Orange Burst",
    description: "Bright, bubbly, and wildly fruity sparkling soda with vibrant natural orange notes and refreshing carbonation.",
    price: 40,
    category: "Carbonated Soda",
    image: "/product-images/fanta.jpg",
    images: ["/product-images/fanta.jpg", "/product-images/fanta-grape.jpg"],
    stock: 180,
    isAvailable: true,
    isFeatured: true,
    rating: 4.8,
    totalReviews: 310
  },
  {
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
    name: "Fanta Grape Goodness",
    flavor: "Grape Blast",
    description: "Deliciously sweet purple grape sparkling soda bursting with fizzy fruit goodness in every sip.",
    price: 45,
    category: "Carbonated Soda",
    image: "/product-images/fanta-grape.jpg",
    images: ["/product-images/fanta-grape.jpg"],
    stock: 100,
    isAvailable: true,
    isFeatured: false,
    rating: 4.7,
    totalReviews: 105
  },
  {
    name: "Fizzi Raspberry Fizz",
    flavor: "Raspberry",
    description: "Tangy sweet raspberry sparkling soda with a lively fruit punch sensation.",
    price: 99,
    category: "Sparkling Soda",
    image: "/labels/watermelon.png",
    images: ["/labels/watermelon.png"],
    stock: 85,
    isAvailable: true,
    isFeatured: false,
    rating: 4.6,
    totalReviews: 78
  },
  {
    name: "Fizzi Berry Mix",
    flavor: "Mixed Berry",
    description: "A rich combination of ripe wild berries and refreshing sparkling soda.",
    price: 109,
    category: "Sparkling Soda",
    image: "/labels/strawberry.png",
    images: ["/labels/strawberry.png"],
    stock: 75,
    isAvailable: true,
    isFeatured: false,
    rating: 4.7,
    totalReviews: 82
  },
  {
    name: "Fizzi Peach Punch",
    flavor: "Peach",
    description: "Juicy golden peach flavor with crisp sparkling bubbles and a velvety finish.",
    price: 109,
    category: "Sparkling Soda",
    image: "/labels/cherry.png",
    images: ["/labels/cherry.png"],
    stock: 80,
    isAvailable: true,
    isFeatured: false,
    rating: 4.6,
    totalReviews: 64
  },
  {
    name: "Fizzi Tropical Punch",
    flavor: "Tropical",
    description: "An exotic blend of passionfruit, pineapple, and citrus sparkling soda.",
    price: 119,
    category: "Sparkling Soda",
    image: "/labels/lemon-lime.png",
    images: ["/labels/lemon-lime.png"],
    stock: 70,
    isAvailable: true,
    isFeatured: false,
    rating: 4.8,
    totalReviews: 92
  },
  {
    name: "Fizzi Cherry Vanilla",
    flavor: "Cherry Vanilla",
    description: "Velvety smooth vanilla infused with bold wild black cherries and refreshing fizz.",
    price: 109,
    category: "Sparkling Soda",
    image: "/labels/cherry.png",
    images: ["/labels/cherry.png"],
    stock: 85,
    isAvailable: true,
    isFeatured: false,
    rating: 4.8,
    totalReviews: 115
  }
];

const MONGO_URL =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  process.env.DATABASE_URL ||
  process.env.DB_URL;

async function seedProducts() {
  try {
    if (!MONGO_URL) {
      console.error("❌ MongoDB URL not found in .env");
      process.exit(1);
    }

    await mongoose.connect(MONGO_URL);
    console.log("🍃 MongoDB connected");

    for (const p of products) {
      await Product.findOneAndUpdate(
        { name: p.name },
        { $set: p },
        { upsert: true, new: true }
      );
    }

    console.log(`✅ ${products.length} products seeded successfully with verified local images`);
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
}

seedProducts();