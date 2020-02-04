const express = require('express');
const cartsRepo = require('../repositories/Carts');
const productsRepo = require('../repositories/Products');
const cartShowTemplate = require('../views/carts/show');

const router = express.Router();

// Recieve POST request to add item to a cart
router.post('/cart/products', async (req, res) => {
	// Figure out the cart!
	let cart;
	if (!req.session.cartId) {
		// We don't have a cart, MUST create one
		// AND store cart id on req.session.cartId prop
		cart = await cartsRepo.create({ items: [] });
		req.session.cartId = cart.id;
	} else {
		// We have a cart! Lets get it from Repository
		cart = await cartsRepo.getOne(req.session.cartId);
	}
	const existingItem = cart.items.find(item => item.id === req.body.productId);
	// Increment quantity for existin item ***OR***
	if (existingItem) {
		existingItem.quantity++;
	} else {
		// ***OR*** add new product to items array
		cart.items.push({ id: req.body.productId, quantity: 1 });
	}
	await cartsRepo.update(cart.id, {
		items : cart.items
	});

	res.redirect('/cart');
});

// Recieve GET request to show all items in cart
router.get('/cart', async (req, res) => {
	if (!req.session.cartId) {
		return res.redirect('/');
	}
	const cart = await cartsRepo.getOne(req.session.cartId);

	for (let item of cart.items) {
		const product = await productsRepo.getOne(item.id);

		item.product = product;
	}

	res.send(cartShowTemplate({ items: cart.items }));
});

// Recieve POST request to delete an item from cart
router.post('/cart/products/delete', async (req, res) => {
	const { itemId } = req.body;
	const cart = await cartsRepo.getOne(req.session.cartId);

	const items = cart.items.filter(item => item.id !== itemId);

	await cartsRepo.update(req.session.cartId, { items });

	res.redirect('/cart');
});

module.exports = router;
