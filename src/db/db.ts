import fs from "fs";
import path from "path";
import crypto from "crypto";
import { MongoClient, Db } from "mongodb";
import { fileURLToPath } from "url";

// Get standard directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(process.cwd(), "data.json");

// Helper to hash password (matches original backend hash technique)
export function hashPassword(password: string): string {
  return crypto.createHmac("sha256", "agri-salt").update(password).digest("hex");
}

// Model Interfaces
export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "Produce" | "Seeds" | "Fertilizers" | "Tools" | "Equipment";
  stock: number;
  image: string;
  unit: string;
  farmerId: string;
  farmerName: string;
  rating: number;
  reviewsCount: number;
  reviews: Review[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "buyer" | "farmer";
  balance: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: "Pending" | "Shipped" | "Delivered" | "Cancelled";
  shippingAddress: string;
  paymentMethod: string;
  createdAt: string;
}

export interface DB {
  users: User[];
  products: Product[];
  carts: Cart[];
  orders: Order[];
}

// Seed Data
export const defaultProducts: Product[] = [
  {
    id: "p1",
    name: "Fresh Organic Heirloom Tomatoes",
    description: "Plump, sun-ripened organic heirloom tomatoes grown without synthetic pesticides. Sweet, rich flavor, harvested daily.",
    price: 80.0,
    category: "Produce",
    stock: 120,
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80",
    unit: "kg",
    farmerId: "f1",
    farmerName: "Green Valley Farms",
    rating: 4.8,
    reviewsCount: 12,
    reviews: [
      { id: "r1", userName: "Alice Johnson", rating: 5, comment: "Incredibly sweet and fresh! Will order weekly.", createdAt: "2026-06-28" },
      { id: "r2", userName: "Bob Miller", rating: 4, comment: "Very good tomato quality, arrived in great condition.", createdAt: "2026-06-30" }
    ]
  },
  {
    id: "p2",
    name: "Premium High-Yield Wheat Seeds",
    description: "Certified disease-resistant, high-germination wheat seeds optimized for multi-climate performance and robust yields.",
    price: 1250.0,
    category: "Seeds",
    stock: 50,
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80",
    unit: "bag (10kg)",
    farmerId: "f1",
    farmerName: "Green Valley Farms",
    rating: 4.5,
    reviewsCount: 5,
    reviews: [
      { id: "r3", userName: "David Vance", rating: 5, comment: "High germination rate, excellent sprouts within days.", createdAt: "2026-07-01" }
    ]
  },
  {
    id: "p3",
    name: "Bio-Organic Compost Fertilizer",
    description: "100% decomposed organic matter enriched with beneficial microbes to restore soil health, aeration, and vital nutrients.",
    price: 450.0,
    category: "Fertilizers",
    stock: 200,
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80",
    unit: "bag (5kg)",
    farmerId: "f2",
    farmerName: "Sunny Acres Nursery",
    rating: 4.7,
    reviewsCount: 8,
    reviews: [
      { id: "r4", userName: "Emma Stone", rating: 5, comment: "My vegetable garden has exploded in growth! Amazing product.", createdAt: "2026-06-15" }
    ]
  },
  {
    id: "p4",
    name: "Heavy-Duty Carbon Steel Garden Spade",
    description: "Ergonomic rust-resistant heavy-duty garden spade built with fiberglass shaft and comfortable non-slip D-grip handle.",
    price: 950.0,
    category: "Tools",
    stock: 35,
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80",
    unit: "unit",
    farmerId: "f2",
    farmerName: "Sunny Acres Nursery",
    rating: 4.9,
    reviewsCount: 15,
    reviews: [
      { id: "r5", userName: "John Doe", rating: 5, comment: "Indestructible tool. Cleaved through clay soil like butter.", createdAt: "2026-06-20" }
    ]
  },
  {
    id: "p5",
    name: "Automated Drip Irrigation Kit",
    description: "Easy-to-install water-saving drip irrigation network with adjustable nozzle emitters and automatic timers for 50 plants.",
    price: 3500.0,
    category: "Equipment",
    stock: 15,
    image: "https://images.unsplash.com/photo-1463121859909-073be64120f8?auto=format&fit=crop&w=600&q=80",
    unit: "set",
    farmerId: "f1",
    farmerName: "Green Valley Farms",
    rating: 4.2,
    reviewsCount: 6,
    reviews: [
      { id: "r6", userName: "Carlos Santana", rating: 4, comment: "Saves a lot of water and time. Timer programming takes some learning.", createdAt: "2026-06-25" }
    ]
  },
  {
    id: "p6",
    name: "Organic Sweet Fuji Apples",
    description: "Crunchy and exceptionally sweet organic Fuji apples hand-picked in local orchards. Unwaxed and 100% natural.",
    price: 180.0,
    category: "Produce",
    stock: 150,
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80",
    unit: "kg",
    farmerId: "f1",
    farmerName: "Green Valley Farms",
    rating: 4.6,
    reviewsCount: 10,
    reviews: []
  },
  {
    id: "p7",
    name: "F1 Hybrid Sweet Corn Seeds",
    description: "Sweet corn seed kernels with 95%+ germination rate. Produces golden, sweet, and uniform ears perfect for fresh boiling.",
    price: 350.0,
    category: "Seeds",
    stock: 80,
    image: "https://images.unsplash.com/photo-1595971291494-012022d4503b?auto=format&fit=crop&w=600&q=80",
    unit: "pack (500g)",
    farmerId: "f2",
    farmerName: "Sunny Acres Nursery",
    rating: 4.4,
    reviewsCount: 4,
    reviews: []
  },
  {
    id: "p8",
    name: "NPK 19-19-19 Premium Plant Nutrient",
    description: "Water-soluble balanced nitrogen, phosphorus, and potassium supplement for professional foliage, root, and flowering booster.",
    price: 550.0,
    category: "Fertilizers",
    stock: 90,
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80",
    unit: "kg",
    farmerId: "f2",
    farmerName: "Sunny Acres Nursery",
    rating: 4.7,
    reviewsCount: 7,
    reviews: []
  }
];

