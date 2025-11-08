const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5001;

// === Middleware ===
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Allow app to accept JSON

// === In-Memory Database ===
// === In-Memory Database ===
let mockProducts = [
  { id: 1, name: 'Women Jeans', price: 1800.00, img: 'https://via.placeholder.com/150/FF9933/FFFFFF?text=Women Jeans' },
  { id: 2, name: 'Oversize Tshirt', price: 1000.00, img: 'https://via.placeholder.com/150/138808/FFFFFF?text=Oversize Tshirt' },
  { id: 3, name: 'Men\'s Perfume', price: 700.00, img: 'https://via.placeholder.com/150/E3B45B/000000?text=Mens perfume' },
  { id: 4, name: 'Men\'s Jeans', price: 950.00, img: 'https://via.placeholder.com/150/8D5524/FFFFFF?text=Mens Jeans' },
  { id: 5, name: 'Sliders', price: 1200.00, img: 'https://via.placeholder.com/150/2C3E50/FFFFFF?text=Sliders' },
];

let cart = []; // { id, productId, name, price, qty }
let nextCartId = 1;

// === API Routes ===

// 1. GET /api/products
app.get('/api/products', (req, res) => {
  res.json(mockProducts);
});

// 2. GET /api/cart
app.get('/api/cart', (req, res) => {
  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  res.json({ cartItems: cart, total: parseFloat(total.toFixed(2)) });
});

// 3. POST /api/cart
app.post('/api/cart', (req, res) => {
  const { productId, qty } = req.body;
  const product = mockProducts.find(p => p.id === parseInt(productId));

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  // Check if item is already in cart
  const existingItem = cart.find(item => item.productId === product.id);

  if (existingItem) {
    existingItem.qty += qty;
  } else {
    const cartItem = {
      id: nextCartId++, // Use incrementing ID
      productId: product.id,
      name: product.name,
      price: product.price,
      qty: qty,
    };
    cart.push(cartItem);
  }
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  res.status(201).json({ cartItems: cart, total: parseFloat(total.toFixed(2)) });
});

// 4. DELETE /api/cart/:id
app.delete('/api/cart/:id', (req, res) => {
  const itemId = parseInt(req.params.id);
  cart = cart.filter(item => item.id !== itemId);
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  res.json({ message: 'Item removed', cartItems: cart, total: parseFloat(total.toFixed(2)) });
});

// 5. POST /api/checkout
app.post('/api/checkout', (req, res) =>  {
  const { cartItems, userDetails } = req.body;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const receipt = {
    receiptId: `REC-${Date.now()}`,
    timestamp: new Date().toISOString(),
    items: cartItems,
    total: parseFloat(total.toFixed(2)),
    user: userDetails
  };

  // Clear the cart after checkout
  cart = []; 
  nextCartId = 1; // Reset cart ID
  
  res.json(receipt);
});


// === Start Server ===
app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
});