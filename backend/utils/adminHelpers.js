import ClassModel from "../models/Class.js";
import { DEFAULT_CLASSES } from "../config/constants.js";

export async function getValidClasses() {
  const classes = await ClassModel.find({}).lean();
  if (!classes || classes.length === 0) {
    // seed defaults
    await ClassModel.insertMany(DEFAULT_CLASSES.map((name) => ({ name })), { ordered: false });
    return DEFAULT_CLASSES;
  }
  return classes.map((c) => c.name);
}

