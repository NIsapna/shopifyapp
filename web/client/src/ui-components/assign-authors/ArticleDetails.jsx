import React, { useState, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ShopContext from "../../utlis/ShopContext";
import { useGetBlogByIdQuery } from "../../store/blogsApi";
import { useGetAllAuthorsQuery } from "../../store/authorApi";
import { useGetAllAssignAuthorQuery } from "../../store/snippetApi";
import { useGenerateSnippetMutation } from "../../store/snippetApi";

const ArticleDetails = () => {
  const shop = useContext(ShopContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const articleId = searchParams.get("articleId");
  const blogId = searchParams.get("blogId");

  // State for author assignment
  const [selectedAuthorId, setSelectedAuthorId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState(false);

  // Fetch article details
  const { data: articleData, isLoading: loadingArticle, isError: articleError } = useGetBlogByIdQuery(
    { shop, id: articleId },
    { skip: !articleId || !shop, refetchOnMountOrArgChange: true }
  );

  const article = articleData?.data;

  // Fetch all authors
  const { data: authorsData, isLoading: loadingAuthors } = useGetAllAuthorsQuery(shop, {
    skip: !shop,
  });
  const authors = authorsData?.data || [];

  // Fetch assigned author
  const { data: assignedAuthorData, refetch: refetchAssignedAuthor } = useGetAllAssignAuthorQuery(
    {
      shop: shop,
      blogId: article?.blog?.id || blogId || "",
      articleId: article?.id || articleId || "",
    },
    { skip: !article?.id && !articleId, refetchOnMountOrArgChange: true }
  );

  const assignedAuthor = assignedAuthorData?.authorsData || {};

  // Assign author mutation
  const [generateSnippet] = useGenerateSnippetMutation();

  // Handle author assignment
  const handleAssignAuthor = async () => {
    if (!selectedAuthorId) {
      setAssignError("Please select an author.");
      return;
    }

    if (!articleId) {
      setAssignError("Article ID is missing.");
      return;
    }

    setAssigning(true);
    setAssignError("");
    setAssignSuccess(false);

    try {
      const payload = {
        shop,
        blogId: article?.blog?.id || blogId || "",
        articleId: article?.id || articleId,
        authorId: selectedAuthorId,
      };

      const result = await generateSnippet(payload).unwrap();

      if (result?.success) {
        setAssignSuccess(true);
        setSelectedAuthorId("");
        
        // Refetch assigned author
        refetchAssignedAuthor();

        // Show success toast
        if (window.shopify && shopify.toast) {
          await shopify.toast.show("Author assigned successfully.", {
            duration: 3000,
          });
        }

        // Reset success message after delay
        setTimeout(() => {
          setAssignSuccess(false);
        }, 3000);
      } else {
        setAssignError("Failed to assign author. Please try again.");
      }
    } catch (error) {
      console.error("Error assigning author:", error);
      setAssignError(error?.data?.message || "Failed to assign author. Please try again.");
      if (window.shopify && shopify.toast) {
        await shopify.toast.show("Failed to assign author. Please try again.", {
          duration: 3000,
        });
      }
    } finally {
      setAssigning(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loadingArticle) {
    return (
      <s-section padding="base">
        <div style={{ padding: "48px", textAlign: "center" }}>
          <s-spinner size="large" />
          <p style={{ marginTop: "16px", color: "#637381" }}>Loading article details...</p>
        </div>
      </s-section>
    );
  }

  if (articleError || !article) {
    return (
      <s-section padding="base">
        <div style={{ padding: "48px", textAlign: "center" }}>
          <p style={{ color: "#d72c0d", marginBottom: "16px" }}>
            {articleError ? "Error loading article details." : "Article not found."}
          </p>
          <s-button variant="primary" onClick={() => navigate("/assign-authors")}>
            Back to Blogs
          </s-button>
        </div>
      </s-section>
    );
  }

  return (
    <s-section padding="base">
      {/* Header with back button */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
        <s-button variant="secondary" onClick={() => navigate("/assign-authors")}>
          ← Back to Blogs
        </s-button>
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "600", color: "#202223" }}>
          Article Details
        </h1>
      </div>

      {/* Article Information Card */}
      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #e1e3e5",
          borderRadius: "8px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ margin: "0 0 16px 0", fontSize: "20px", fontWeight: "600", color: "#202223" }}>
          {article.title || "Untitled Article"}
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <div>
            <div style={{ fontSize: "12px", color: "#637381", marginBottom: "4px" }}>Blog</div>
            <div style={{ fontSize: "14px", color: "#202223", fontWeight: "500" }}>
              {article.blog?.title || "-"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#637381", marginBottom: "4px" }}>Status</div>
            <div>
              <s-badge tone="subdued">Published</s-badge>
            </div>
          </div>
          {article.tags && article.tags.length > 0 && (
            <div>
              <div style={{ fontSize: "12px", color: "#637381", marginBottom: "4px" }}>Tags</div>
              <div style={{ fontSize: "14px", color: "#202223" }}>
                {article.tags.join(", ")}
              </div>
            </div>
          )}
        </div>

        {/* Article Image */}
        {article.image?.originalSrc && (
          <div style={{ marginBottom: "24px" }}>
            <img
              src={article.image.originalSrc}
              alt={article.title}
              style={{
                width: "100%",
                maxWidth: "600px",
                height: "auto",
                borderRadius: "8px",
                border: "1px solid #e1e3e5",
              }}
            />
          </div>
        )}

        {/* Article Content */}
        {article.body && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "12px", color: "#637381", marginBottom: "8px" }}>Content</div>
            <div
              style={{
                padding: "16px",
                backgroundColor: "#f6f6f7",
                borderRadius: "8px",
                border: "1px solid #e1e3e5",
                maxHeight: "400px",
                overflowY: "auto",
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: article.body }} />
            </div>
          </div>
        )}
      </div>

      {/* Author Assignment Card */}
      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #e1e3e5",
          borderRadius: "8px",
          padding: "24px",
        }}
      >
        <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "600", color: "#202223" }}>
          Author Assignment
        </h3>

        {/* Display Current Assigned Author */}
        {assignedAuthor?.name && (
          <div
            style={{
              padding: "16px",
              backgroundColor: "#e8f5e9",
              border: "1px solid #c8e6c9",
              borderRadius: "8px",
              marginBottom: "24px",
            }}
          >
            <div style={{ fontSize: "12px", color: "#637381", marginBottom: "4px" }}>
              Currently Assigned Author
            </div>
            <div style={{ fontSize: "16px", fontWeight: "600", color: "#2e7d32" }}>
              {assignedAuthor.name}
            </div>
            {assignedAuthor.bio && (
              <div style={{ fontSize: "14px", color: "#637381", marginTop: "8px" }}>
                {assignedAuthor.bio}
              </div>
            )}
          </div>
        )}

        {!assignedAuthor?.name && (
          <div
            style={{
              padding: "16px",
              backgroundColor: "#fff4e6",
              border: "1px solid #ffe0b2",
              borderRadius: "8px",
              marginBottom: "24px",
            }}
          >
            <div style={{ fontSize: "14px", color: "#f57c00" }}>
              No author assigned to this article yet.
            </div>
          </div>
        )}

        {/* Author Selection */}
        <div style={{ marginBottom: "16px" }}>
          <label
            htmlFor="author-select-details"
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#202223",
            }}
          >
            {assignedAuthor?.name ? "Change Author" : "Assign Author"}
          </label>
          <select
            id="author-select-details"
            value={selectedAuthorId}
            onChange={(e) => setSelectedAuthorId(e.target.value)}
            disabled={assigning || loadingAuthors}
            style={{
              width: "100%",
              maxWidth: "400px",
              padding: "8px 12px",
              fontSize: "14px",
              border: "1px solid #c9cccf",
              borderRadius: "4px",
              backgroundColor: (assigning || loadingAuthors) ? "#f6f6f7" : "white",
              color: "#202223",
            }}
          >
            <option value="">Choose an author...</option>
            {authors.map((author) => (
              <option key={author._id} value={author._id}>
                {author.name || "Unnamed Author"}
              </option>
            ))}
          </select>
        </div>

        {loadingAuthors && (
          <div style={{ padding: "16px", textAlign: "center" }}>
            <s-spinner size="small" />
            <span style={{ marginLeft: "8px", fontSize: "14px", color: "#637381" }}>
              Loading authors...
            </span>
          </div>
        )}

        {!loadingAuthors && authors.length === 0 && (
          <div style={{ padding: "16px", textAlign: "center", color: "#637381" }}>
            No authors available. Please create an author first.
          </div>
        )}

        {assignError && (
          <div
            style={{
              padding: "12px",
              marginBottom: "16px",
              backgroundColor: "#fee",
              border: "1px solid #fcc",
              borderRadius: "4px",
              color: "#d72c0d",
              fontSize: "14px",
            }}
          >
            {assignError}
          </div>
        )}

        {assignSuccess && (
          <div
            style={{
              padding: "12px",
              marginBottom: "16px",
              backgroundColor: "#e8f5e9",
              border: "1px solid #c8e6c9",
              borderRadius: "4px",
              color: "#2e7d32",
              fontSize: "14px",
            }}
          >
            Author assigned successfully!
          </div>
        )}

        <s-button
          variant="primary"
          onClick={handleAssignAuthor}
          disabled={!selectedAuthorId || assigning || loadingAuthors}
        >
          {assigning ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <s-spinner size="small" />
              <span>Assigning...</span>
            </span>
          ) : (
            assignedAuthor?.name ? "Change Author" : "Assign Author"
          )}
        </s-button>
      </div>
    </s-section>
  );
};

export default ArticleDetails;

