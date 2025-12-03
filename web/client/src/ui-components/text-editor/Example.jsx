import { BlockStack, Box, Card, Page, Text, SkeletonBodyText } from '@shopify/polaris';
import { useState } from 'react';
import 'react-quill/dist/quill.snow.css';
import { RichTextEditor } from './RichTextEditor';

export function Example() {
    const [textEditor4, setTextEditor4] = useState('');
    const [charCount, setCharCount] = useState(0);

    function handleChangeWithCounter(value, editor) {
        setCharCount(editor.getText().length);
        setTextEditor4(value);
    }

    return (
        <Page narrowWidth>
            <Card>
                <BlockStack gap='600'>
                    <RichTextEditor
                        label='Editor with  with controls modified & character count'
                        placeholder='Enter text...'
                        onChange={setTextEditor4}
                        value={textEditor4}
                        // disabled
                        // error='You must enter more than 30 characters'
                        modules={{
                            toolbar: [
                                [{ header: [1, 2, 3, 4, false] }],
                                ['bold', 'italic', 'underline', 'blockquote'],
                                [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
                                [{ color: [] }, { background: [] }],
                                ['link'],
                                ['clean']
                            ]
                        }}
                    />
                    <BlockStack gap='100'>
                        <Text as='p'>Remix Clie ntOnly Fallback - loading...</Text>
                        <div className='quill'>
                            <Box padding='300' paddingBlockStart='400' paddingBlockEnd='1600'>
                                <SkeletonBodyText lines={6} />
                            </Box>
                        </div>
                    </BlockStack>
                </BlockStack>
                <Text as='p'>Character count: {charCount}</Text>

            </Card>
        </Page>
    );
}
