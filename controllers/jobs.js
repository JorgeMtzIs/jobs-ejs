const Job = require("../models/Job");
const parseVErr = require("../utils/parseValidationErrs");

const getJobs = async (req, res) => {
  const jobs = await Job.find({ createdBy: req.user._id }).sort("createdAt");
  res.render("jobs", { jobs });
};

const showUpdate = async (req, res) => {
  const job = await Job.findOne({
    _id: req.params.id,
    createdBy: req.user._id
  });
  if (!job) {
    req.flash("error", `No job with id ${req.params.id} found`);
    return res.status(400).render("index", { errors: req.flash("error") });
  }
  res.render("job", { job });
};

const createJob = async (req, res) => {
  try {
    req.body.createdBy = req.user._id;
    await Job.create(req.body);
  } catch (e) {
    if (e.constructor.name === "ValidationError") {
      parseVErr(e, req);
    } else {
      throw e;
    }
    return res
      .status(400)
      .render("job", { job: null, errors: req.flash("error") });
  }
  res.redirect("/jobs");
};

const updateJob = async (req, res) => {
  const { company, position } = req.body;
  if (!company || !position) {
    req.flash("error", "Company and position fields must not be empty");
    return res.status(400).render("index", { errors: req.flash("error") });
  }
  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, createdBy: req.user._id },
    req.body,
    { returnDocument: "after", runValidators: true }
  );
  if (!job) {
    req.flash("error", `No job with id ${req.params.id} found`);
    return res.status(400).render("index", { errors: req.flash("error") });
  }
  res.redirect("/jobs");
};

const deleteJob = async (req, res) => {
  const job = await Job.findByIdAndDelete({
    _id: req.params.id,
    createdBy: req.user._id
  });
  if (!job) {
    req.flash("error", `No job with id ${req.params.id} found`);
    return res.status(400).render("index", { errors: req.flash("error") });
  }
  res.redirect("/jobs");
};

const showNew = (req, res) => {
  res.render("job", { job: null });
};

module.exports = {
  showUpdate,
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  showNew
};
