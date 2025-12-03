import React, { useState } from 'react';
import { Form, FormLayout, TextField, DropZone, Button, BlockStack } from '@shopify/polaris';


export default function AuthorForm({ initial = {}, onSubmit, onCancel }) {
    const [name, setName] = useState(initial.name || '');
    const [bio, setBio] = useState(initial.bio || '');
    const [socials, setSocials] = useState(initial.socials || ['', '', '']);
    const [avatar, setAvatar] = useState(initial.image_url || null);
    const [errors, setErrors] = useState({});


    const validate = () => {
        const e = {};
        if (!name.trim()) e.name = 'Name required';
        if (bio.length > 500) e.bio = 'Max 500 characters';
        setErrors(e);
        return Object.keys(e).length === 0;
    };


    const handleDrop = (files) => {
        if (files && files[0]) setAvatar(URL.createObjectURL(files[0]));
    };
    const submit = async () => {
        if (!validate()) return;
        await onSubmit({ name, bio, socials: socials.filter(Boolean) }, avatar);
    };


    return (
        <Form onSubmit={submit}>
            <FormLayout>
                <FormLayout.Group>
                    <TextField label="Name" value={name} onChange={setName} error={errors.name} />
                    <DropZone accept="image/*" type="image" onDrop={handleDrop}>
                        {avatar ? <img src={avatar} style={{ width: 80, height: 80, borderRadius: 8 }} alt="avatar" /> : <DropZone.FileUpload />}
                    </DropZone>
                </FormLayout.Group>
                <TextField label="Bio" multiline value={bio} onChange={setBio} error={errors.bio} />
                {socials.map((s, i) => (
                    <TextField key={i} label={`Social URL ${i + 1}`} value={s} onChange={v => {
                        const arr = [...socials]; arr[i] = v; setSocials(arr);
                    }} />
                ))}
                <BlockStack distribution="trailing">
                    <Button onClick={onCancel}>Cancel</Button>
                    <Button primary submit>Save</Button>
                </BlockStack>
            </FormLayout>
        </Form>
    );

}