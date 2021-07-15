// Require Express and Express router
const express = require('express')
const router = express.Router()

const recordController = require('../../controllers/recordController')

// Set up routes
router.get('/', recordController.getRecords)
router.get('/new', recordController.createRecord)
router.post('/', recordController.postRecord)
router.get('/:type', recordController.getRecords)

router.get('/:id/edit', recordController.editRecord)
router.put('/:id', recordController.putRecord)
router.delete('/:id', recordController.deleteRecord)

// Export router
module.exports = router
