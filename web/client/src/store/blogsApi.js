import { createApi } from '@reduxjs/toolkit/query/react';
import { authorizedBaseQuery } from './baseQuery';

const API_HOST = import.meta.env.VITE_HOST || "";
const API_BASE = `${API_HOST}/api/`;

export const blogsApi = createApi({
  reducerPath: 'blogsApi',
  baseQuery: authorizedBaseQuery({ baseUrl: API_BASE }),
  tagTypes: ['Blog'],

  endpoints: (builder) => ({
    // Fetch all blogs for a specific shop
    getBlogs: builder.query({
      query: ({ shop }) => `getBlogs?shop=${encodeURIComponent(shop)}`,
    }),

    // Fetch a single blog by ID for a specific shop
    getBlogById: builder.query({
      query: ({ shop, id }) =>
        `getBlogsById?shop=${encodeURIComponent(shop)}&id=${encodeURIComponent(id)}`,
      providesTags: (result, error, arg) => [{ type: 'Blog', id: arg.id }],
    }),

    // Update an article for a specific shop
    updateArticle: builder.mutation({
      query: ({ shop, formData }) => ({
        url: `/updateArticle?shop=${encodeURIComponent(shop)}`,
        method: 'PUT',
        body: formData, // FormData object
      }),
      
      invalidatesTags: (result, error, arg) => [{ type: 'Blog', id: arg.formData.get('id') }],
    }),
  }),
});

export const {
  useGetBlogsQuery,
  useGetBlogByIdQuery,
  useUpdateArticleMutation,
} = blogsApi;
