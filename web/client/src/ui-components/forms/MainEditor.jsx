// src/components/forms/MainEditor.jsx
import { useState, useEffect, useContext, useMemo } from "react";
import { Card, TextField, Button, BlockStack, Text, Box, Banner, Spinner, Select, Icon, Avatar, InlineStack } from "@shopify/polaris";
import {
  XIcon
} from '@shopify/polaris-icons';
import { RichTextEditor } from "../text-editor/RichTextEditor";
import { getMetafieldValue, capitalizeName } from "../../utlis/helper";
import "./rich-text-editor.css";
import EditAuthorForm from "./EditAuthorForm";
import { useDispatch, useSelector } from "react-redux";
import ShopContext from "../../utlis/ShopContext";
import { useGetAllAuthorsQuery } from "../../store/authorApi";
import { useGenerateSnippetMutation, useGetAllAssignAuthorQuery } from "../../store/snippetApi";
import { useGetBlogByIdQuery } from "../../store/blogsApi";
import { disableEditMode, setSelectedBlogData } from "../../store/blogSlice";
import { useGetActivePlanQuery } from "../../store/pricingApi";
import { usePlan } from "../../context/PlanContext";

export default function MainEditor({ blog, onSave, isLoading, errorMsg, setErrorMsg }) {
  const dispatch = useDispatch();
  const shop = useContext(ShopContext);
  const { planName, isPlanActive, noPlanSelected, isPlanExpired, isPlanPending } = usePlan();

  // ======================
  // assigned authors
  // ======================
  const { selectedBlogId, selectedBlogData, editMode } = useSelector((state) => state.blog);

  const { data: assignedAuthor, error: assignErr, isLoading: loadAssignAuth } = useGetAllAssignAuthorQuery({
    shop: shop,
    blogId: selectedBlogData?.blog?.id,
    articleId: selectedBlogData?.id,
  },
    { skip: !selectedBlogData?.id, refetchOnMountOrArgChange: true }
  );
  const authorsToShow = loadAssignAuth ? {} : assignedAuthor?.authorsData || {};

  // Get all authors
  const { data, isFetching } = useGetAllAuthorsQuery(shop);
  const authors = data?.data || [];
  const [generateSnippet, { isLoading: isAssigning }] = useGenerateSnippetMutation();
  const { refetch } = useGetBlogByIdQuery(
    { shop, id: blog?.id },
    { skip: !blog?.id }
  );

  // ======================
  // Core editor states
  // ======================
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [charCount, setCharCount] = useState(0);

  // Char count states for meta title & description
  const [metaTitleCount, setMetaTitleCount] = useState(0);
  const [metaDescriptionCount, setMetaDescriptionCount] = useState(0);

  // ======================
  // Author section states
  // ======================
  const [selectedAuthorId, setSelectedAuthorId] = useState("");
  const [authorError, setAuthorError] = useState("");
  const [authorSuccess, setAuthorSuccess] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const selectedAuthor = useMemo(
    () => authors.find((a) => a._id === selectedAuthorId),
    [selectedAuthorId, authors]
  );

  const options = authors.map((author) => ({
    label: capitalizeName(author?.name),
    value: author?._id,
  }));

  // Use a local state to cache the last assigned author id after assignment (to prevent race between loading authorsToShow after assigning)
  const [lastAssignedAuthorId, setLastAssignedAuthorId] = useState(null);

  // Derived: Check if a selected author is already assigned;
  // Don't show 'already assigned' banner immediately after success assignment (when authorSuccess === true and it's the one just assigned)
  const isAlreadyAssigned = useMemo(() => {
    if (
      authorSuccess === true &&
      selectedAuthorId &&
      lastAssignedAuthorId &&
      selectedAuthorId === lastAssignedAuthorId
    ) {
      return false;
    }
    return (
      selectedAuthorId &&
      authorsToShow &&
      authorsToShow?._id === selectedAuthorId &&
      authorsToShow?.is_assign === true
    );
  }, [selectedAuthorId, authorsToShow, authorSuccess, lastAssignedAuthorId]);

  // Compute assigned author display info
  const assignedAuthorObj = useMemo(() => {
    if (!authorsToShow?._id) return null;
    // Try to get the details from the authors list for name/avatar
    const match = authors.find(a => a._id === authorsToShow?._id);
    if (match) {
      return match;
    }
    // Fallback to bare details from API
    return authorsToShow;
  }, [authorsToShow, authors]);

  // ======================
  // Initialize editor
  // ======================
  useEffect(() => {
    if (blog) {
      const initialMetaTitle = getMetafieldValue(blog, "metaTitle") || "";
      const initialMetaDescription = getMetafieldValue(blog, "metaDescription") || "";
      setMetaTitle(initialMetaTitle);
      setMetaDescription(initialMetaDescription);
      setBodyHtml(blog?.body || "");
      setCharCount(blog?.body?.length || 0);
      setMetaTitleCount(initialMetaTitle.length);
      setMetaDescriptionCount(initialMetaDescription.length);
    }
  }, [blog]);

  // ======================
  // Handlers
  // ======================

  const handleMetaTitleChange = (val) => {
    setMetaTitle(val);
    setMetaTitleCount(val.length);
  };

  const handleMetaDescriptionChange = (val) => {
    setMetaDescription(val);
    setMetaDescriptionCount(val.length);
  };

  const handleBodyChange = (value) => {
    // Remove HTML tags before counting
    const plainText = value.replace(/<[^>]+>/g, "");
    setCharCount(plainText.length);
    setBodyHtml(value);
  };

  const handleSaveAll = () => {
    const formData = new FormData();
    formData.append("id", blog?.id);
    formData.append("blog_id", blog?.blog?.id);
    formData.append("metaTitle", metaTitle);
    formData.append("metaDescription", metaDescription);
    formData.append("body_html", bodyHtml);

    onSave("all_fields", formData); // call API once
  };

  const handleAssignAuthor = async () => {
    setAuthorError("");
    setAuthorSuccess("");
    setSuccessMsg("");
    if (!selectedAuthorId) {
      setAuthorError("Please select an author before saving.");
      return;
    }

    if (
      selectedAuthorId &&
      authorsToShow &&
      authorsToShow?._id === selectedAuthorId &&
      authorsToShow?.is_assign === true
    ) {
      setAuthorError("This author is already assigned to this blog.");
      setAuthorSuccess(false);
      return;
    }

    const selected = authors.find((a) => a._id === selectedAuthorId);
    if (selected?.is_defaut_author && !selected?.bio) {
      setAuthorError(
        "This author does not have a bio. Please go to Manage authors to add a bio for this author before assigning."
      );
      return;
    }

    try {
      const payload = {
        shop,
        blogId: blog?.blog?.id || "",
        articleId: blog?.id,
        authorId: selectedAuthorId,
      };

      const res = await generateSnippet(payload).unwrap();

      if (!res?.success) {
        setAuthorError(res?.snippet?.message || res?.message || "Failed to assign author. Please try again.");
        setAuthorSuccess(false);
        return;
      }

      setAuthorSuccess(true);
      setSuccessMsg("Author assigned successfully.");
      setLastAssignedAuthorId(selectedAuthorId);

      if (window.shopify && shopify.toast) {
        await shopify.toast.show("Author assigned successfully.", { duration: 2000 });
      }

      const { data: updatedBlog } = await refetch();
      dispatch(setSelectedBlogData(updatedBlog?.data));

      setSelectedAuthorId("");
      // dispatch(disableEditMode());
    } catch (err) {
      console.error(err);
      setAuthorError("Failed to assign author. Please try again.");
      setAuthorSuccess(false);
    }
  };

  useEffect(() => {
    if (!selectedAuthorId) {
      setAuthorSuccess(false);
      setSuccessMsg("");
    }
  }, [selectedAuthorId]);

  useEffect(() => {
    setLastAssignedAuthorId(null);
  }, [selectedBlogData?.id]);

  return (
    <>
      <BlockStack gap="400">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Text variant="headingMd">Edit blog details to fix SEO score</Text>

          <div>
            <Button
              variant="plain"
              icon={
                <Icon
                  source={XIcon}
                  tone="base"
                />
              }
              accessibilityLabel="Close editor"
              onClick={() => dispatch(disableEditMode())}
            />
          </div>
        </div>
        <Box
          padding="400"
          background="bg-surface-secondary"
          borderWidth="1"
          borderColor="border-subdued"
          borderRadius="400"
        >
          <BlockStack gap="400">
            <BlockStack gap="100">
              {/* Meta Title */}
              <TextField
                label="Meta Title"
                value={metaTitle}
                onChange={handleMetaTitleChange}
                placeholder="Write a clear, keyword-rich title"
                multiline={3}
              />
              <BlockStack gap="025" align="space-between" inline>
                <Text tone="subdued">Suggested: up to 60 characters</Text>
                <Text tone="subdued" as="span" variant="bodySm">{metaTitleCount} / 60</Text>
              </BlockStack>
            </BlockStack>

            {/* Meta Description */}
            <BlockStack gap="100">
              <TextField
                label="Meta Description"
                value={metaDescription}
                onChange={handleMetaDescriptionChange}
                placeholder="Write a concise summary that describes your blog post."
                multiline={6}
              />
              <BlockStack gap="025" align="space-between" inline>
                <Text tone="subdued">Suggested: up to 160 characters</Text>
                <Text tone="subdued" as="span" variant="bodySm">{metaDescriptionCount} / 160</Text>
              </BlockStack>
            </BlockStack>

            {/* Body HTML */}
            <div className="PolarisRichEditor">
              <RichTextEditor
                label="Blog Body"
                placeholder="Enter your blog content..."
                onChange={handleBodyChange}
                value={bodyHtml || ""}
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, 4, false] }],
                    ["bold", "italic", "underline", "blockquote"],
                    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
                    [{ color: [] }, { background: [] }],
                    ["link", "image"],
                    ["clean"],
                  ],
                }}
              />
              {/* <Text>Character count: {charCount}</Text> */}
            </div>

            {/* Save Button */}
            <div>
              <Button variant="primary" loading={isLoading} onClick={handleSaveAll}>
                Save All
              </Button>
            </div>

            {errorMsg && (
              <Box padding="200" >
                <Banner
                  title="Blog update failed"
                  tone="critical"
                  action={{ content: 'Update plan', url: '/pricing', variant: 'secondary' }}
                  style={{ marginTop: '20px' }}
                  onDismiss={() => setErrorMsg("")}
                >
                  <p>{errorMsg}</p>
                </Banner>
              </Box >
            )}
          </BlockStack>
        </Box >
      </BlockStack >
      <BlockStack gap="400">
        <Text variant="headingMd"></Text>
        <Box
          padding="400"
          background="bg-surface-secondary"
          borderWidth="1"
          borderColor="border-subdued"
          borderRadius="400"
        >

          {/* === Author Assignment Section === */}
          <BlockStack gap="300">
            <Text variant="headingMd">Assign Author</Text>
            
            {/* Show currently assigned author above assign/option */}
            {loadAssignAuth ? (
              <Box padding="200">
                <Spinner accessibilityLabel="Loading assigned author" size="small" />
              </Box>
            ) : assignedAuthorObj ? (
              <Box padding="200">
                <BlockStack gap="100">
                  <Text fontWeight="500" as="span" variant="bodySm">Currently assigned author:</Text>
                  <InlineStack gap="200" align="start">
                    <Avatar
                      customer
                      name={capitalizeName(assignedAuthorObj?.name || "")}
                      source={assignedAuthorObj?.image}
                      size="md"
                    />
                    <div>
                      <Text as="span" variant="bodyMd" fontWeight="bold">{capitalizeName(assignedAuthorObj?.name)}</Text>
                      {assignedAuthorObj?.bio && (
                        <Text as="div" variant="bodySm" tone="subdued" maxWidth="350px" ellipsis>
                          {assignedAuthorObj?.bio}
                        </Text>
                      )}
                    </div>
                  </InlineStack>
                </BlockStack>
              </Box>
            ) : (
              <Box padding="200">
                <Text tone="subdued" as="span" variant="bodySm">
                  No author assigned to this blog yet.
                </Text>
              </Box>
            )}

            {(isPlanExpired || isPlanPending || noPlanSelected) ? (
              <>
                {/* === BLURRED CONTENT === */}
                <div
                  style={{
                    filter: "blur(2px)",
                    pointerEvents: "none",
                    opacity: 0.6,
                  }}
                >
                  {isFetching ? (
                    <Spinner accessibilityLabel="Loading authors" size="large" />
                  ) : authors.length === 0 ? (
                    <Banner
                      tone="info"
                      title="You don't have any authors yet."
                      action={{ content: "Go to Author Management", url: "/authors-page" }}
                    >
                      <Text>Add authors to assign them to your blogs.</Text>
                    </Banner>
                  ) : (
                    <>
                      <Select
                        label="Choose an author"
                        options={options}
                        value={selectedAuthorId}
                        onChange={(v) => {
                          setSelectedAuthorId(v);
                          setAuthorError("");
                          setAuthorSuccess(false);
                          setSuccessMsg("");
                        }}
                        placeholder="Select author"
                      />

                      {/* Already assigned author message for free plan */}
                      {isAlreadyAssigned && (
                        <Banner tone="info">This author is already assigned to this blog.</Banner>
                      )}

                      {authorError && <Banner tone="critical">{authorError}</Banner>}
                      {authorSuccess && <Banner tone="success">{successMsg}</Banner>}

                      <div>
                        <Button variant="primary" disabled>
                          Assign Author
                        </Button>
                      </div>
                    </>
                  )}
                </div>
                {/* === OVERLAY MESSAGE (hidden for now) === */}
              </>
            ) :
              (
                // === NORMAL PAID PLAN CONTENT ===
                <>
                  {isFetching ? (
                    <Spinner accessibilityLabel="Loading authors" size="large" />
                  ) : authors.length === 0 ? (
                    <Banner
                      tone="info"
                      title="You don't have any authors yet."
                      action={{ content: "Go to Author Management", url: "/authors-page" }}
                    >
                      <Text>Add authors to assign them to your blogs.</Text>
                    </Banner>
                  ) : (
                    <>
                      <Select
                        label="Choose an author"
                        options={options}
                        value={selectedAuthorId}
                        onChange={(v) => {
                          setSelectedAuthorId(v);
                          setAuthorError("");
                          setAuthorSuccess(false);
                          setSuccessMsg("");
                        }}
                        placeholder="Select author"
                      />

                      {/* Show message if the author is already assigned */}
                      {isAlreadyAssigned && (
                        <Banner tone="info">This author is already assigned to this blog.</Banner>
                      )}

                      {authorError && <Banner tone="critical">{authorError}</Banner>}
                      {authorSuccess && <Banner tone="success">{successMsg}</Banner>}

                      <div>
                        <Button
                          variant="primary"
                          onClick={handleAssignAuthor}
                          loading={isAssigning}
                          disabled={!selectedAuthorId || isAlreadyAssigned}
                        >
                          Assign Author
                        </Button>
                      </div>
                    </>
                  )}
                </>)
            }
          </BlockStack>
        </Box >
      </BlockStack >

      <BlockStack gap="400" align="end" alignItems="end">
        <Box padding="400">
          <Button variant="secondary" onClick={() => dispatch(disableEditMode())}>
            Close Editor
          </Button>
        </Box>
      </BlockStack >
    </>
  );
}