export const defaultUsers: User[] = [
  {
    id: "f1",
    name: "Green Valley Farms",
    email: "farmer1@agri.com",
    passwordHash: hashPassword("password123"),
    role: "farmer",
    balance: 15000.0
  },
  {
    id: "f2",
    name: "Sunny Acres Nursery",
    email: "farmer2@agri.com",
    passwordHash: hashPassword("password123"),
    role: "farmer",
    balance: 12000.0
  },
  {
    id: "b1",
    name: "John Buyer",
    email: "buyer@agri.com",
    passwordHash: hashPassword("password123"),
    role: "buyer",
    balance: 5000.0
  }
];

// In-Memory fallback DB
let localDb: DB = {
  users: [...defaultUsers],
  products: [...defaultProducts],
  carts: [],
  orders: []
};

// JSON helper functions
function loadLocalDatabase() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      localDb = JSON.parse(data);
    } else {
      saveLocalDatabase();
    }
  } catch (error) {
    console.warn("MongoDB Fallback: Warning loading local database:", error);
  }
}

function saveLocalDatabase() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(localDb, null, 2), "utf-8");
  } catch (error) {
    console.warn("MongoDB Fallback: Warning saving local database:", error);
  }
}

// MongoDB Connection State
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let isConnecting = false;
let hasConnectedOnce = false;

