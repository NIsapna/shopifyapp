// src/components/authors/AuthorList.jsx
import React, { useState, useContext, useMemo } from "react";
import {
  Card,
  DataTable,
  Button,
  Text,
  InlineStack,
  Box,
  InlineGrid,
  SkeletonBodyText,
  Avatar,
  Thumbnail,
  Layout,
  Pagination,
  Banner,
  Modal,
  BlockStack,
  Tooltip,
} from "@shopify/polaris";
import { useGetAllAuthorsQuery, useDeleteAuthorMutation } from "../../store/authorApi";
import ShopContext from "../../utlis/ShopContext";
import AuthorDetails from "./AuthorDetails";
import AddAuthorForm from "./AddAuthorForm";
import EditAuthor from "./EditAuthor";
import { usePlan } from "../../context/PlanContext";
import UpgradeOverlay from "../comman/UpgradeOverlay";
import NoPlanOverlay from "../comman/NoPlanLayout";
import { capitalizeName } from "../../utlis/helper";

const PAGE_SIZE = 10;

export default function AuthorList() {
  const BaseURL = import.meta.env.VITE_HOST;
  const shop = useContext(ShopContext);

  const { data, isLoading, isError } = useGetAllAuthorsQuery(shop);
  const authors = data?.data || [];

  const { planName, isPlanActive, noPlanSelected, isPlanExpired, isPlanPending, blogCount } = usePlan();

  const isFreePlan = planName === "free" && isPlanActive;
  const isProPlan = planName === "pro" && isPlanActive;

  // Disable Add/Edit if:
  // - free plan and already has one or more authors
  // - pro plan (active)
  // - there are already 3 authors in total
  const disableAddEdit =
    (isFreePlan && authors.length > 0) ||
    (isProPlan && authors.length >= 3);
  // const disableEdit =
    // (isFreePlan && authors.length > 0) ||
    // (isProPlan && authors.length >= 3);

  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [editAuth, setEditAuth] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Delete confirmation state
  const [authorToDelete, setAuthorToDelete] = useState(null);
  const [deleteAuthor, { isLoading: isDeleting }] = useDeleteAuthorMutation();

  // Pagination state
  const [page, setPage] = useState(1);

  // Calculate page boundaries
  const totalPages = Math.ceil(authors.length / PAGE_SIZE);

  // Memoize paginated authors
  const paginatedAuthors = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return authors.slice(start, start + PAGE_SIZE);
  }, [authors, page]);

  const safeValue = (val) => (val === null || val === undefined || val === "" ? "-" : val);

  const handleDeleteClick = (author) => {
    setAuthorToDelete(author);
  };

  const handleDeleteConfirm = async () => {
    if (!authorToDelete) return;

    try {
      await deleteAuthor({
        authorId: authorToDelete._id,
        shop: shop,
      }).unwrap();

      if (window.shopify && shopify.toast) {
        await shopify.toast.show("Author deleted successfully.", {
          duration: 2000,
        });
      }

      setAuthorToDelete(null);
    } catch (error) {
      console.error("Error deleting author:", error);
      if (window.shopify && shopify.toast) {
        await shopify.toast.show("Failed to delete author. Please try again.", {
          duration: 3000,
        });
      }
    }
  };

  const handleDeleteCancel = () => {
    setAuthorToDelete(null);
  };

  if (isLoading)
    return (
      <Card sectioned>
        <SkeletonBodyText lines={6} />
      </Card>
    );

  if (isError) return <Text tone="critical">Failed to load authors. Please try again later.</Text>;

  return (
    <>
      <Layout>

        <Layout.Section>

          {noPlanSelected && (
            <>
              <NoPlanOverlay message="Please select a plan to start using this feature." />
            </>
          )}
          {isPlanPending && (
            <>
              <NoPlanOverlay message="Please complete your payment  to add or edit authors." />
            </>
          )}

          {isPlanExpired && (
            <UpgradeOverlay message="Your plan expired! Please upgrade your plan to add or edit authors." />
          )}
          {isProPlan && authors?.length >= 3 && (
            <UpgradeOverlay message="Your have added maximum number of authors. Please upgrade your plan to add more authors." />
          )}

          {/* {!noPlanSelected && (
            <UpgradeOverlay message="Upgrade your plan to add or edit authors." />
          )} */}
          {isFreePlan && (
            <UpgradeOverlay message="You are currently on the Free plan. To add more authors, please upgrade your plan." />
          )}

        </Layout.Section>

        {
          noPlanSelected ?
            <Layout.Section>
              <Card sectioned>
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">Authors</Text>
                  <Button disabled>+ Add Author</Button>
                </InlineStack>

                <Box paddingBlockStart="200">
                  {/* Skeleton table imitation */}
                  <SkeletonBodyText lines={5} />
                </Box>
              </Card>
            </Layout.Section>
            :
            <>{authors.length === 0 ? (
              // ✅ No authors yet state
              <>
                <Layout.Section>
                  <Card sectioned>
                    <InlineStack align="space-between" blockAlign="center">

                      <Text as="h2" variant="headingMd"> All Authors</Text>
                      <Button
                        onClick={() => setShowAddForm(true)}
                        disabled={isPlanPending || isPlanExpired || disableAddEdit}
                      // tone={isPlanPending || isPlanExpired ? "critical" : "primary"}
                      >+ Add Author</Button>
                    </InlineStack>

                    <Box paddingBlock="200">
                      <SkeletonBodyText lines={5} />
                    </Box>

                    <Banner tone="info" title="No authors found">
                      <p>You haven’t added any authors yet. Click “Add Author” to get started.</p>
                    </Banner>
                  </Card>
                </Layout.Section>
              </>
            ) : (
              <>
                <Layout.Section>
                  <Card>
                    <InlineStack align="space-between" blockAlign="center">
                      <Text as="h2" variant="headingMd">Authors</Text>
                      <Button
                        disabled={isPlanExpired || isPlanPending || disableAddEdit}
                        onClick={() => setShowAddForm(true)}
                      >
                        + Add Author
                      </Button>
                    </InlineStack>
                  </Card>
                </Layout.Section>

                <Layout.Section>
                  <Card>
                    <DataTable
                      columnContentTypes={["text", "text", "text", "text", "text"]}
                      headings={["Name", "Image", "Email", "Bio", "Action"]}
                      rows={paginatedAuthors.map((a) => [
                        capitalizeName(safeValue(a?.name)),
                        a?.image ? (
                          <Avatar
                            source={`${BaseURL}/${a?.image}`}
                            size="md"
                            alt={safeValue(a?.name)}
                          />
                        ) : (
                          <Avatar
                            size="md"
                            name={capitalizeName(safeValue(a?.name))}
                          />
                        ),
                        safeValue(a?.email),
                        safeValue(a?.bio)?.slice(0, 40) + (a?.bio ? "..." : ""),
                        <InlineStack gap={100}>
                          <Button
                            size="slim"
                            onClick={() => setSelectedAuthor(a?._id)}
                            plain
                          >
                            View
                          </Button>
                          <Button
                            size="slim"
                            onClick={() => setEditAuth(a?._id)}
                            plain
                            disabled={
                              noPlanSelected ||
                              !isPlanActive ||
                              isPlanPending ||
                              isPlanExpired 
                            }
                          >
                            Edit
                          </Button>
                          {
                            a?.is_defaut_author
                              ?
                              <Tooltip content="This is a default author. You cannot delete it.">
                                <Button
                                  size="slim"
                                  plain
                                  tone="critical"
                                  disabled={true}
                                >
                                  Delete
                                </Button>
                              </Tooltip>
                              :
                              <Button
                                size="slim"
                                onClick={() => handleDeleteClick(a)}
                                plain
                                tone="critical"
                                disabled={noPlanSelected || !isPlanActive || isPlanPending || isPlanExpired || a?.is_defaut_author}
                              >
                                Delete
                              </Button>
                          }
                        </InlineStack>
                      ])}
                    />

                    <Box paddingBlockStart="300">
                      <Pagination
                        hasPrevious={page > 1}
                        onPrevious={() => setPage(prev => Math.max(prev - 1, 1))}
                        hasNext={page < totalPages}
                        onNext={() => setPage(prev => Math.min(prev + 1, totalPages))}
                        label={`Page ${page} of ${totalPages}`}
                      />
                    </Box>
                  </Card>
                </Layout.Section>
              </>
            )}
            </>
        }
        <Layout.Section>
          {selectedAuthor && (
            <AuthorDetails
              authorId={selectedAuthor}
              onClose={() => setSelectedAuthor(null)}
            />
          )}
          {editAuth && (
            <EditAuthor
              authorId={editAuth}
              onClose={() => setEditAuth(null)}
            />
          )}

          {showAddForm && <AddAuthorForm onClose={() => setShowAddForm(false)} />}
        </Layout.Section>
      </Layout>

      {/* Delete Confirmation Modal */}
      {authorToDelete && (
        <Modal
          open={!!authorToDelete}
          onClose={handleDeleteCancel}
          title="Delete author"
          primaryAction={{
            content: "Delete",
            destructive: true,
            onAction: handleDeleteConfirm,
            loading: isDeleting,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: handleDeleteCancel,
            },
          ]}
        >
          <Modal.Section>
            <BlockStack gap="300">
              <Text as="p">
                Are you sure you want to delete <strong>{capitalizeName(authorToDelete?.name || "this author")}</strong>?
                This action cannot be undone.
              </Text>
            </BlockStack>
          </Modal.Section>
        </Modal>
      )}
    </>
  );
}
