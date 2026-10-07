const express = require('express');
const router = express.Router();
const {
  createResource,
  getGroupResources,
  getResourceById,
  updateResource,
  deleteResource,
  getRecentResources
} = require('../controllers/resourceController');
const { protect } = require('../middleware/auth');

// All resource routes require authentication
router.use(protect);

// IMPORTANT: /recent must come before /:id
router.get('/recent', getRecentResources);

router.route('/')
  .post(createResource);

router.get('/group/:groupId', getGroupResources);

router.route('/:id')
  .get(getResourceById)
  .put(updateResource)
  .delete(deleteResource);

module.exports = router;