export async function getMongoClient(): Promise<MongoClient | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return null;
  }

  if (mongoClient) {
    return mongoClient;
  }

  if (isConnecting) {
    // Wait a brief moment to prevent multiple parallel connections
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (mongoClient) return mongoClient;
  }

  try {
    isConnecting = true;
    console.log("MongoDB: Connecting to database cluster...");
    mongoClient = new MongoClient(uri, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000
    });
    await mongoClient.connect();
    
    // Determine database name from connection string or default
    const dbName = uri.includes(".mongodb.net/") 
      ? uri.split(".mongodb.net/")[1]?.split("?")[0] || "agrikart" 
      : "agrikart";
      
    mongoDb = mongoClient.db(dbName);
    hasConnectedOnce = true;
    console.log(`MongoDB: Connected successfully to database: "${dbName}"`);
    
    // Seed initial collections if they don't exist
    await seedMongoDatabase();
    
    return mongoClient;
  } catch (error) {
    console.warn("MongoDB Connection Note: Falling back to local JSON storage (No local daemon or remote connection established).");
    mongoClient = null;
    mongoDb = null;
    return null;
  } finally {
    isConnecting = false;
  }
}

export async function getDb(): Promise<Db | null> {
  if (!mongoDb) {
    await getMongoClient();
  }
  return mongoDb;
}

export async function isMongoActive(): Promise<boolean> {
  const db = await getDb();
  return db !== null;
}

async function seedMongoDatabase() {
  try {
    const db = mongoDb;
    if (!db) return;

    // Check users collection
    const usersCount = await db.collection("users").countDocuments();
    if (usersCount === 0) {
      console.log("MongoDB: Seeding default users...");
      await db.collection("users").insertMany(defaultUsers);
    }

    // Check products collection
    const productsCount = await db.collection("products").countDocuments();
    if (productsCount === 0) {
      console.log("MongoDB: Seeding default products...");
      await db.collection("products").insertMany(defaultProducts);
    }
    
    console.log("MongoDB: Seeding check completed.");
  } catch (error) {
    console.warn("MongoDB: Seeding issue:", error);
  }
}

