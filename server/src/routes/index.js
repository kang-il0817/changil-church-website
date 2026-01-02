const express = require('express');
const router = express.Router();

// Example route
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is healthy' });
});

// Add more routes here
router.use('/sermons', require('./sermons'));
router.use('/gallery', require('./gallery'));
router.use('/gallery-posts', require('./galleryPosts'));
router.use('/events', require('./events'));
router.use('/bulletins', require('./bulletins'));
router.use('/popups', require('./popups'));
router.use('/donation-receipts', require('./donationReceipts'));

module.exports = router;

