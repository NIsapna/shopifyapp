import { Card, Text, Button, BlockStack, Box, Icon } from "@shopify/polaris";
import {
  AlertTriangleIcon, AlertCircleIcon, CheckCircleIcon
} from '@shopify/polaris-icons';

const SeoItem = ({ item, onEdit, onFix, onFixLinks }) => {
  const { value, analysis, isAutoFix } = item;
  const isGood = analysis?.status === "good";
  // console.log(item.analysis);

  return (
    <Card sectioned >
      <Text variant="headingSm">{item.title}</Text>
      <Text variant="bodySm">{item.description}</Text>
  
      <Box className='flex flex-row items-center gap-1'
        style={{ marginTop: "0.5rem", display: 'flex', alignItems: '', gap: 3 }} >
        <Box className={`mr-2 w-4 h-4 flex flex-row items-start justify-center `} >
          {
            analysis?.status === "good" ? (
              <Icon
                source={CheckCircleIcon}
                tone="success"
              />) :
              analysis?.status === "warning" ? (
                <Icon
                  source={AlertTriangleIcon}
                  tone="caution"
                />
              ) : (
                <Icon
                  source={AlertCircleIcon}
                  tone="critical"
                />
              )
          }
        </Box>
        <Text
          tone={
            analysis?.status === "good"
              ? "success"
              : analysis?.status === "warning"
                ? "caution"
                : "critical"
          }
          // truncate
          style={{ margin: "0.5rem 0" }}
        >
          {analysis?.message}
        </Text>
      </Box>

      {/* Only show buttons if status is not good */}
      {/* {!isGood && (
        isAutoFix ? null : (
          <Box paddingBlock={100}>
            <BlockStack gap={200} inlineAlign="end" >
              <Button
                variant="monochromePlain" tone=""
                onClick={onEdit}
                style={{ marginTop: "0.5rem" }}
              >
                {value ? "Update" : "Add"}
              </Button>
            </BlockStack>
          </Box>
        )
      )}

      {analysis?.showAssignButton &&
        (
          analysis?.status === 'good' ? (
            <Box paddingBlock={100}>
              <BlockStack gap={200} inlineAlign="end">
                <Button
                  variant="monochromePlain"
                  onClick={onEdit}
                >
                  Re-assign author
                </Button>
              </BlockStack>
            </Box>
          )
            :
            (
              <Box paddingBlock={100}>
                <BlockStack gap={200} inlineAlign="end">
                  <Button
                    variant="monochromePlain"
                    onClick={onEdit}
                  >
                    {value ? "Update" : "Assign Author"}
                  </Button>
                </BlockStack>
              </Box>
            )
        )
      } */}
    </Card>
  );
};

export default SeoItem;