// Database Operations Manager (seamlessly uses Mongo if active, or local file system if not)
export const dbManager = {
  // USERS
  async getUsers(): Promise<User[]> {
    const db = await getDb();
    if (db) {
      const users = await db.collection("users").find({}).toArray();
      return users.map(u => {
        const { _id, ...rest } = u;
        return rest as User;
      });
    } else {
      loadLocalDatabase();
      return localDb.users;
    }
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const emailNormalized = email.toLowerCase().trim();
    const db = await getDb();
    if (db) {
      const u = await db.collection("users").findOne({ email: { $regex: new RegExp(`^${emailNormalized}$`, "i") } });
      if (!u) return null;
      const { _id, ...rest } = u;
      return rest as User;
    } else {
      loadLocalDatabase();
      return localDb.users.find(u => u.email.toLowerCase() === emailNormalized) || null;
    }
  },

  async getUserById(id: string): Promise<User | null> {
    const db = await getDb();
    if (db) {
      const u = await db.collection("users").findOne({ id });
      if (!u) return null;
      const { _id, ...rest } = u;
      return rest as User;
    } else {
      loadLocalDatabase();
      return localDb.users.find(u => u.id === id) || null;
    }
  },

  async createUser(user: User): Promise<void> {
    const db = await getDb();
    if (db) {
      await db.collection("users").insertOne(user);
    } else {
      loadLocalDatabase();
      localDb.users.push(user);
      saveLocalDatabase();
    }
  },

  async updateUserBalance(userId: string, newBalance: number): Promise<void> {
    const db = await getDb();
    if (db) {
      await db.collection("users").updateOne({ id: userId }, { $set: { balance: newBalance } });
    } else {
      loadLocalDatabase();
      const idx = localDb.users.findIndex(u => u.id === userId);
      if (idx !== -1) {
        localDb.users[idx].balance = newBalance;
        saveLocalDatabase();
      }
    }
  },

  // PRODUCTS
  async getProducts(filters: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    farmerId?: string;
  }): Promise<Product[]> {
    const db = await getDb();
    if (db) {
      const query: any = {};
      
      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: "i" } },
          { description: { $regex: filters.search, $options: "i" } }
        ];
      }
      
      if (filters.category && filters.category !== "All") {
        query.category = filters.category;
      }
      
      if (filters.farmerId) {
        query.farmerId = filters.farmerId;
      }
      
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        query.price = {};
        if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
        if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
      }

      let cursor = db.collection("products").find(query);

      // Sorting
      if (filters.sortBy === "price_asc") {
        cursor = cursor.sort({ price: 1 });
      } else if (filters.sortBy === "price_desc") {
        cursor = cursor.sort({ price: -1 });
      } else if (filters.sortBy === "rating") {
        cursor = cursor.sort({ rating: -1 });
      }

      const products = await cursor.toArray();
      const mapped = products.map(p => {
        const { _id, ...rest } = p;
        return rest as Product;
      });

      if (!filters.sortBy) {
        mapped.reverse(); // Newest first
      }

      return mapped;
    } else {
      loadLocalDatabase();
      let results = [...localDb.products];

      if (filters.search) {
        const q = filters.search.toLowerCase();
        results = results.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      }

      if (filters.category && filters.category !== "All") {
        results = results.filter(p => p.category === filters.category);
      }

      if (filters.farmerId) {
        results = results.filter(p => p.farmerId === filters.farmerId);
      }

      if (filters.minPrice !== undefined) {
        results = results.filter(p => p.price >= (filters.minPrice as number));
      }
      if (filters.maxPrice !== undefined) {
        results = results.filter(p => p.price <= (filters.maxPrice as number));
      }

      if (filters.sortBy === "price_asc") {
        results.sort((a, b) => a.price - b.price);
      } else if (filters.sortBy === "price_desc") {
        results.sort((a, b) => b.price - a.price);
      } else if (filters.sortBy === "rating") {
        results.sort((a, b) => b.rating - a.rating);
      } else {
        results.reverse();
      }

      return results;
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    const db = await getDb();
    if (db) {
      const p = await db.collection("products").findOne({ id });
      if (!p) return null;
      const { _id, ...rest } = p;
      return rest as Product;
    } else {
      loadLocalDatabase();
      return localDb.products.find(p => p.id === id) || null;
    }
  },

  async createProduct(product: Product): Promise<void> {
    const db = await getDb();
    if (db) {
      await db.collection("products").insertOne(product);
    } else {
      loadLocalDatabase();
      localDb.products.push(product);
      saveLocalDatabase();
    }
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const db = await getDb();
    if (db) {
      await db.collection("products").updateOne({ id }, { $set: updates });
      return this.getProductById(id);
    } else {
      loadLocalDatabase();
      const idx = localDb.products.findIndex(p => p.id === id);
      if (idx === -1) return null;
      localDb.products[idx] = { ...localDb.products[idx], ...updates };
      saveLocalDatabase();
      return localDb.products[idx];
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    const db = await getDb();
    if (db) {
      const res = await db.collection("products").deleteOne({ id });
      return (res.deletedCount || 0) > 0;
    } else {
      loadLocalDatabase();
      const idx = localDb.products.findIndex(p => p.id === id);
      if (idx === -1) return false;
      localDb.products.splice(idx, 1);
      saveLocalDatabase();
      return true;
    }
  },

  async addProductReview(productId: string, review: Review, newRating: number, newCount: number): Promise<void> {
    const db = await getDb();
    if (db) {
      await db.collection("products").updateOne(
        { id: productId },
        { 
          $push: { reviews: review },
          $set: { rating: newRating, reviewsCount: newCount }
        } as any
      );
    } else {
      loadLocalDatabase();
      const idx = localDb.products.findIndex(p => p.id === productId);
      if (idx !== -1) {
        localDb.products[idx].reviews.push(review);
        localDb.products[idx].reviewsCount = newCount;
        localDb.products[idx].rating = newRating;
        saveLocalDatabase();
      }
    }
  },

  // CARTS
  async getCart(userId: string): Promise<Cart> {
    const db = await getDb();
    if (db) {
      const cart = await db.collection("carts").findOne({ userId });
      if (!cart) {
        const newCart: Cart = { userId, items: [] };
        await db.collection("carts").insertOne(newCart);
        return newCart;
      }
      const { _id, ...rest } = cart;
      return rest as Cart;
    } else {
      loadLocalDatabase();
      let cart = localDb.carts.find(c => c.userId === userId);
      if (!cart) {
        cart = { userId, items: [] };
        localDb.carts.push(cart);
        saveLocalDatabase();
      }
      return cart;
    }
  },

  async updateCart(userId: string, items: CartItem[]): Promise<void> {
    const db = await getDb();
    if (db) {
      await db.collection("carts").updateOne(
        { userId },
        { $set: { items } },
        { upsert: true }
      );
    } else {
      loadLocalDatabase();
      const idx = localDb.carts.findIndex(c => c.userId === userId);
      if (idx !== -1) {
        localDb.carts[idx].items = items;
      } else {
        localDb.carts.push({ userId, items });
      }
      saveLocalDatabase();
    }
  },

  // ORDERS
  async createOrder(order: Order, clearCartUserId: string): Promise<void> {
    const db = await getDb();
    if (db) {
      // Create the order
      await db.collection("orders").insertOne(order);
      // Clear the buyer's cart
      await db.collection("carts").updateOne({ userId: clearCartUserId }, { $set: { items: [] } });
    } else {
      loadLocalDatabase();
      localDb.orders.push(order);
      const cIdx = localDb.carts.findIndex(c => c.userId === clearCartUserId);
      if (cIdx !== -1) {
        localDb.carts[cIdx].items = [];
      }
      saveLocalDatabase();
    }
  },

  async getOrders(userId: string, role: "buyer" | "farmer"): Promise<Order[]> {
    const db = await getDb();
    if (db) {
      if (role === "buyer") {
        const orders = await db.collection("orders").find({ userId }).sort({ createdAt: -1 }).toArray();
        return orders.map(o => {
          const { _id, ...rest } = o;
          return rest as Order;
        });
      } else {
        // Supplier/Farmer: Get orders containing items they listed
        const products = await db.collection("products").find({ farmerId: userId }).toArray();
        const farmerProductIds = products.map(p => p.id);
        
        const orders = await db.collection("orders").find({ "items.productId": { $in: farmerProductIds } }).toArray();
        const mappedOrders = orders.map(o => {
          const { _id, ...rest } = o;
          const castedOrder = rest as Order;
          const filteredItems = castedOrder.items.filter(item => farmerProductIds.includes(item.productId));
          const subtotal = filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          return {
            ...castedOrder,
            items: filteredItems,
            totalAmount: parseFloat(subtotal.toFixed(2))
          };
        });
        
        return mappedOrders.reverse();
      }
    } else {
      loadLocalDatabase();
      if (role === "buyer") {
        const userOrders = localDb.orders.filter(o => o.userId === userId);
        return [...userOrders].reverse();
      } else {
        const farmerProducts = localDb.products.filter(p => p.farmerId === userId).map(p => p.id);
        const farmerOrders = localDb.orders.filter(order =>
          order.items.some(item => farmerProducts.includes(item.productId))
        ).map(order => {
          const filteredItems = order.items.filter(item => farmerProducts.includes(item.productId));
          const subTotal = filteredItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
          return {
            ...order,
            items: filteredItems,
            totalAmount: parseFloat(subTotal.toFixed(2))
          };
        });
        return [...farmerOrders].reverse();
      }
    }
  },

  async updateOrderStatus(orderId: string, status: "Pending" | "Shipped" | "Delivered" | "Cancelled"): Promise<Order | null> {
    const db = await getDb();
    if (db) {
      await db.collection("orders").updateOne({ id: orderId }, { $set: { status } });
      const order = await db.collection("orders").findOne({ id: orderId });
      if (!order) return null;
      const { _id, ...rest } = order;
      return rest as Order;
    } else {
      loadLocalDatabase();
      const idx = localDb.orders.findIndex(o => o.id === orderId);
      if (idx === -1) return null;
      localDb.orders[idx].status = status;
      saveLocalDatabase();
      return localDb.orders[idx];
    }
  }
};
