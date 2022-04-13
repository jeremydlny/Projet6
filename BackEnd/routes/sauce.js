/* Import des modules necessaires */
const express = require("express");
const router = express.Router();
const saucesCtrl = require("../controllers/sauce");

const multer = require("../middleware/multer-config");
const auth = require('../middleware/auth');

/* Routage Sauce */
router.get('/', auth, saucesCtrl.getAllSauce);
router.post('/', auth, multer, saucesCtrl.createSauce);
router.get('/:id', auth, saucesCtrl.getOneSauce);
router.put('/:id', auth, multer, saucesCtrl.modifySauce);
router.delete('/:id', auth, saucesCtrl.deleteSauce);
router.post("/:id/like", auth, saucesCtrl.likeDislikeSauce);

module.exports = router;