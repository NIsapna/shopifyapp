import fs from "fs/promises";
import path from "path";
import Shop from "../model/ShopModel.js";
import Subscription from "../model/subscriptionModel.js";
import Author from "../model/UserModel.js";
import PostAuthor from "../model/PostAuthor.js";

const deleteFileIfExists = async (filePath) => {
  if (!filePath) return;
  try {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);
    await fs.unlink(absolutePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn("Failed to remove file", filePath, error);
    }
  }
};

export default async function purgeShopData(shop) {
  if (!shop) return;
  try {
    // const authors = await Author.find({ shop });
    // for (const author of authors) {
    //   if (author?.image) {
    //     await deleteFileIfExists(author.image);
    //   }
    // }

    await Promise.all([
      // Author.deleteMany({ shop }),
      // PostAuthor.deleteMany({ shop }),
      Subscription.deleteMany({ shop }),
      // Shop.deleteOne({ shop }),
    ]);

    console.info(`✅ Deleted data for ${shop}`);
  } catch (error) {
    console.error(`❌ Failed to purge data for ${shop}`, error);
    throw error;
  }
}
