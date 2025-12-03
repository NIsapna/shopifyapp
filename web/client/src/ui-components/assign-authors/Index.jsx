import React, { useMemo, useState, useContext, useEffect } from "react";
import ShopContext from "../../utlis/ShopContext";
import { useGetBlogsQuery } from "../../store/blogsApi";
import { useGetAllAuthorsQuery } from "../../store/authorApi";
import { useGenerateSnippetMutation } from "../../store/snippetApi";
import { capitalizeName } from "../../utlis/helper";
import { usePlan } from "../../context/PlanContext";
import {
    Card,
    Layout,
    Avatar,
    Box,
    Text,
    Button,
    Spinner,
    Banner,
    EmptyState,
    InlineStack,
    DataTable,
    Pagination
} from "@shopify/polaris";
import UpgradeOverlay from "../comman/UpgradeOverlay";
import NoPlanOverlay from "../comman/NoPlanLayout";

function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

const ROWS_PER_PAGE = 5;

const AssignAuthorstoBlog = () => {
    const shop = useContext(ShopContext);

    // Fetch authors FIRST: this avoids "Cannot access ____ before initialization"
    const { data: authorsData, isLoading: loadingAuthors, isError: authorsError, error: authorsErrorData } = useGetAllAuthorsQuery(shop, {
        skip: !shop,
    });
    const authors = authorsData?.data || [];

    // Pagination state
    const [page, setPage] = useState(0);
    const [selectedAuthorId, setSelectedAuthorId] = useState("");
    const [assigning, setAssigning] = useState(false);
    const [assignError, setAssignError] = useState("");
    const [assignSuccess, setAssignSuccess] = useState(false);

    // Single blog assignment state
    const [singleAssignBlog, setSingleAssignBlog] = useState(null); // { id, title, blogId, articleId }
    const [singleSelectedAuthorId, setSingleSelectedAuthorId] = useState("");
    const [singleAssigning, setSingleAssigning] = useState(false);
    const [singleAssignError, setSingleAssignError] = useState("");
    const [singleAssignSuccess, setSingleAssignSuccess] = useState(false);
    const [lastAssignedAuthorId, setLastAssignedAuthorId] = useState(null);
    // const { planName, isPlanActive, noPlanSelected, isPlanExpired, isPlanPending } = usePlan();

    // Fetch real blogs data
    const { data: blogsData, isLoading: loading, isError, refetch: refetchBlogs } = useGetBlogsQuery({ shop }, { skip: !shop });

    // Assign author mutation
    const [generateSnippet] = useGenerateSnippetMutation();

    // Process blogs data to extract articles
    const blogs = useMemo(() => {
        if (!blogsData?.data?.data?.blogs?.edges) return [];

        const articles = [];
        blogsData.data.data.blogs.edges.forEach((blogEdge) => {
            const blogNode = blogEdge.node;
            const articleEdges = blogNode.articles?.edges || [];

            articleEdges.forEach((articleEdge) => {
                const articleNode = articleEdge.node;
                articles.push({
                    id: articleNode?.id, // Use article ID as the unique identifier
                    title: articleNode?.title || "Untitled",
                    status: "Published", // Articles from Shopify are typically published
                    author: articleNode?.author?.name || "-",
                    blog: blogNode?.title || "Untitled Blog",
                    blogId: blogNode?.id,
                    articleId: articleNode?.id, // Article ID for navigation
                    publishedAt: null, // publishedAt not available in the GraphQL query
                    image: articleNode?.image?.src || articleNode?.image?.originalSrc || "",
                });
            });
        });

        return articles;
    }, [blogsData]);

    // Slice for pagination
    const pagedBlogs = blogs.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE);

    const hasPreviousPage = page > 0;
    const hasNextPage = (page + 1) * ROWS_PER_PAGE < blogs.length;

    // Determine state for assignment modal logic
    const selectedAuthorObj = singleSelectedAuthorId
        ? authors.find((a) => a._id === singleSelectedAuthorId)
        : null;

    // Check if selected author is already assigned to blog (by name match)
    // const isAlreadyAssigned = useMemo(() => {
    //     if (
    //         singleAssignBlog &&
    //         singleSelectedAuthorId &&
    //         selectedAuthorObj &&
    //         selectedAuthorObj.name &&
    //         singleAssignBlog.author &&
    //         selectedAuthorObj.name.trim().toLowerCase() === singleAssignBlog.author.trim().toLowerCase()
    //     ) {
    //         return true;
    //     }
    //     return false;
    // }, [singleAssignBlog, singleSelectedAuthorId, selectedAuthorObj]);

    // Check if selected author has no bio (for assignment blocking)
    const noBioBlockingMsg =
        selectedAuthorObj &&
            (!selectedAuthorObj.bio || selectedAuthorObj.bio.trim() === "")
            ? "You can't assign an author without a bio. Please add a bio to this author under Manage Authors first."
            : "";

    // Final assign button state logic
    const assignButtonDisabled = !singleSelectedAuthorId ||
        singleAssigning ||
        loadingAuthors ||
        // isAlreadyAssigned ||
        (!!noBioBlockingMsg);

    // Handle single blog author assignment
    const handleSingleAssignAuthor = async () => {
        if (!singleSelectedAuthorId) {
            setSingleAssignError("Please select an author.");
            return;
        }

        if (!singleAssignBlog) {
            setSingleAssignError("No blog selected.");
            return;
        }

        // Check if selected author has a bio FIRST (before checking if already assigned)
        if (noBioBlockingMsg) {
            setSingleAssignError(noBioBlockingMsg);
            return;
        }

        // Only check if author is already assigned AFTER confirming they have a bio
        // if (isAlreadyAssigned) {
        //     setSingleAssignError("This author is already assigned to this blog.");
        //     return;
        // }


        setSingleAssigning(true);
        setSingleAssignError("");
        setSingleAssignSuccess(false);

        try {
            const payload = {
                shop,
                blogId: singleAssignBlog.blogId || "",
                articleId: singleAssignBlog.articleId || singleAssignBlog.id,
                authorId: singleSelectedAuthorId,
            };

            const result = await generateSnippet(payload).unwrap();

            if (result?.success) {
                setSingleAssignSuccess(true);
                setLastAssignedAuthorId(singleSelectedAuthorId);
                // Refetch blogs data only
                await refetchBlogs();

                // Show success toast
                if (window.shopify && shopify.toast) {
                    await shopify.toast.show(
                        `Blog updated successfully.`,
                        { duration: 3000 }
                    );
                }

                // Close modal after a short delay
                setTimeout(() => {
                    const modal = document.getElementById("single-assign-author-modal");
                    if (modal && modal.hideOverlay) {
                        modal.hideOverlay();
                    }
                    setSingleAssignSuccess(false);
                    setSingleAssignBlog(null);
                    setLastAssignedAuthorId(null);
                }, 1500);
            } else {
                setSingleAssignError("Failed to assign author. Please try again.");
            }
        } catch (error) {
            setSingleAssignError(error?.data?.message || "Failed to assign author. Please try again.");
            if (window.shopify && shopify.toast) {
                await shopify.toast.show("Failed to assign author. Please try again.", {
                    duration: 3000,
                });
            }
        } finally {
            setSingleAssigning(false);
        }
    };

    // Handle single assign author button click
    const handleSingleAssignAuthorClick = (blog) => {
        setSingleAssignBlog(blog);
        setSingleSelectedAuthorId("");
        setSingleAssignError("");
        setSingleAssignSuccess(false);
        setLastAssignedAuthorId(null);
    };


    useEffect(() => {
        const modal = document.getElementById("single-assign-author-modal");
        if (modal) {
            const handleHide = () => {
                if (!singleAssigning) {
                    setSingleSelectedAuthorId("");
                    setSingleAssignError("");
                    setSingleAssignSuccess(false);
                    setSingleAssignBlog(null);
                    setLastAssignedAuthorId(null);
                }
            };
            modal.addEventListener("hide", handleHide);
            return () => {
                modal.removeEventListener("hide", handleHide);
            };
        }
    }, [singleAssigning]);

    useEffect(() => {
        setLastAssignedAuthorId(null);
    }, [singleAssignBlog?.id]);

    // DataTable rows construction:
    const datatableRows = pagedBlogs.map((blog) => [
        // Title cell
        <InlineStack gap="400" blockAlign="center" wrap={false} key={`title-inline-${blog.id}`}>
            <Box>
                {blog.image ? (
                    <Avatar
                        source={blog.image}
                        alt={blog.title || "Blog article"}
                        size="md"
                    />
                ) : (
                    <Avatar size="md" name={blog.title || "Blog"} />
                )}
            </Box>
            <div>
                <Text fontWeight="bodyMd" as="h3" variant="bodyMd" truncate>
                    {blog?.title}
                </Text>
            </div>
        </InlineStack>,

        // Blog Name cell
        <Text variant="bodyMd" truncate key={`blogname-${blog.id}`}>{blog.blog}</Text>,

        // Author Name cell
        <Text variant="bodyMd" truncate key={`author-${blog.id}`}>{blog.author}</Text>,

        // Actions: Assign Author button
        <Button
            key={`assign-btn-${blog.id}`}
            variant="secondary"
            size="slim"
            onClick={(e) => {
                e.stopPropagation();
                handleSingleAssignAuthorClick(blog);
                const modal = document.getElementById("single-assign-author-modal");
                if (modal && modal.showOverlay) {
                    modal.showOverlay();
                }
            }}
            style={{ flexShrink: 0, whiteSpace: "nowrap" }}
            // disabled={noPlanSelected || isPlanExpired || isPlanPending}
        >
            Assign Author
        </Button>
    ]);

    return (
        <Layout>
            {/* <Layout.Section>
                {isPlanExpired && (
                    <UpgradeOverlay message="Your plan expired! Please upgrade your plan to assign authors to your blog." />
                )}

                {isPlanPending && (
                    <>
                        <NoPlanOverlay message="Your payment is not completed. Please purches the plan. " />
                    </>
                )}
                {noPlanSelected &&
                    <div className="relative min-h-screen">
                        <NoPlanOverlay message="You don't have any plan selected yet. Please choose one to get benifits of app." />
                    </div>
                }
            </Layout.Section> */}
            <Layout.Section>
                <Card sectioned>
                    <Text as="h2" variant="headingMd">Manage Blog Article Authors</Text>
                    <s-box paddingBlockStart="small">
                        <s-text variant="bodySm" tone="subdued">
                            Assign an author to an individual blog article. Use the table below to select an article and add or update its author.
                        </s-text>
                    </s-box>
                </Card>
            </Layout.Section>

            {/* Authors Loading State */}
            {loadingAuthors && (
                <Layout.Section>
                    <Card sectioned>
                        <Box padding="800" style={{ textAlign: "center" }}>
                            <Spinner size="large" />
                            <Box paddingBlockStart="400">
                                <Text variant="bodyMd" tone="subdued">Loading authors...</Text>
                            </Box>
                        </Box>
                    </Card>
                </Layout.Section>
            )}

            {/* Authors Error State */}
            {!loadingAuthors && authorsError && (
                <Layout.Section>
                    <Card sectioned>
                        <Banner tone="critical">
                            {authorsErrorData?.data?.message || "Failed to load authors. Please try again."}
                        </Banner>
                    </Card>
                </Layout.Section>
            )}

            {/* Authors Empty State */}
            {!loadingAuthors && !authorsError && authors.length === 0 && (
                <Layout.Section>
                    <Card sectioned>
                        <Box padding="800" style={{ textAlign: "center" }}>
                            <EmptyState
                                heading="No authors found"
                                action={{
                                    content: "Create Author",
                                    onAction: () => window.location.href = "/manage-authors",
                                }}
                                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                            >
                                <p>
                                    You don't have any authors yet. Create an author first to assign them to blog articles.
                                </p>
                            </EmptyState>
                        </Box>
                    </Card>
                </Layout.Section>
            )}

            {/* Blogs Section - Only show when authors are loaded successfully */}
            {!loadingAuthors && !authorsError && authors.length > 0 && (
                <Layout.Section>
                    {loading ? (
                        <Card sectioned>
                            <Box padding="800" style={{ textAlign: "center" }}>
                                <Spinner size="large" />
                            </Box>
                        </Card>
                    ) : isError ? (
                        <Card sectioned>
                            <Box padding="800" style={{ textAlign: "center" }}>
                                <Banner tone="critical">
                                    Error loading blogs. Please try again.
                                </Banner>
                            </Box>
                        </Card>
                    ) : blogs.length === 0 ? (
                        <Card sectioned>
                            <Box padding="800" style={{ textAlign: "center" }}>
                                <EmptyState
                                    heading="No blogs found"
                                    action={{
                                        content: "Add blogs ",
                                        onAction: () =>
                                            window.open(`https://${shop}/admin/blogs`, "_blank"),
                                    }}
                                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                                >
                                    <p>
                                        You don't have any blogs yet. Add a blog and articles in your Shopify admin to start analyzing and optimizing them here.
                                    </p>
                                </EmptyState>
                            </Box>
                        </Card>
                    ) : (
                        <Card sectioned>
                            <DataTable
                                columnContentTypes={["text", "text", "text", "text"]}
                                headings={[
                                    "Title",
                                    "Blog",
                                    "Author",
                                    "Actions"
                                ]}
                                rows={datatableRows}
                            // No row click/selection, so leave other DataTable props default
                            />
                            {/* Pagination controls with Polaris Pagination */}
                            <Box
                                padding="base"
                                borderBlockStartWidth="025"
                                borderColor="border-subdued"
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                    gap: "12px"
                                }}
                            >
                                <Pagination
                                    hasPrevious={hasPreviousPage}
                                    onPrevious={() => setPage((p) => Math.max(0, p - 1))}
                                    hasNext={hasNextPage}
                                    onNext={() => setPage((p) => (hasNextPage ? p + 1 : p))}
                                    label={`Page ${page + 1} of ${Math.max(1, Math.ceil(blogs.length / ROWS_PER_PAGE))}`}
                                />
                            </Box>
                        </Card>
                    )}
                </Layout.Section>
            )}

            {/* Single Assign Author Modal */}
            <s-modal
                id="single-assign-author-modal"
                heading="Assign Author to Blog"
                size="medium"
            >
                <s-box paddingBlockStart="base" paddingBlockEnd="base">
                    <s-box style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {/* Blog Article Info */}
                        {singleAssignBlog && (
                            <s-box
                                padding="base"
                                background="surface-subdued"
                                borderWidth="025"
                                borderColor="border-subdued"
                                borderRadius="base"
                            >
                                <s-text variant="bodySm" tone="subdued" style={{ marginBottom: "8px", display: "block" }}>
                                    Blog Article : 
                                </s-text>
                                <s-text variant="bodyMd" fontWeight="medium">
                                    {singleAssignBlog.title}
                                </s-text>
                            </s-box>
                        )}  

                        <s-box padding="base">
                            <s-text variant="bodyMd" fontWeight="medium" style={{ marginBottom: "8px", display: "block" }}>
                                Select Author
                            </s-text>
                            <select
                                id="single-author-select"
                                value={singleSelectedAuthorId}
                                onChange={(e) => {
                                    setSingleSelectedAuthorId(e.target.value);
                                    setSingleAssignError("");
                                    setSingleAssignSuccess(false);
                                }}
                                disabled={singleAssigning || loadingAuthors}
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    fontSize: "14px",
                                    border: "1px solid #c9cccf",
                                    borderRadius: "6px",
                                    backgroundColor: (singleAssigning || loadingAuthors) ? "#f6f6f7" : "white",
                                    color: "#202223",
                                    cursor: (singleAssigning || loadingAuthors) ? "not-allowed" : "pointer",
                                }}
                            >
                                <option value="">Choose an author...</option>
                                {authors.map((author) => (
                                    <option key={author._id} value={author._id}>
                                        {capitalizeName(author.name || "Unnamed Author")}
                                    </option>
                                ))}
                            </select>
                        </s-box>

                        {/* Loading Authors */}
                        {loadingAuthors && (
                            <s-box padding="base" style={{ textAlign: "center" }}>
                                <s-box style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                    <s-spinner size="small" />
                                    <s-text variant="bodySm" tone="subdued">
                                        Loading authors...
                                    </s-text>
                                </s-box>
                            </s-box>
                        )}

                        {/* No Authors Available */}
                        {!loadingAuthors && authors.length === 0 && (
                            <s-box padding="base" style={{ textAlign: "center" }}>
                                <s-text variant="bodySm" tone="subdued">
                                    No authors available. Please create an author first.
                                </s-text>
                            </s-box>
                        )}

                        {/* No Bio Banner - Check FIRST before "already assigned" */}
                        {noBioBlockingMsg && (
                            <s-banner tone="critical">
                                {noBioBlockingMsg}
                            </s-banner>
                        )}

                        {/* Already Assigned Banner - Only show if author has bio */}
                        {/* {!noBioBlockingMsg && isAlreadyAssigned && (
                            <s-banner tone="info">
                                This author is already assigned to this blog.
                            </s-banner>
                        )} */}

                        {/* Error Banner */}
                        {singleAssignError && !noBioBlockingMsg  && (
                            <s-banner tone="critical">
                                {singleAssignError}
                            </s-banner>
                        )}

                        {/* Success Banner */}
                        {singleAssignSuccess && (
                            <s-banner tone="success">
                                Author assigned successfully!
                            </s-banner>
                        )}
                    </s-box>
                </s-box>

                {/* Secondary action button */}
                <s-button
                    slot="secondary-actions"
                    variant="secondary"
                    commandFor="single-assign-author-modal"
                    command="--hide"
                    disabled={singleAssigning}
                >
                    Cancel
                </s-button>

                {/* Primary action button */}
                <s-button
                    slot="primary-action"
                    variant="primary"
                    onClick={async (e) => {
                        e.preventDefault();
                        await handleSingleAssignAuthor();
                    }}
                    disabled={assignButtonDisabled}
                >
                    {singleAssigning ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                            <s-spinner size="small" />
                            <span>Assigning...</span>
                        </span>
                    ) : (
                        "Assign Author"
                    )}
                </s-button>
            </s-modal>
        </Layout>
    );
};

export default AssignAuthorstoBlog;
