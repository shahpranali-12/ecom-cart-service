const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5001;

// === Middleware ===
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Allow app to accept JSON

// === In-Memory Database ===
let mockProducts = [
  { id: 1, name: 'Classic Tee', price: 25.00, img: 'https://via.placeholder.com/150/0000FF/808080?text=Tee' },
  { id: 2, name: 'Leather Jacket', price: 150.00, img: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Jacket' },
  { id: 3, name: 'Slim Jeans', price: 60.00, img: 'https://via.placeholder.com/150/008000/FFFFFF?text=Jeans' },
  { id: 4, name: 'Canvas Sneakers', price: 45.00, img: 'https://via.placeholder.com/150/FFFF00/000000?text=Sneakers' },
  { id: 5, name: 'Wool Scarf', price: 30.00, img: 'https://via.placeholder.com/150/800080/FFFFFF?text=Scarf' },
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
app.post('/api/checkout', (req, a) => {
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