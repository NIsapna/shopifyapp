
// src/components/forms/EditAuthorForm.jsx
import { useState, useContext, useMemo } from "react";
import { Card, Select, Button, Spinner, BlockStack, Text, Banner, TextField, Box } from "@shopify/polaris";
import { useGetAllAuthorsQuery } from "../../store/authorApi";
import ShopContext from "../../utlis/ShopContext";
import { capitalizeName } from "../../utlis/helper";
import { ClipboardIcon } from "@shopify/polaris-icons";
import { useGenerateSnippetMutation } from "../../store/snippetApi";
import { useGetBlogByIdQuery } from "../../store/blogsApi";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedBlogData } from "../../store/blogSlice";

const EditAuthorForm = ({ blog, onSave }) => {
    const dispatch = useDispatch();
    const shop = useContext(ShopContext);
    const { selectedBlogData, editMode, editField } = useSelector((state) => state.blog);
    const { data, isFetching, error: isErr } = useGetAllAuthorsQuery(shop);
    const authors = data?.data || [];
    // console.log(data, "isErr");

    const [generateSnippet, { isLoading }] = useGenerateSnippetMutation();
    const { refetch, isSuccess } = useGetBlogByIdQuery(
        { shop, id: selectedBlogData?.id },
        { skip: !selectedBlogData?.id }
    );

    // console.log(blog);
    const [selectedAuthorId, setSelectedAuthorId] = useState(blog?.author?._id || "");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    const selectedAuthor = useMemo(
        () => authors.find((a) => a._id === selectedAuthorId),
        [selectedAuthorId, authors]
    );

    const options = authors.map((author) => ({
        label: capitalizeName(author?.name),
        value: author?._id,
    }));

    const isDefaultWithoutBio = selectedAuthor?.is_defaut_author && !selectedAuthor?.bio;

    const handleChange = (value) => {
        setSelectedAuthorId(value);
        setSuccessMsg("")
        setSuccess(false)
        setError("")
    };

    const handleSave = async () => {
        if (!selectedAuthorId) {
            setError("Please select an author before saving.");
            return;
        }
        if (isDefaultWithoutBio) {
            setError("Default author must have a bio before assigning.");
            return;
        }
        setIsSaving(true);
        setError("");
        try {
            const selectedAuthor = authors.find((a) => a._id === selectedAuthorId);
            // console.log(selectedAuthor);

            const payload = {
                shop, // send shop from context
                blogId: blog?.blog?.id || "",
                articleId: blog?.id, // only send the author ID, not the whole object
                authorId: selectedAuthorId, // only send the author ID, not the whole object
                // name: selectedAuthor?.name || "",
                // "bio": selectedAuthor?.bio,
                // "image": selectedAuthor?.image,
                // "linkedin": selectedAuthor?.linkedin,
                // "twitter": selectedAuthor?.twitter,
                // "instagram": selectedAuthor?.instagram,
            }
            const response = await generateSnippet(payload).unwrap();
            setSuccessMsg(response?.snippet?.message || "Author assigned.")
            // console.log(response);

            const { data: updatedBlog } = await refetch();
            dispatch(setSelectedBlogData(updatedBlog?.data));

            setSuccess(true)
            setSelectedAuthorId("")
        } catch (err) {
            // console.error(err);
            setError("Failed to assign author.");
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <Card sectioned>
            <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Assign an author</Text>

                {isFetching ? (
                    <Spinner accessibilityLabel="Loading authors" size="large" />
                ) : authors.length === 0 ? (
                    <Banner tone="info" title="You don't have any authors yet."
                        action={{ content: ' Go to Manage Authors', url: '/manage-authors' }}
                    >
                        <BlockStack gap="200">
                            {/* <Text>You don't have any authors yet.</Text> */}
                            <Text>Add authors to assign them to your blogs.</Text>
                            {/* <Button onClick={() => navigate("/authors-page")}>
                                Go to author management
                            </Button> */}
                        </BlockStack>
                    </Banner>
                ) : (
                    <>
                        <Select
                            label="Choose an author"
                            options={options}
                            value={selectedAuthorId}
                            onChange={handleChange}
                            placeholder="Select author"
                        />

                        {isDefaultWithoutBio && (
                            <Banner tone="warning"
                                action={{ content: ' Go to Manage Authors', url: '/manage-authors' }}>
                                This is a default Shopify author. Please add a bio and other
                                details in the Author Management page before assigning.
                            </Banner>
                        )}

                        {error && <Banner tone="critical">{error}</Banner>}
                        {success && <Banner tone="success">{successMsg}</Banner>}
                        <Button
                            primary
                            onClick={handleSave}
                            loading={isSaving}
                            disabled={isDefaultWithoutBio}
                        >
                            Save
                        </Button>
                    </>
                )}



            </BlockStack>
        </Card>
    );
};

export default EditAuthorForm;
