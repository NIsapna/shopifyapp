import React, { useEffect, useState, useContext } from "react";
import ShopContext from "../../utlis/ShopContext";
import { useGetAllAuthorsQuery } from "../../store/authorApi";
import { useGenerateSnippetMutation } from "../../store/snippetApi";

// Dummy fetch function: replace with real data fetching from Shopify API or backend
const fetchBlogs = async () => {
  // Example dataset
  return [
    {
      id: "1",
      title: "Introducing Spring Trends",
      status: "Published",
      author: "Alex Smith",
      blog: "Fashion Blog",
      blogId: "blog-1",
      articleId: "article-1",
      publishedAt: "2024-05-18T12:00:00Z",
    },
    {
      id: "2",
      title: "Summer Sale Announcement",
      status: "Draft",
      author: "Jane Doe",
      blog: "Shop Updates",
      blogId: "blog-2",
      articleId: "article-2",
      publishedAt: "2024-06-01T09:00:00Z",
    },
    {
      id: "3",
      title: "How to style denim",
      status: "Published",
      author: "John Adams",
      blog: "Fashion Blog",
      blogId: "blog-1",
      articleId: "article-3",
      publishedAt: "2024-01-20T10:30:00Z",
    },
    {
      id: "4",
      title: "The Eco Edit",
      status: "Draft",
      author: "Emily Greene",
      blog: "Earth Blog",
      blogId: "blog-3",
      articleId: "article-4",
      publishedAt: "2024-04-11T09:00:00Z",
    },
    {
      id: "5",
      title: "2024 Holiday Lookbook",
      status: "Published",
      author: "Ava Floyd",
      blog: "Fashion Blog",
      blogId: "blog-1",
      articleId: "article-5",
      publishedAt: "2024-06-18T10:00:00Z",
    },
    {
      id: "6",
      title: "Trends for Men",
      status: "Draft",
      author: "Bob Brown",
      blog: "Style Blog",
      blogId: "blog-4",
      articleId: "article-6",
      publishedAt: "2024-06-11T09:00:00Z",
    },
  ];
};

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

const ROWS_PER_PAGE = 3;

