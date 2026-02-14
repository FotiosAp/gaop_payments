import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  parent: { type: String, required: true },
  phone: { type: String, required: true },
  price: { type: Number, required: true }
});

const sectionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  players: [playerSchema]
});

export const Section = mongoose.model('Section', sectionSchema);
