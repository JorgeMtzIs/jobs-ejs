const express = require("express");
const router = express.Router();

const {
  showUpdate,
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  showNew
} = require("../controllers/jobs");

router.route("/").get(getJobs).post(createJob);
router.route("/new").get(showNew);
router.route("/edit/:id").get(showUpdate);
router.route("/update/:id").post(updateJob);
router.route("/delete/:id").post(deleteJob);

module.exports = router;
