import { Badge, Box, Button, Grid, Text, BlockStack, InlineStack } from "@shopify/polaris";

export const PricingCard = ({
  title,
  description,
  price,
  features,
  featuredText,
  button,
  frequency,
  planName,
  handleSelectPlan,
  isLoading,
  isActive,
  noPlanSelected,
  is_install,
  isPlanExpired,
  expiresAt,
  currentPlanName,
  planPending
}) => {

  const planKey = planName.toLowerCase();
  const isFreePlan = planKey === "free";
  const isProPlan = planKey === "pro";
  const isGrowthPlan = planKey === "growth";
  const isEnterprisePlan = planKey === "enterprise";

  // Determine button label and disabled state in one place
  const determineButton = () => {
    // If this plan is the store's current plan and it's active (not expired)
    if (isActive && !isPlanExpired) {
      return { label: "Current Plan", disabled: true, tone: "subdued" };
    }

    // If this plan is the store's current plan but expired
    if (isActive && isPlanExpired) {
      return { label: "Renew Plan", disabled: false, tone: "critical", variant: "primary" };
    }

    // If this plan is the store's current plan but pending, give users a button to complete the payment
    if (currentPlanName === planKey && planPending) {
      return { label: "Complete Payment", disabled: false, tone: "critical", variant: "primary" };
    }

    // If user has just selected a plan (optimistic selection)
    // selectedPlan equals the plan they chose last successfully
    if (currentPlanName) {
      // If the user selected free -> other plans should show "Upgrade Plan"
      if (currentPlanName === "free" && !isFreePlan) {
        return { label: "Upgrade Plan", disabled: false, tone: "primary" };
      }

      // If user selected pro:
      if (currentPlanName === "pro") {
        // Free plan becomes unavailable
        if (isFreePlan) {
          return { label: "Unavailable", disabled: true, tone: "subdued" };
        }
        // The pro card itself will be current/processing
        if (isProPlan) {
          // if loading, show processing handled by `loading` prop via button loading state
          return { label: "Renew Plan", disabled: false, tone: "critical", variant: "primary" };
        }
        // Higher plans (growth/enterprise) show upgrade
        return { label: "Upgrade Plan", disabled: false, tone: "primary" };
      }

      // If user selected growth:
      if (currentPlanName === "growth") {
        // Free plan unavailable
        if (isFreePlan) {
          return { label: "Unavailable", disabled: true, tone: "subdued" };
        }
        // Pro plan offers a downgrade option
        if (isProPlan) {
          return { label: "Downgrade to Pro", disabled: false, tone: "auto", variant: "secondary" };
        }
        // Growth itself or higher plans
        if (isGrowthPlan) {
          return { label: "Renew Plan", disabled: false, tone: "critical", variant: "primary" };
        }
        return { label: "Upgrade Plan", disabled: false, tone: "primary" };
      }

      // If user selected growth:
      // if (currentPlanName === "enterprise") {
      //   // Free plan unavailable
      //   if (isFreePlan) {
      //     return { label: "Unavailable", disabled: true, tone: "subdued" };
      //   }
      //   // Pro plan offers a downgrade option
      //   if (isProPlan) {
      //     return { label: "Downgrade to Pro", disabled: false, tone: "auto", variant: "secondary" };
      //   }
      //   // Growth itself or higher plans
      //   if (isGrowthPlan) {
      //     return { label: "Downgrade to Growth", disabled: false, tone: "auto", variant: "secondary" };
      //   }
      //   return { label: "Upgrade Plan", disabled: false, tone: "primary" };
      // }
    }

    // Default behavior (no optimistic selection)
    // Free plan special: show Select Plan by default
    return { label: "Select Plan", disabled: false, tone: "primary" };
  };
  // const buttonDisabled = isActive || isLoading || (is_install && isFreePlan);
  const { label: buttonLabel, disabled: buttonDisabled, tone: buttonTone, variant: buttonVariant } = determineButton();

  const isButtonDisabled = buttonDisabled || isLoading || (is_install && isFreePlan) || (isActive && !isPlanExpired);

  // const buttonLabel = isLoading
  //   ? "Processing..."
  //   : isActive
  //   ? "Current Plan"
  //   : is_install && planName.toLowerCase() === "free"
  //   ? "Unavailable"
  //   : noPlanSelected
  //   ? "Select Plan"
  //   : "Upgrade Plan";

  // const buttonVariant = isActive ? "secondary" : "primary";
  // const buttonTone = isActive ? "success" : "primary";

  // const isFreePlan = planName.toLowerCase() === "free";

  return (
    <Grid.Cell columnSpan={{ xs: 6, sm: 4, md: 4 }}>
      <div
        style={{
          boxShadow: isActive ? '0px 0px 4px 4px #CDFEE1' : isPlanExpired ? "0px 0px 4px 4px #fee7cdff" : 'none',
          border: isActive ? "1px solid #008060" : isPlanExpired ? "1px solid red" : " 1px solid #efefef",
          borderRadius: '.75rem',
          position: "relative",
          zIndex: "0",
          // minHeight: "410px",
          backgroundColor: "#fff",
          margin: "0 auto",
        }}
      >
        {isActive ? (
          <div style={{ position: "absolute", top: "-13px", right: "6px", zIndex: "100" }}>
            <Badge tone="success">{planName?.toUpperCase()}</Badge>
          </div>
        ) : null}

        <Box padding="400">
          <BlockStack gap="400" align="start" justify="start">
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">
                {title}
              </Text>
              {description ? <Text tone="subdued">{description}</Text> : null}
            </BlockStack>

            <InlineStack gap="100" align="start" blockAlign="end">
              <Text as="span" variant="headingLg">
                {price}
              </Text>
              <Text tone="subdued">/ {frequency}</Text>
            </InlineStack>

            <BlockStack gap="200">
              {features?.map((feature, id) => (
                <Text tone="subdued" key={id}>
                  {feature}
                </Text>
              ))}
            </BlockStack>
            {isActive && expiresAt ? (
              <div style={{}}>
                <Text tone="caution">Renews on {new Date(expiresAt).toLocaleDateString()}</Text>

              </div>
            ) : null}
            <InlineStack>
              <Button
                variant={buttonVariant || 'primary'}
                onClick={() => handleSelectPlan(planName)}
                loading={isLoading}
                disabled={isButtonDisabled}
                tone={buttonTone}
                fullWidth
              >
                {isLoading ? "Processing..." : buttonLabel}
              </Button>
            </InlineStack>
          </BlockStack>
        </Box>
      </div>
    </Grid.Cell>
  );
};