const AssignAuthorstoBlog = () => {
  const shop = useContext(ShopContext);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(0);

  // Selection state
  const [selectedRows, setSelectedRows] = useState([]); // array of blog ids

  // Author assignment state
  const [selectedAuthorId, setSelectedAuthorId] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [assignSuccess, setAssignSuccess] = useState(false);

  // Fetch authors
  const { data: authorsData, isLoading: loadingAuthors } = useGetAllAuthorsQuery(shop, {
    skip: !shop,
  });
  const authors = authorsData?.data || [];

  // Assign author mutation
  const [generateSnippet] = useGenerateSnippetMutation();

  useEffect(() => {
    async function getBlogs() {
      setLoading(true);
      const data = await fetchBlogs();
      setBlogs(data);
      setLoading(false);
    }
    getBlogs();
  }, []);

  // Slice for pagination
  const pagedBlogs = blogs.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE);

  const hasPreviousPage = page > 0;
  const hasNextPage = (page + 1) * ROWS_PER_PAGE < blogs.length;

  // Selection: either string "all", or array of ids
  const isRowSelected = (id) => selectedRows.includes(id);

  const handleRowSelect = (id, isMulti = false) => {
    setSelectedRows((prev) => {
      if (isMulti) {
        // Toggle in set
        if (prev.includes(id)) {
          return prev.filter((x) => x !== id);
        } else {
          return [...prev, id];
        }
      } else {
        // Single selection: just this one, or unselect if already selected
        if (prev.length === 1 && prev[0] === id) {
          return [];
        } else {
          return [id];
        }
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(pagedBlogs.map(b => b.id));
    } else {
      setSelectedRows([]);
    }
  };

  const allSelected = pagedBlogs.length > 0 && pagedBlogs.every(b => selectedRows.includes(b.id));
  const noneSelected = pagedBlogs.every(b => !selectedRows.includes(b.id));

  // Get selected blog objects
  const getSelectedBlogs = () => {
    return blogs.filter(blog => selectedRows.includes(blog.id));
  };

  // Handle assign author button click
  const handleAssignAuthorClick = () => {
    if (selectedRows.length === 0) {
      return;
    }
    // Reset form state when opening modal
    setSelectedAuthorId("");
    setAssignError("");
    setAssignSuccess(false);
    // Modal will be opened via commandFor attribute
  };

  // Handle author assignment
  const handleAssignAuthor = async () => {
    if (!selectedAuthorId) {
      setAssignError("Please select an author.");
      return;
    }

    const selectedBlogs = getSelectedBlogs();
    if (selectedBlogs.length === 0) {
      setAssignError("No blogs selected.");
      return;
    }

    setAssigning(true);
    setAssignError("");
    setAssignSuccess(false);

    try {
      // Assign author to all selected blogs
      const assignments = selectedBlogs.map(async (blog) => {
        const payload = {
          shop,
          blogId: blog.blogId || "",
          articleId: blog.articleId || blog.id,
          authorId: selectedAuthorId,
        };
        return generateSnippet(payload).unwrap();
      });

      const results = await Promise.all(assignments);
      const allSuccess = results.every(res => res?.success);

      if (allSuccess) {
        setAssignSuccess(true);
        // Update local state with new author
        const selectedAuthor = authors.find(a => a._id === selectedAuthorId);
        if (selectedAuthor) {
          setBlogs(prevBlogs =>
            prevBlogs.map(blog =>
              selectedRows.includes(blog.id)
                ? { ...blog, author: selectedAuthor.name }
                : blog
            )
          );
        }
        // Clear selection
        setSelectedRows([]);
        
        // Show success toast
        if (window.shopify && shopify.toast) {
          await shopify.toast.show(
            `Author assigned to ${selectedBlogs.length} blog${selectedBlogs.length > 1 ? "s" : ""} successfully.`,
            { duration: 3000 }
          );
        }

        // Close modal after a short delay
        setTimeout(() => {
          const modal = document.getElementById("assign-author-modal");
          if (modal && modal.hideOverlay) {
            modal.hideOverlay();
          }
          setAssignSuccess(false);
        }, 1500);
      } else {
        setAssignError("Failed to assign author to some blogs. Please try again.");
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

  // Close modal handler - called after modal is closed
  useEffect(() => {
    const modal = document.getElementById("assign-author-modal");
    if (modal) {
      const handleHide = () => {
        if (!assigning) {
          setSelectedAuthorId("");
          setAssignError("");
          setAssignSuccess(false);
        }
      };
      modal.addEventListener("hide", handleHide);
      return () => {
        modal.removeEventListener("hide", handleHide);
      };
    }
  }, [assigning]);

  return (
    <s-section padding="none">
      {/* Assign Author Button - shown when rows are selected */}
      {selectedRows.length > 0 && (
        <div style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e1e3e5" }}>
          <div style={{ fontSize: "14px", color: "#637381" }}>
            {selectedRows.length} blog{selectedRows.length > 1 ? "s" : ""} selected
          </div>
          <s-button
            variant="primary"
            commandFor="assign-author-modal"
            command="--show"
            disabled={assigning}
            onClick={handleAssignAuthorClick}
          >
            Assign Author
          </s-button>
        </div>
      )}
      <s-table paginate={true} hasPreviousPage={hasPreviousPage} hasNextPage={hasNextPage}>
        <s-table-header-row>
          <s-table-header>
            <input
              type="checkbox"
              checked={allSelected && !noneSelected}
              indeterminate={(!allSelected && !noneSelected) ? "true" : undefined}
              onChange={handleSelectAll}
              style={{ marginRight: 8 }}
              aria-label="Select all visible"
            />
            Title
          </s-table-header>
          <s-table-header>Status</s-table-header>
          <s-table-header>Author</s-table-header>
          <s-table-header>Blog</s-table-header>
          <s-table-header>Published date</s-table-header>
        </s-table-header-row>
        <s-table-body>
          {loading ? (
            <s-table-row>
              <s-table-cell colSpan={5}>
                <div style={{ padding: "24px", textAlign: "center" }}>
                  <s-spinner size="large" />
                </div>
              </s-table-cell>
            </s-table-row>
          ) : (
            pagedBlogs.map((blog) => (
              <s-table-row
                key={blog.id}
                data-selected={isRowSelected(blog.id) ? "true" : undefined}
                onClick={(e) => {
                  // If ctrl/cmd/meta, multi-select
                  handleRowSelect(blog.id, e.ctrlKey || e.metaKey);
                }}
                style={{
                  background: isRowSelected(blog.id) ? "#f0f6fd" : undefined,
                  cursor: "pointer"
                }}
              >
                <s-table-cell>
                  <input
                    type="checkbox"
                    checked={isRowSelected(blog.id)}
                    onChange={(e) => handleRowSelect(blog.id, true)}
                    onClick={event => event.stopPropagation()}
                    style={{ marginRight: 8 }}
                    aria-label={`Select row for ${blog.title}`}
                  />
                  {blog.title}
                </s-table-cell>
                <s-table-cell>
                  <s-badge
                    tone={
                      blog.status === "Published"
                        ? "success"
                        : blog.status === "Draft"
                        ? "warning"
                        : "subdued"
                    }
                  >
                    {blog.status}
                  </s-badge>
                </s-table-cell>
                <s-table-cell>{blog.author}</s-table-cell>
                <s-table-cell>{blog.blog}</s-table-cell>
                <s-table-cell>{formatDate(blog.publishedAt)}</s-table-cell>
              </s-table-row>
            ))
          )}
        </s-table-body>
      </s-table>
      {/* Pagination controls for arrows or numbers, near the table bottom */}
      <div style={{ padding: "16px 0", display: "flex", justifyContent: "center", gap: 16 }}>
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={!hasPreviousPage}
          style={{ cursor: hasPreviousPage ? "pointer" : "not-allowed" }}
        >
          Previous
        </button>
        <span>
          Page {page + 1} of {Math.max(1, Math.ceil(blogs.length / ROWS_PER_PAGE))}
        </span>
        <button
          onClick={() => setPage((p) => (hasNextPage ? p + 1 : p))}
          disabled={!hasNextPage}
          style={{ cursor: hasNextPage ? "pointer" : "not-allowed" }}
        >
          Next
        </button>
      </div>
      <div style={{ fontSize: "0.85em", color: "#888", textAlign: "center", padding: "16px 0" }}>
        {selectedRows.length > 0
          ? `${selectedRows.length} row${selectedRows.length > 1 ? "s" : ""} selected`
          : "No rows selected"}
        {" — "}
        <span>
          Tip: Ctrl/Cmd+Click for multi-select, Click for single row select.
        </span>
      </div>

      {/* Assign Author Modal */}
      <s-modal 
        id="assign-author-modal" 
        heading="Assign Author"
      >
        <div style={{ padding: "16px 0" }}>
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="author-select"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#202223",
              }}
            >
              Select Author
            </label>
            <select
              id="author-select"
              value={selectedAuthorId}
              onChange={(e) => setSelectedAuthorId(e.target.value)}
              disabled={assigning || loadingAuthors}
              style={{
                width: "100%",
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
                marginTop: "16px",
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
                marginTop: "16px",
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

          <div style={{ marginTop: "16px", fontSize: "13px", color: "#637381" }}>
            This will assign the selected author to {selectedRows.length} blog
            {selectedRows.length > 1 ? "s" : ""}.
          </div>
        </div>

        {/* Secondary action button */}
        <s-button
          slot="secondary-actions"
          variant="secondary"
          commandFor="assign-author-modal"
          command="--hide"
          disabled={assigning}
        >
          Cancel
        </s-button>

        {/* Primary action button */}
        <s-button
          slot="primary-action"
          variant="primary"
          onClick={async (e) => {
            e.preventDefault();
            await handleAssignAuthor();
          }}
          disabled={!selectedAuthorId || assigning || loadingAuthors}
        >
          {assigning ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <s-spinner size="small" />
              <span>Assigning...</span>
            </span>
          ) : (
            "Assign Author"
          )}
        </s-button>
      </s-modal>
    </s-section>
  );
};

export default AssignAuthorstoBlog;
