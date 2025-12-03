import React, { useState } from "react";
import { Card, TextField, Button, BlockStack } from "@shopify/polaris";

const FixLinksForm = ({ blog, links, onSave, isLoading }) => {
  const [linkData, setLinkData] = useState(
    links.map((l) => ({ ...l, newHref: l.href || "" }))
  );

  const handleChange = (index, value) => {
    const updated = [...linkData];
    updated[index].newHref = value;
    setLinkData(updated);
  };

  const handleSave = async () => {
    // Parse blog.body HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(blog.body, "text/html");

    // Update each link node
    linkData.forEach((link) => {
      const nodes = Array.from(doc.querySelectorAll("a")).filter(
        (a) =>
          a.textContent === link.text &&
          (!a.getAttribute("href") || a.getAttribute("href") === "#")
      );
      nodes.forEach((node) => node.setAttribute("href", link.newHref));
    });

    const updatedBody = doc.body.innerHTML;
    console.log(updatedBody);

    // Save via BlogEditor's handleSave
    await onSave("body_html", updatedBody);
  };

  return (
    <Card title="Fix Empty / Hash Links">
      <BlockStack gap="300">
        {linkData.map((link, i) => (
          <div key={i}>
            <p>
              <strong>{link.text}</strong> ({link.type})
            </p>
            <TextField
              label="Link URL"
              value={link.newHref}
              onChange={(v) => handleChange(i, v)}
              placeholder="https://example.com or /pages/about-us"
            />
          </div>
        ))}
        <Button onClick={handleSave} primary loading={isLoading}>
          Save Links
        </Button>
      </BlockStack>
    </Card>
  );
};

export default FixLinksForm;
