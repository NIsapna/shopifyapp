import { useContext, useState } from 'react';
import {
  Page,
  TextField,
  Button,
  Card,
  FormLayout,
  Text,
  InlineStack,
  Box,
  Banner,
  BlockStack,
  Layout,
  InlineGrid,
  Icon,
  Divider,
} from '@shopify/polaris';
import {
  ConnectIcon,
  EmailIcon,
  PhoneIcon,
  CheckCircleIcon
} from '@shopify/polaris-icons';
import { useNavigate } from 'react-router-dom';
import ShopContext from '../utlis/ShopContext';
import { useSendSupportEmailMutation } from '../store/snippetApi';

export default function Support() {
  const navigate = useNavigate();
  const shopName = useContext(ShopContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [apiError, setApiError] = useState('');

  const [sendSupportEmail] = useSendSupportEmailMutation();

  const handleChange = (field) => (value) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: '' });
    if (success) setSuccess(null);
    if (apiError) setApiError('');
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Enter a valid email address.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Phone must be 10 digits.';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message cannot be empty.';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters.';
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setApiError('');
    setSuccess(null);

    try {
      const response = await sendSupportEmail(formData).unwrap();
      if (import.meta.env.DEV) {
        console.log('API Response:', response);
      }
      if (response.status) {
        if (window.shopify && shopify.toast) {
          await shopify.toast.show("Support request received! Our team will contact you shortly.", {
            duration: 2000,
          });
        }
        setSuccess(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
        setErrors({});
      } else {
        setSuccess(false);
        setApiError("We couldn't send your message right now. Please try again in a few moments.");
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error sending email:', error);
      }
      setSuccess(false);
      setApiError("Something went wrong while sending your message. Please refresh and try again, or contact us directly if this continues.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page
      title="Support"
      // backAction={{ content: 'Pricing', url: '/pricing' }}
      primaryAction={
        <Button
          variant="primary"
          onClick={handleSubmit}
          loading={submitting}
          disabled={submitting}
        >
          Send message
        </Button>
      }
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {/* Header Card */}
            <Card>
              <BlockStack gap="400">
                <InlineStack gap="300" align="start">
                  <Box
                    padding="300"
                    background="bg-surface-secondary"
                    borderRadius="200"
                  >
                    <Icon source={ConnectIcon} tone="base" />
                  </Box>
                  <BlockStack gap="100">
                    <Text variant="headingMd" as="h2">
                      Get help from our support team
                    </Text>
                    <Text tone="subdued" as="p">
                      Fill out the form below and we'll get back to you as soon as possible.
                      Our team typically responds within 24 hours.
                    </Text>
                  </BlockStack>
                </InlineStack>
              </BlockStack>
            </Card>

            {/* Success Banner */}
            {success && (
              <Banner
                title="Support request received"
                tone="success"
                onDismiss={() => setSuccess(null)}
                icon={CheckCircleIcon}
              >
                <p>
                  Thank you for reaching out! Our team has received your message and will contact you shortly.
                </p>
              </Banner>
            )}

            {/* Error Banner */}
            {success === false && apiError && (
              <Banner
                title="Unable to send message"
                tone="critical"
                onDismiss={() => {
                  setSuccess(null);
                  setApiError('');
                }}
              >
                <p>{apiError}</p>
              </Banner>
            )}

            {/* Form Card */}
            <Card>
              <BlockStack gap="500">
                <Text variant="headingSm" as="h3">
                  Contact information
                </Text>

                <FormLayout>

                  <FormLayout.Group>
                    <TextField
                      label="Full name"
                      value={formData.name}
                      onChange={handleChange('name')}
                      autoComplete="name"
                      error={errors.name}
                      placeholder="Enter your full name"
                      requiredIndicator
                    // helpText="We'll use this to address you in our response"
                    />
                    <TextField
                      type="email"
                      label="Email address"
                      value={formData.email}
                      onChange={handleChange('email')}
                      autoComplete="email"
                      error={errors.email}
                      placeholder="your.email@example.com"
                      requiredIndicator
                      helpText="We'll send our response to this email"
                    />
                  </FormLayout.Group>
                  <FormLayout.Group>
                    <TextField
                      type="tel"
                      label="Phone number"
                      value={formData.phone}
                      onChange={handleChange('phone')}
                      autoComplete="tel"
                      error={errors.phone}
                      placeholder="1234567890"
                      requiredIndicator
                      helpText="10 digits only"
                    />
                  </FormLayout.Group>

                  <Divider />

                  <BlockStack gap="200">
                    <Text variant="headingSm" as="h3">
                      How can we help?
                    </Text>
                    <TextField
                      label="Message"
                      value={formData.message}
                      onChange={handleChange('message')}
                      multiline={6}
                      placeholder="Describe your issue or question in detail. The more information you provide, the better we can assist you."
                      error={errors.message}
                      requiredIndicator
                      helpText={`${formData.message.length} characters (minimum 10, maximum 1000)`}
                      maxLength={1000}
                    />
                  </BlockStack>
                </FormLayout>
              </BlockStack>
            </Card>

            {/* Additional Information Card */}
            {/* <Card>
              <BlockStack gap="300">
                <Text variant="headingSm" as="h3">
                  Other ways to reach us
                </Text>
                <InlineGrid columns={{ xs: 1, sm: 2 }} gap="400">
                  <Box
                    padding="400"
                    background="bg-surface-secondary"
                    borderRadius="200"
                  >
                    <BlockStack gap="200">
                      <InlineStack gap="200" align="start">
                        <Icon source={EmailIcon} tone="base" />
                        <BlockStack gap="050">
                          <Text variant="bodyMd" fontWeight="semibold">
                            Email support
                          </Text>
                          <Text tone="subdued" variant="bodySm">
                            Send us an email and we'll respond within 24 hours
                          </Text>
                        </BlockStack>
                      </InlineStack>
                    </BlockStack>
                  </Box>
                  <Box
                    padding="400"
                    background="bg-surface-secondary"
                    borderRadius="200"
                  >
                    <BlockStack gap="200">
                      <InlineStack gap="200" align="start">
                        <Icon source={PhoneIcon} tone="base" />
                        <BlockStack gap="050">
                          <Text variant="bodyMd" fontWeight="semibold">
                            Response time
                          </Text>
                          <Text tone="subdued" variant="bodySm">
                            We typically respond within 24 hours during business days
                          </Text>
                        </BlockStack>
                      </InlineStack>
                    </BlockStack>
                  </Box>
                </InlineGrid>
              </BlockStack>
            </Card> */}
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
