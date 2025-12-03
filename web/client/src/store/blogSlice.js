    // src/store/blogSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { SEO_CHEKS } from "../utlis/constants";
// const persistedBlog = JSON.parse(localStorage.getItem('selectedBlog') || 'null');

const initialState = {
    selectedBlogId: null,
    selectedBlogData: null,
    showSeoPanel: false,
    editMode: false,
    editField: null, // e.g., 'metaTitle', 'metaDesc'
    seoChecks: SEO_CHEKS
};

const blogSlice = createSlice({
    name: "blog",
    initialState,
    reducers: {
        selectBlog: (state, action) => {
            state.selectedBlogId = action.payload.id;
            // state.selectedBlogData = action.payload || null;
            state.showSeoPanel = true;

        },
        setSelectedBlogData: (state, action) => {
            state.selectedBlogData = action.payload;
        },
        openSeoPanel: (state) => {
            state.showSeoPanel = true;
        },
        closeSeoPanel: (state) => {
            state.showSeoPanel = false;
             state.editMode = false;
            state.editField = null;
        },
        toggleSeoPanel: (state) => {
            state.showSeoPanel = !state.showSeoPanel;
        },
        clearSelectedBlog: (state) => {
            state.selectedBlogId = null;
            state.selectedBlogData = null;
            state.showSeoPanel = false;
            state.editMode = false;
            state.editField = null;
            // localStorage.removeItem('selectedBlog'); 
        },
        enableEditMode: (state, action) => {
            state.editMode = true;
            state.editField = action.payload; // e.g. 'metaTitle'
        },
        disableEditMode: (state) => {
            state.editMode = false;
            state.editField = null;
        },
    },
});

export const { selectBlog, openSeoPanel,
    closeSeoPanel,
    toggleSeoPanel, clearSelectedBlog, enableEditMode,
    disableEditMode, setSelectedBlogData } = blogSlice.actions;
export default blogSlice.reducer;
