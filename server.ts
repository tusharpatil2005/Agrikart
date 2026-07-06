import express from "express";
import path from "path";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import { dbManager, hashPassword, isMongoActive } from "./src/db/db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const JWT_SECRET = "agri-marketplace-jwt-secret-key-2026";

// Express setup
async function startServer() {
  const app = express();
  app.use(express.json());

  // CORS-like/Auth check middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ error: "Access token required" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Invalid or expired token" });
      req.user = user;
      next();
    });
  };

  // --- API ROUTES ---

  // Auth: Register
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Please fill in all fields" });
    }

    if (role !== "buyer" && role !== "farmer") {
      return res.status(400).json({ error: "Invalid role selection" });
    }

    const emailNormalized = email.toLowerCase().trim();
    const existingUser = await dbManager.getUserByEmail(emailNormalized);
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const newUser = {
      id: "u_" + crypto.randomUUID(),
      name,
      email: emailNormalized,
      passwordHash: hashPassword(password),
      role,
      balance: role === "farmer" ? 0.0 : 5000.0 // Give buyers starting 5000 credits for easy shopping!
    };

    await dbManager.createUser(newUser as any);

    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        balance: newUser.balance
      }
    });
  });

  // Auth: Login
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please enter email and password" });
    }

    const emailNormalized = email.toLowerCase().trim();
    const user = await dbManager.getUserByEmail(emailNormalized);
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    if (user.passwordHash !== hashPassword(password)) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        balance: user.balance
      }
    });
  });

  // Auth: Get Current Profile
  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    const user = await dbManager.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      balance: user.balance
    });
  });

  // Auth: Add Funds (for buyers)
  app.post("/api/auth/add-funds", authenticateToken, async (req: any, res) => {
    const { amount } = req.body;
    const addAmt = parseFloat(amount);
    if (isNaN(addAmt) || addAmt <= 0) {
      return res.status(400).json({ error: "Invalid amount value" });
    }

    const user = await dbManager.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const newBalance = parseFloat((user.balance + addAmt).toFixed(2));
    await dbManager.updateUserBalance(user.id, newBalance);

    res.json({
      balance: newBalance,
      message: `Successfully added ₹${addAmt.toFixed(2)} to your wallet!`
    });
  });

  // Products: Get All with Filters
  app.get("/api/products", async (req, res) => {
    const { search, category, minPrice, maxPrice, sortBy, farmerId } = req.query;

    const products = await dbManager.getProducts({
      search: search as string,
      category: category as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      sortBy: sortBy as string,
      farmerId: farmerId as string
    });

    res.json(products);
  });

  // Products: Get Single Product
  app.get("/api/products/:id", async (req, res) => {
    const product = await dbManager.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  });

  // Products: Create New Product (Farmers only)
  app.post("/api/products", authenticateToken, async (req: any, res) => {
    if (req.user.role !== "farmer") {
      return res.status(403).json({ error: "Only registered farmers can list products" });
    }

    const { name, description, price, category, stock, image, unit } = req.body;

    if (!name || !description || !price || !category || !stock || !unit) {
      return res.status(400).json({ error: "Please fill in all required fields" });
    }

    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock);

    if (isNaN(priceNum) || priceNum <= 0) return res.status(400).json({ error: "Price must be greater than zero" });
    if (isNaN(stockNum) || stockNum < 0) return res.status(400).json({ error: "Stock cannot be negative" });

    const newProduct = {
      id: "p_" + crypto.randomUUID(),
      name,
      description,
      price: priceNum,
      category,
      stock: stockNum,
      image: image || "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80",
      unit,
      farmerId: req.user.id,
      farmerName: req.user.name,
      rating: 5.0,
      reviewsCount: 0,
      reviews: []
    };

    await dbManager.createProduct(newProduct as any);

    res.status(201).json(newProduct);
  });

  // Products: Update Product (Farmer owner only)
  app.put("/api/products/:id", authenticateToken, async (req: any, res) => {
    const product = await dbManager.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (product.farmerId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized. You do not own this listing." });
    }

    const { name, description, price, category, stock, image, unit } = req.body;
    const updates: any = {};

    if (name) updates.name = name;
    if (description) updates.description = description;
    if (category) updates.category = category;
    if (unit) updates.unit = unit;
    if (image) updates.image = image;

    if (price !== undefined) {
      const priceNum = parseFloat(price);
      if (!isNaN(priceNum) && priceNum > 0) updates.price = priceNum;
    }

    if (stock !== undefined) {
      const stockNum = parseInt(stock);
      if (!isNaN(stockNum) && stockNum >= 0) updates.stock = stockNum;
    }

    const updated = await dbManager.updateProduct(req.params.id, updates);
    res.json(updated);
  });

  // Products: Delete Product (Farmer owner only)
  app.delete("/api/products/:id", authenticateToken, async (req: any, res) => {
    const product = await dbManager.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    if (product.farmerId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized. You do not own this listing." });
    }

    await dbManager.deleteProduct(req.params.id);
    res.json({ message: "Product deleted successfully" });
  });

  // Products: Post Review
  app.post("/api/products/:id/review", authenticateToken, async (req: any, res) => {
    const product = await dbManager.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const { rating, comment } = req.body;
    const ratingNum = parseInt(rating);

    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ error: "Rating must be an integer between 1 and 5" });
    }

    const newReview = {
      id: "r_" + crypto.randomUUID(),
      userName: req.user.name,
      rating: ratingNum,
      comment: comment || "",
      createdAt: new Date().toISOString().split("T")[0]
    };

    const reviews = [...product.reviews, newReview];
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    const newRating = parseFloat((sum / reviews.length).toFixed(1));
    const newCount = reviews.length;

    await dbManager.addProductReview(req.params.id, newReview as any, newRating, newCount);
    
    const updatedProduct = await dbManager.getProductById(req.params.id);
    res.status(201).json(updatedProduct);
  });

  // Cart: Get Cart
  app.get("/api/cart", authenticateToken, async (req: any, res) => {
    const cart = await dbManager.getCart(req.user.id);

    // Map and enrich with live product information
    const enrichedItems = [];
    for (const item of cart.items) {
      const prod = await dbManager.getProductById(item.productId);
      if (prod) {
        enrichedItems.push({ product: prod, quantity: item.quantity });
      }
    }

    res.json(enrichedItems);
  });

  // Cart: Update Cart
  app.post("/api/cart", authenticateToken, async (req: any, res) => {
    const { items } = req.body; // Expect array of { productId, quantity }

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "Invalid cart items container" });
    }

    // Validate quantities and sanitize
    const sanitizedItems = [];
    for (const item of items) {
      const prod = await dbManager.getProductById(item.productId);
      if (prod) {
        const qty = Math.max(0, parseInt(item.quantity) || 0);
        if (qty > 0) {
          sanitizedItems.push({ productId: item.productId, quantity: qty });
        }
      }
    }

    await dbManager.updateCart(req.user.id, sanitizedItems);

    // Return enriched items
    const enrichedItems = [];
    for (const item of sanitizedItems) {
      const prod = await dbManager.getProductById(item.productId);
      if (prod) {
        enrichedItems.push({ product: prod, quantity: item.quantity });
      }
    }

    res.json(enrichedItems);
  });

  // Orders: Place Order
  app.post("/api/orders", authenticateToken, async (req: any, res) => {
    const { items, shippingAddress, paymentMethod } = req.body; // items: array of { productId, quantity }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "No items selected for order" });
    }

    if (!shippingAddress) {
      return res.status(400).json({ error: "Shipping address is required" });
    }

    // Find buyer
    const buyer = await dbManager.getUserById(req.user.id);
    if (!buyer) return res.status(404).json({ error: "Buyer profile not found" });

    let totalAmount = 0;
    const orderItems = [];
    const productsToUpdate = [];

    // Verify stock and calculate total
    for (const item of items) {
      const prod = await dbManager.getProductById(item.productId);
      if (!prod) {
        return res.status(400).json({ error: `Product not found: ${item.name || item.productId}` });
      }

      const qty = parseInt(item.quantity);

      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({ error: "Invalid item quantity" });
      }

      if (prod.stock < qty) {
        return res.status(400).json({ error: `Insufficient stock for '${prod.name}'. Only ${prod.stock} left.` });
      }

      totalAmount += prod.price * qty;
      orderItems.push({
        productId: prod.id,
        name: prod.name,
        price: prod.price,
        quantity: qty,
        image: prod.image
      });

      productsToUpdate.push({
        id: prod.id,
        newStock: prod.stock - qty
      });
    }

    // Check balance
    if (buyer.balance < totalAmount) {
      return res.status(400).json({
        error: `Insufficient funds. Your wallet balance is ₹${buyer.balance.toFixed(2)}, but total order is ₹${totalAmount.toFixed(2)}.`
      });
    }

    // Deduct stock from products
    for (const update of productsToUpdate) {
      await dbManager.updateProduct(update.id, { stock: update.newStock });
    }

    // Deduct balance from buyer
    const newBuyerBalance = parseFloat((buyer.balance - totalAmount).toFixed(2));
    await dbManager.updateUserBalance(buyer.id, newBuyerBalance);

    // Distribute earnings to corresponding farmers!
    for (const item of items) {
      const prod = await dbManager.getProductById(item.productId);
      if (prod) {
        const amountForFarmer = prod.price * item.quantity;
        const farmer = await dbManager.getUserById(prod.farmerId);
        if (farmer) {
          const newFarmerBalance = parseFloat((farmer.balance + amountForFarmer).toFixed(2));
          await dbManager.updateUserBalance(farmer.id, newFarmerBalance);
        }
      }
    }

    // Create Order
    const newOrder = {
      id: "o_" + crypto.randomUUID().slice(0, 8),
      userId: buyer.id,
      items: orderItems,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      status: "Pending" as const,
      shippingAddress,
      paymentMethod: paymentMethod || "Wallet Balance",
      createdAt: new Date().toISOString()
    };

    await dbManager.createOrder(newOrder, buyer.id);

    res.status(201).json({
      order: newOrder,
      newBalance: newBuyerBalance,
      message: "Order placed successfully! Funds transferred securely to suppliers."
    });
  });

  // Orders: Get Order History
  app.get("/api/orders", authenticateToken, async (req: any, res) => {
    const orders = await dbManager.getOrders(req.user.id, req.user.role);
    res.json(orders);
  });

  // Orders: Update Order Status (Farmers only, for their products)
  app.post("/api/orders/:id/status", authenticateToken, async (req: any, res) => {
    const { status } = req.body;
    if (req.user.role !== "farmer") {
      return res.status(403).json({ error: "Only suppliers can update shipping status" });
    }

    const allowedStatuses = ["Pending", "Shipped", "Delivered", "Cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const updated = await dbManager.updateOrderStatus(req.params.id, status as any);
    if (!updated) return res.status(404).json({ error: "Order not found" });

    res.json(updated);
  });

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const usingMongo = await isMongoActive();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Agrikart Server running on http://0.0.0.0:${PORT}`);
    console.log(`Database engine: ${usingMongo ? "🟢 MongoDB Cluster" : "💾 Local JSON (data.json)"}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
});
