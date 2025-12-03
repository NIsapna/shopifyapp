import { Banner, Button, Text } from "@shopify/polaris";
import { useNavigate } from "react-router-dom";

export default function UpgradeOverlay({ message }) {
    const navigate = useNavigate();

    return (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-md z-20">
            <Banner tone="warning" title="Upgrade Required">
                <Text as="p" tone="subdued">
                    {message || "This feature is not available on the free plan."}
                </Text>
                <div style={{ marginTop: "1rem" }}>
                    <Button onClick={() => navigate("/pricing")}>Upgrade Plan</Button>
                </div>
            </Banner>
        </div>
    );
}
