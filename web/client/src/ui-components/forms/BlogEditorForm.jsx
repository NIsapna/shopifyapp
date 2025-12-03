import { BlockStack, Text, Button } from '@shopify/polaris';
import { useEffect, useState } from 'react';
import { RichTextEditor } from '../text-editor/RichTextEditor';

export function BlogEditorForm({ blog, onSave, isLoading }) {
    const [textEditor, setTextEditor] = useState('');
    const [charCount, setCharCount] = useState(0);
    // console.log("blog in form", blog?.body);

    useEffect(() => {
        if (blog) {
            setTextEditor(blog?.body || "");
        }
    }, [blog]);


    function handleChangeWithCounter(value, editor) {
        setCharCount(editor.getText().length);
        setTextEditor(value);
    }

    const handleSave = () => {
        console.log("textEditor", textEditor);
        onSave("body_html", textEditor);
    }
    return (
        <>
            <BlockStack gap='600'>
                <RichTextEditor
                    label='Editor with  with controls modified & character count'
                    placeholder='Enter text...'
                    onChange={setTextEditor}
                    value={textEditor}
                    // disabled
                    // error='You must enter more than 30 characters'
                    modules={{
                        toolbar: [
                            [{ header: [1, 2, 3, 4, false] }],
                            ['bold', 'italic', 'underline', 'blockquote'],
                            [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
                            [{ color: [] }, { background: [] }],
                            ['link', 'image'],
                            ['clean']
                        ]
                    }}
                />
                <Text as='p'>Character count: {charCount}</Text>
                <Button primary loading={isLoading} onClick={handleSave}>
                    Save
                </Button>
            </BlockStack>
        </>

    );
}
