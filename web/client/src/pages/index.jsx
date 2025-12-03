import React, { useContext, useMemo } from "react";
import {
    Page,
    Card,
    Text,
    Button,
    BlockStack,
    InlineStack,
    Layout,
    Banner,
    Box,
    Badge,
    InlineGrid,
    Divider,
    Icon,
    EmptyState,
    Spinner,
} from "@shopify/polaris";
import {
    SearchIcon,
    PersonIcon,
    PasskeyIcon,
    CreditCardIcon,
    QuestionCircleIcon,
    ChartVerticalFilledIcon,
    CheckCircleIcon,
} from "@shopify/polaris-icons";
import { useNavigate } from "react-router-dom";
import { useGetBlogsQuery } from "../store/blogsApi";
import ShopContext from "../utlis/ShopContext";
import { usePlan } from "../context/PlanContext";
import { PLANS } from "../utlis/constants";
import { useDispatch } from "react-redux";
import { selectBlog } from "../store/blogSlice";

const HomePage = () => {
    const shop = useContext(ShopContext);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { planName, isPlanActive, noPlanSelected, isPlanExpired, isPlanPending, isLoading: planLoading } = usePlan();
    const { data: blogsData, isLoading: blogsLoading } = useGetBlogsQuery({ shop }, { skip: !shop });

    // Calculate statistics
    const stats = useMemo(() => {
        const blogEdges = blogsData?.data?.data?.blogs?.edges || [];
        let totalArticles = 0;
        let totalBlogs = blogEdges.length;

        blogEdges.forEach((blogEdge) => {
            const articles = blogEdge.node.articles?.edges || [];
            totalArticles += articles.length;
        });

        return {
            totalBlogs,
            totalArticles,
        };
    }, [blogsData]);

    // Get plan details
    const currentPlan = useMemo(() => {
        if (!planName) return null;
        return PLANS.find((p) => p.planName === planName) || PLANS[0];
    }, [planName]);

    // Get plan limit
    const planLimit = useMemo(() => {
        if (!planName) return 3;
        const limits = {
            free: 3,
            pro: 20,
            growth: 100,
            enterprise: Infinity,
        };
        return limits[planName] || 3;
    }, [planName]);

    // Get recent blogs (last 5)
    const recentBlogs = useMemo(() => {
        const blogEdges = blogsData?.data?.data?.blogs?.edges || [];
        const articles = [];

        blogEdges.forEach((blogEdge) => {
            const blogNode = blogEdge.node;
            const articleEdges = blogNode.articles?.edges || [];
            articleEdges.forEach((articleEdge) => {
                articles.push({
                    blogTitle: blogNode.title,
                    articleTitle: articleEdge.node.title,
                    articleId: articleEdge.node.id,
                    blogId: blogNode.id,
                });
            });
        });

        return articles.slice(0, 5);
    }, [blogsData]);

    const handleViewBlog = (article) => {
        // dispatch(selectBlog({ id: article?.articleId }));
        navigate("/blog-optimization");
    };


    if (planLoading || blogsLoading) {
        return (
            <Page title="Dashboard">
                <Layout>
                    <Layout.Section>
                        <Card sectioned>
                            <Box paddingBlock="800">
                                <InlineStack align="center" blockAlign="center">
                                    <Spinner accessibilityLabel="Loading dashboard" size="large" />
                                </InlineStack>
                            </Box>
                        </Card>
                    </Layout.Section>
                </Layout>
            </Page>
        );
    }

    return (
        <Page
            title="Dashboard"
            subtitle="Analyze SEO points and manage authors for your blogs"
        >
            <Layout>
                {/* Plan Status Banner */}
                {(isPlanExpired || isPlanPending || noPlanSelected) && (
                    <Layout.Section>
                        <Banner
                            title={
                                isPlanExpired
                                    ? "Your plan has expired"
                                    : isPlanPending
                                        ? "Payment pending"
                                        : "No plan selected"
                            }
                            tone={isPlanExpired ? "critical" : "warning"}
                            action={{
                                content: "View Plans",
                                onAction: () => navigate("/pricing"),
                            }}
                        >
                            {isPlanExpired
                                ? "Please upgrade your plan to continue optimizing your blogs."
                                : isPlanPending
                                    ? "Complete your payment to activate your plan."
                                    : "Choose a plan to start optimizing your Shopify blogs."}
                        </Banner>
                    </Layout.Section>
                )}

                {/* Statistics Cards */}
                <Layout.Section>
                    <InlineGrid columns={{ xs: 1, sm: 2, md: 3, lg: 3 }} gap="400">
                        <Card>
                            <BlockStack gap="200">
                                <Text variant="headingSm" tone="subdued">
                                    Total Blogs
                                </Text>
                                <Text variant="heading2xl" as="h2">
                                    {stats?.totalBlogs}
                                </Text>
                                <Text variant="bodySm" tone="subdued">
                                    {stats?.totalArticles} articles total
                                </Text>
                            </BlockStack>
                        </Card>

                        <Card>
                            <BlockStack gap="200">
                                <Text variant="headingSm" tone="subdued">
                                    Current Plan
                                </Text>
                                <InlineStack gap="200" align="start">
                                    <Text variant="heading2xl" as="h2">
                                        {currentPlan?.title || "Free Plan"}
                                    </Text>
                                    {isPlanActive && (
                                        <Badge tone="success">Active</Badge>
                                    )}
                                </InlineStack>
                                <Text variant="bodySm" tone="subdued">
                                    {planLimit === Infinity
                                        ? "Unlimited blogs"
                                        : `Up to ${planLimit} blogs/month`}
                                </Text>
                            </BlockStack>
                        </Card>

                        <Card>
                            <BlockStack gap="200">
                                <Text variant="headingSm" tone="subdued">
                                    Quick Actions
                                </Text>
                                <Text variant="bodyMd" tone="subdued">
                                    Start optimizing your blogs
                                </Text>
                                <Box paddingBlockStart="200">
                                    <Button
                                        variant="primary"
                                        onClick={() => navigate("/blog-optimization")}
                                        disabled={noPlanSelected}
                                    >
                                        Optimize Blogs
                                    </Button>
                                </Box>
                            </BlockStack>
                        </Card>
                    </InlineGrid>
                </Layout.Section>

                {/* Main Content Grid */}
                <Layout.Section>
                    <InlineGrid columns={{ xs: 1, lg: 2 }} gap="400">
                        {/* Recent Blogs */}
                        <Card>
                            <BlockStack gap="400">
                                <InlineStack align="space-between">
                                    <Text variant="headingMd" as="h2">
                                        Recent Blogs
                                    </Text>
                                    <Button
                                        plain
                                        onClick={() => navigate("/blog-optimization")}
                                    >
                                        View all
                                    </Button>
                                </InlineStack>
                                <Divider />
                                {recentBlogs?.length === 0 ? (
                                    <EmptyState
                                        heading="No blogs found"
                                        action={{
                                            content: "Add blogs in Shopify",
                                            onAction: () =>
                                                window.open(
                                                    `https://${shop}/admin/blogs`,
                                                    "_blank"
                                                ),
                                        }}
                                        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                                    >
                                        <p>
                                            Create blogs and articles in your
                                            Shopify admin to start optimizing
                                            them here.
                                        </p>
                                    </EmptyState>
                                ) : (
                                    <BlockStack gap="300">
                                        {recentBlogs?.slice(0, 4).map((blog, index) => (
                                            <Box
                                                key={index}
                                                paddingBlock="200"
                                            >
                                                <BlockStack gap="100">
                                                    <InlineStack
                                                        align="space-between"
                                                        blockAlign="start"
                                                    >
                                                        <BlockStack gap="050">
                                                            <Text
                                                                variant="bodyMd"
                                                                fontWeight="semibold"
                                                                as="p"
                                                            >
                                                                {blog?.articleTitle}
                                                            </Text>
                                                            <Text
                                                                variant="bodySm"
                                                                tone="subdued"
                                                            >
                                                                {blog?.blogTitle}
                                                            </Text>
                                                        </BlockStack>
                                                        {/* <Button
                                                            size="slim"
                                                            onClick={() =>
                                                                handleViewBlog(blog)
                                                            }
                                                            disabled={
                                                                noPlanSelected
                                                            }
                                                        >
                                                            Analyze
                                                        </Button> */}
                                                    </InlineStack>
                                                    {index <
                                                        Math.min(recentBlogs.length, 4) -
                                                        1 && <Divider />}
                                                </BlockStack>
                                            </Box>
                                        ))}
                                    </BlockStack>
                                )}
                            </BlockStack>
                        </Card>

                        {/* Quick Access Features */}
                        <Card>
                            <BlockStack gap="400">
                                <Text variant="headingMd" as="h2">
                                    Quick Access
                                </Text>
                                <Divider />
                                <BlockStack gap="300">
                                    {/* <Card sectioned>
                                        <InlineStack
                                            align="space-between"
                                            blockAlign="center"
                                        >
                                            <InlineStack gap="300">
                                                <Icon
                                                    source={SearchIcon}
                                                    tone="base"
                                                />
                                                <BlockStack gap="050">
                                                    <Text
                                                        variant="bodyMd"
                                                        fontWeight="semibold"
                                                    >
                                                        SEO Analysis
                                                    </Text>
                                                    <Text
                                                        variant="bodySm"
                                                        tone="subdued"
                                                    >
                                                        Check SEO points and
                                                        optimize your blogs
                                                    </Text>
                                                </BlockStack>
                                            </InlineStack>
                                            <Button
                                                size="slim"
                                                onClick={() =>
                                                    navigate("/blog-post")
                                                }
                                                disabled={noPlanSelected}
                                            >
                                                Go
                                            </Button>
                                        </InlineStack>
                                    </Card> */}

                                    <Card sectioned>
                                        <InlineStack
                                            align="space-between"
                                            blockAlign="center"
                                        >
                                            <InlineStack gap="300">
                                                <Icon
                                                    source={PersonIcon}
                                                    tone="base"
                                                />
                                                <BlockStack gap="050">
                                                    <Text
                                                        variant="bodyMd"
                                                        fontWeight="semibold"
                                                    >
                                                        Manage Authors
                                                    </Text>
                                                    <Text
                                                        variant="bodySm"
                                                        tone="subdued"
                                                    >
                                                        Create authors and assign
                                                        them to your blog posts
                                                    </Text>
                                                </BlockStack>
                                            </InlineStack>
                                            <Button
                                                size="slim"
                                                onClick={() =>
                                                    navigate("/manage-authors")
                                                }
                                            >
                                                Go
                                            </Button>
                                        </InlineStack>
                                    </Card>
                                    <Card sectioned>
                                        <InlineStack
                                            align="space-between"
                                            blockAlign="center"
                                        >
                                            <InlineStack gap="300">
                                                <Icon
                                                    source={PasskeyIcon}
                                                    tone="base"
                                                />
                                                <BlockStack gap="050">
                                                    <Text
                                                        variant="bodyMd"
                                                        fontWeight="semibold"
                                                    >
                                                       Assign Authors to Blogs
                                                    </Text>
                                                    <Text
                                                        variant="bodySm"
                                                        tone="subdued"
                                                    >
                                                        Assign authors to your blog posts
                                                    </Text>
                                                </BlockStack>
                                            </InlineStack>
                                            <Button
                                                size="slim"
                                                onClick={() =>
                                                    navigate("/assign-authors")
                                                }
                                            >
                                                Go
                                            </Button>
                                        </InlineStack>
                                    </Card>
                                    <Card sectioned>
                                        <InlineStack
                                            align="space-between"
                                            blockAlign="center"
                                        >
                                            <InlineStack gap="300">
                                                <Icon
                                                    source={ChartVerticalFilledIcon}
                                                    tone="base"
                                                />
                                                <BlockStack gap="050">
                                                    <Text
                                                        variant="bodyMd"
                                                        fontWeight="semibold"
                                                    >
                                                       Blog Optimization
                                                    </Text>
                                                    <Text
                                                        variant="bodySm"
                                                        tone="subdued"
                                                    >
                                                       Optimize your blog posts
                                                    </Text>
                                                </BlockStack>
                                            </InlineStack>
                                            <Button
                                                size="slim"
                                                onClick={() =>
                                                    navigate("/blog-optimization")
                                                }
                                            >
                                                Go
                                            </Button>
                                        </InlineStack>
                                    </Card>

                                    <Card sectioned>
                                        <InlineStack
                                            align="space-between"
                                            blockAlign="center"
                                        >
                                            <InlineStack gap="300">
                                                <Icon
                                                    source={CreditCardIcon}
                                                    tone="base"
                                                />
                                                <BlockStack gap="050">
                                                    <Text
                                                        variant="bodyMd"
                                                        fontWeight="semibold"
                                                    >
                                                        Pricing & Plans
                                                    </Text>
                                                    <Text
                                                        variant="bodySm"
                                                        tone="subdued"
                                                    >
                                                        View and upgrade your
                                                        plan
                                                    </Text>
                                                </BlockStack>
                                            </InlineStack>
                                            <Button
                                                size="slim"
                                                onClick={() =>
                                                    navigate("/pricing")
                                                }
                                            >
                                                Go
                                            </Button>
                                        </InlineStack>
                                    </Card>

                                    <Card sectioned>
                                        <InlineStack
                                            align="space-between"
                                            blockAlign="center"
                                        >
                                            <InlineStack gap="300">
                                                <Icon
                                                    source={QuestionCircleIcon}
                                                    tone="base"
                                                />
                                                <BlockStack gap="050">
                                                    <Text
                                                        variant="bodyMd"
                                                        fontWeight="semibold"
                                                    >
                                                        Support
                                                    </Text>
                                                    <Text
                                                        variant="bodySm"
                                                        tone="subdued"
                                                    >
                                                        Get help and contact
                                                        support
                                                    </Text>
                                                </BlockStack>
                                            </InlineStack>
                                            <Button
                                                size="slim"
                                                onClick={() =>
                                                    navigate("/support")
                                                }
                                            >
                                                Go
                                            </Button>
                                        </InlineStack>
                                    </Card>
                                </BlockStack>
                            </BlockStack>
                        </Card>
                    </InlineGrid>
                </Layout.Section>

                {/* Feature Highlights */}
                <Layout.Section>
                    <Card>
                        <BlockStack gap="400">
                            <Text variant="headingMd" as="h2">
                                Key Features
                            </Text>
                            <Divider />
                            <InlineGrid
                                columns={{ xs: 1, sm: 2, md: 3, lg: 3 }}
                                gap="400"
                            >
                                <BlockStack gap="200">
                                    {/* <InlineStack gap="200" blockAlign="start" align="start"> */}
                                    <InlineGrid alignItems='start' gap='150' columns='20px auto' blockAlign="start" align="start">
                                        <Icon
                                            source={CheckCircleIcon}
                                            tone="success"
                                        />
                                        <Text
                                            variant="headingSm"
                                            fontWeight="semibold"
                                        >
                                            Meta Title & Description
                                        </Text>
                                    </InlineGrid>
                                    <Text variant="bodySm" tone="subdued">
                                        Optimize your meta tags for better
                                        search engine visibility and click-through
                                        rates.
                                    </Text>
                                </BlockStack>

                                <BlockStack gap="200">
                                    <InlineGrid alignItems='start' gap='150' columns='20px auto' blockAlign="start" align="start">
                                        <Icon
                                            source={CheckCircleIcon}
                                            tone="success"
                                        />
                                        <Text
                                            variant="headingSm"
                                            fontWeight="semibold"
                                        >
                                            Heading Tags (H1–H3)
                                        </Text>
                                    </InlineGrid>
                                    <Text variant="bodySm" tone="subdued">
                                        Ensure proper heading structure for SEO
                                        and improved readability.
                                    </Text>
                                </BlockStack>

                                <BlockStack gap="200">
                                    <InlineGrid alignItems='start' gap='150' columns='20px auto' blockAlign="start" align="start">
                                        <Icon
                                            source={CheckCircleIcon}
                                            tone="success"
                                        />
                                        <Text
                                            variant="headingSm"
                                            fontWeight="semibold"
                                        >
                                            Internal & External Links
                                        </Text>
                                    </InlineGrid>
                                    <Text variant="bodySm" tone="subdued">
                                        Analyze and optimize your link strategy
                                        for better SEO performance.
                                    </Text>
                                </BlockStack>

                                <BlockStack gap="200">
                                    <InlineGrid alignItems='start' gap='150' columns='20px auto' blockAlign="start" align="start">
                                        <Icon
                                            source={CheckCircleIcon}
                                            tone="success"
                                        />
                                        <Text
                                            variant="headingSm"
                                            fontWeight="semibold"
                                        >
                                            Author Management
                                        </Text>
                                    </InlineGrid>
                                    <Text variant="bodySm" tone="subdued">
                                        Create and manage authors, then assign
                                        them to your blog posts to build trust
                                        and authority.
                                    </Text>
                                </BlockStack>

                                <BlockStack gap="200">
                                    <InlineGrid alignItems='start' gap='150' columns='20px auto' blockAlign="start" align="start">
                                        <Icon
                                            source={ChartVerticalFilledIcon}
                                            tone="base"
                                        />
                                        <Text
                                            variant="headingSm"
                                            fontWeight="semibold"
                                        >
                                            SEO Scoring
                                        </Text>
                                    </InlineGrid>
                                    <Text variant="bodySm" tone="subdued">
                                        Check SEO points and get comprehensive
                                        scores with detailed improvement
                                        recommendations.
                                    </Text>
                                </BlockStack>
                            </InlineGrid>
                        </BlockStack>
                    </Card>
                </Layout.Section>

                {/* Call to Action */}
                {stats.totalArticles > 0 && (
                    <Layout.Section>
                        <Card sectioned>
                            <InlineStack
                                align="space-between"
                                blockAlign="center"
                            >
                                <BlockStack gap="200">
                                    <Text variant="headingMd" as="h2">
                                        Ready to optimize your blogs?
                                    </Text>
                                    <Text variant="bodyMd" tone="subdued">
                                        Check SEO points, optimize your blogs,
                                        and assign authors to improve your
                                        search rankings.
                                    </Text>
                                </BlockStack>
                                <Button
                                    variant="primary"
                                    size="large"
                                    onClick={() => navigate("/blog-optimization")}
                                    disabled={noPlanSelected}
                                >
                                    Start Analyzing
                                </Button>
                            </InlineStack>
                        </Card>
                    </Layout.Section>
                )}
            </Layout>
        </Page>
    );
};

export default HomePage;
