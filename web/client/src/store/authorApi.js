// src/store/authorApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { authorizedBaseQuery } from "./baseQuery";

const API_HOST = import.meta.env.VITE_HOST || "";
const API_BASE = `${API_HOST}/api/`;

export const authorApi = createApi({
  reducerPath: "authorApi",
  baseQuery: authorizedBaseQuery({
    baseUrl: API_BASE,
  }),
  tagTypes: ["Author"],

  endpoints: (builder) => ({
    // ✅ Get all authors for a specific shop
    getAllAuthors: builder.query({
      query: (shop) => `GetAllAuthor?shop=${encodeURIComponent(shop)}`,
      providesTags: ["Author"],
    }),

    // ✅ Get single author by userId
    getAuthorById: builder.query({
      query: (userId) => `GetAuthor?userId=${encodeURIComponent(userId)}`,
      providesTags: (result, error, id) => [{ type: "Author", id }],
    }),

    // ✅ Create new author
    createAuthor: builder.mutation({
      query: (formData) => ({
        url: "CreateAuthor",
        method: "POST",
        body: formData, // multipart/form-data
      }),
      invalidatesTags: ["Author"],
    }),
    updateAuthor: builder.mutation({
      query: ({ authorId, formData }) => ({
        url: `UpdateAuthor/${encodeURIComponent(authorId)}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Author"],
    }),
    // ✅ Delete author
    deleteAuthor: builder.mutation({
      query: ({ authorId, shop }) => ({
        url: `DeleteAuthor/${encodeURIComponent(authorId)}?shop=${encodeURIComponent(shop)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Author"],
    }),
  }),
});

export const {
  useGetAllAuthorsQuery,
  useGetAuthorByIdQuery,
  useCreateAuthorMutation,
  useUpdateAuthorMutation,
  useDeleteAuthorMutation,
} = authorApi;
