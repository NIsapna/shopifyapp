import mongoose from "mongoose";

const postAuthorSchema = new mongoose.Schema(
  {
    shop: { type: String,},
    blogId: { type: String,},
    articleId: { type: String,},
    authorId: { type: String},
    is_assign: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("PostAuthor", postAuthorSchema);
