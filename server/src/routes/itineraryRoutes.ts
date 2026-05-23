import { Router } from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import {
  uploadAndGenerate,
  getItineraries,
  getItinerary,
  getSharedItinerary,
} from "../controllers/uploadController.js";

const router = Router();

// Memory storage — file stays in buffer, we upload to S3
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, JPG, PNG files allowed"));
    }
  },
});

router.post("/upload", protect, upload.single("document"), uploadAndGenerate);
router.get("/", protect, getItineraries);
router.get("/:id", protect, getItinerary);
router.get("/share/:shareId", getSharedItinerary); // public

export default router;
