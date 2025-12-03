import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema({
  shop:  { type: String},
  name: { type: String },
  bio: { type: String , default: null},
  email: { type: String },
  image: { type: String }, // store URL or filename
  linkedin: { type: String },
  twitter: { type: String },
  instagram: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  is_author_bio_exist: { type: Number, default: 0 }, // for bio is not exist
  is_assign: { type: Boolean, default: false }, // for assign - from our app
  is_defaut_author: { type: Boolean, default: false }, // for filter - default author of store
}, { timestamps: true });

export default mongoose.model('Author', userProfileSchema);

