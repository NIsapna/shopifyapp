import React, { useContext, useState } from "react";
import { PricingCard } from "../ui-components/pricing/PricingCard";
import { Banner, Card, Grid, Layout, Page, Text, InlineStack, BlockStack, Button } from "@shopify/polaris";
import { useGetActivePlanQuery, useSelectPlanMutation } from "../store/pricingApi";
import ShopContext from "../utlis/ShopContext";
import { useNavigate } from "react-router-dom";
import { PLANS } from "../utlis/constants";
import { usePlan } from "../context/PlanContext";
import UpgradeOverlay from "../ui-components/comman/UpgradeOverlay";
import NoPlanOverlay from "../ui-components/comman/NoPlanLayout";

const Pricing = () => {
  const navigate = useNavigate();
  const shop = useContext(ShopContext);
  const [selectPlan, { isLoading }] = useSelectPlanMutation();
  const [errorMessage, setErrorMessage] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(null); // ✅ track which plan is loading
  const { planName, isPlanActive, noPlanSelected, is_install, isPlanExpired, expiresAt, isPlanPending } = usePlan();

  // Selected plan state (optimistic UI): reflects the plan the user just successfully selected.
  // Initialized to currentPlanName so the UI reflects the store's active plan on load.
  const [selectedPlan, setSelectedPlan] = useState(planName || "");

  const handleSelectPlan = async (planName) => {
    setErrorMessage(null);
    setLoadingPlan(planName); // start loader for clicked plan

    if (!shop) {
      setErrorMessage(
        "We couldn’t identify your store. Please refresh this page and try again."
      );
      setLoadingPlan(null);
      return;
    }

    try {
      const res = await selectPlan({ shop: shop, plan: planName }).unwrap();
      // console.log("res", res);
      setSelectedPlan(planName);

      if (planName === "free") {
        if (window.shopify && shopify.toast) {
          await shopify.toast.show("You are now on the Free Plan!", {
            duration: 2000,
          });
        }

        navigate("/")
      } else if (res?.confirmationUrl) {
        window.open(res.confirmationUrl, "_top");
      } else {
        setErrorMessage("There was an issue connecting to Shopify Billing. Please try again in a few moments.");
      }
    } catch (err) {
      // console.error("❌ Failed to select plan:", err);
      if (err?.status === 404) {
        setErrorMessage("Your store information couldn’t be verified. Please refresh the page and try again.");
      } else if (err?.status === 500) {
        setErrorMessage(
          "Something went wrong on our end while connecting to Shopify Billing. Please try again in a few moments."
        );
      } else
        if (err?.status === 400) {
          setErrorMessage("We couldn’t identify your store. Please refresh the page and try again.");
        } else
          setErrorMessage("We ran into a temporary issue selecting your plan. Please refresh and try again, or contact support if this continues.");
    }
    finally {
      setLoadingPlan(null); // stop loader
    }
  };

  return (
    <Page 
    title="Pricing"
    // backAction={{ content: 'Manage Authors', url: '/authors-page' }}
    primaryAction={
      <Button
        variant="primary"
        onClick={() => navigate("/support")}
      >
        Get Support
      </Button>
    }
    >
      <Layout>
        <Layout.Section>
          {isPlanExpired && (
            <UpgradeOverlay message="Your plan expired! Please upgrade your plan." />
          )}

          {isPlanPending && (
            <>
              <NoPlanOverlay message="Your payment is not completed. Please purches the plan. " />
            </>
          )}
        </Layout.Section>
        {errorMessage && (
          <Layout.Section>
            <Banner
              heading="Plan selection failed"
              tone="critical"
              onDismiss={() => setErrorMessage(null)}
            >
              {errorMessage}
            </Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <Card >
            <InlineStack gap="300" >
              <Text as="h2" variant="headingMd">Choose Your Plan</Text>
              {noPlanSelected ? (
                <Banner tone="info">
                  <Text as="p">You don't have any plan selected yet. Choose a plan below to get started.</Text>
                </Banner>
              ) : (
                <Text as="p" variant="bodyMd" tone="subdued">
                  (Current Plan: <strong>{planName?.toUpperCase()}</strong>)
                </Text>
              )}
            </InlineStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card >
            <BlockStack gap="500">
              <Grid
                gap="small"
                justifyContent=""
              >
                {PLANS.map((plan, index) => (
                  <PricingCard
                    key={index}
                    {...plan}
                    handleSelectPlan={handleSelectPlan}
                    isLoading={loadingPlan === plan.planName}
                    isActive={plan.planName === planName && isPlanActive}
                    noPlanSelected={noPlanSelected}
                    is_install={is_install}
                    isPlanExpired={plan.planName === planName && isPlanExpired}
                    planPending={plan.planName === planName && isPlanPending}
                    expiresAt={expiresAt}
                    selectedPlan={selectedPlan}
                    currentPlanName={planName}
                  />
                ))}
              </Grid>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};
export default Pricing;
