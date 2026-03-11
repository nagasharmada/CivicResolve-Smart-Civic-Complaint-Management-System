const express = require("express");
const router = express.Router();
const complaintController = require("../controllers/complaint.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/", authMiddleware, complaintController.createComplaint);
router.get("/my", authMiddleware, complaintController.getMyComplaints);

router.get(
  "/all",
  authMiddleware,
  complaintController.getAllComplaints
);
router.put(
  "/:id/status",
  authMiddleware,
  complaintController.updateStatus
);
router.get("/public", complaintController.getAllPublic);
module.exports = router;