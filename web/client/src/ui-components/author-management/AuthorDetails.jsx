// src/components/authors/AuthorDetails.jsx
import React from "react";
import { Modal, Text, BlockStack, Avatar, Spinner, MediaCard, InlineStack, Box } from "@shopify/polaris";
import { useGetAuthorByIdQuery } from "../../store/authorApi";
import { capitalizeName } from "../../utlis/helper";

export default function AuthorDetails({ authorId, onClose }) {
  const { data, isLoading } = useGetAuthorByIdQuery(authorId);
  const author = data?.data;
  const BaseURL = import.meta.env.VITE_HOST;

  if (isLoading) {
    return (
      <Modal open onClose={onClose} title="Author Details">
        <Modal.Section>
          <Spinner accessibilityLabel="Loading author details" />
        </Modal.Section>
      </Modal>
    );
  }

  if (!author) {
    return (
      <Modal open onClose={onClose} title="Author Details">
        <Modal.Section>
          <Text>No details found.</Text>
        </Modal.Section>
      </Modal>
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Author Details"
      primaryAction={{ content: "Close", onAction: onClose }}
    >
      <Modal.Section>
        {isLoading ? (
          <Spinner />
        ) : author ? (
          <BlockStack gap={200}>
            {/* <Avatar
              size="lg"
              name={author?.name}
              source={`${BaseURL}/${author?.image}`}
            /> */}

              <img
                alt=""
                width="140px"
                height="140px"
                style={{ objectFit: 'cover', objectPosition: 'center', borderRadius: '100%' }}
                src={`${BaseURL}/${author?.image}`}
              />

                <Text variant="headingMd">{capitalizeName(author?.name)}</Text>
                <Text>Email: {author?.email}</Text>
                <Text>Bio: {author?.bio}</Text>

            {author?.linkedin && (
              <Text>
                LinkedIn: <a href={author?.linkedin}>{author?.linkedin}</a>
              </Text>
            )}
            {author?.twitter && (
              <Text>
                Twitter: <a href={author?.twitter}>{author?.twitter}</a>
              </Text>
            )}
            {author?.instagram && (
              <Text>
                Instagram: <a href={author?.instagram}>{author?.instagram}</a>
              </Text>
            )}
          </BlockStack>
        ) : (
          <Text>No details found.</Text>
        )}
      </Modal.Section>
    </Modal>
  );
}
