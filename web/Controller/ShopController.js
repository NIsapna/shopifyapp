
import Shop from "../model/ShopModel.js";

const getShopFromRequest = (req) => req.shopify?.shop || req.query?.shop;

export const GetShopDetails = async (req, res) => {
    try {
        const shop = getShopFromRequest(req);
        if (!shop) {
            return res.status(400).json({ success: false, message: "shop query parameter is required" });
        }

        const shopData = await Shop.findOne({ shop: shop });

        if (!shopData) {
            return res.status(200).json({ success: true, message: "shop not found", data: [] });
        }

        return res.status(200).json({ success: true, message: "shop fetched successfully", data: shopData || [] });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};