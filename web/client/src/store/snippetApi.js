import { createApi } from "@reduxjs/toolkit/query/react";
import { authorizedBaseQuery } from "./baseQuery";

const API_HOST = import.meta.env.VITE_HOST || "";

export const snippetApi = createApi({
  reducerPath: "snippetApi",
  baseQuery: authorizedBaseQuery({
    baseUrl: `${API_HOST}/api/`,
  }),
   tagTypes: ["AssignedAuthor"],
  endpoints: (builder) => ({
    generateSnippet: builder.mutation({
      query: (body) => ({
        // url: "/assignAuthor",
        // url: "/generate_snippet",
        url: "/assignAuthorAndUpdateBlogAuthor",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AssignedAuthor"],
    }),
    getAllAssignAuthor: builder.query({
      query: ({ shop, blogId, articleId }) => ({
        url: `/getAllAssignAuthor`,
        method: "GET",
        params: { shop, blogId, articleId },
      }),
       providesTags: ["AssignedAuthor"],
    }),
    sendSupportEmail: builder.mutation({
      query: (body) => ({
        url: "/sendSupportEmail",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useGenerateSnippetMutation,useGetAllAssignAuthorQuery,useSendSupportEmailMutation  } = snippetApi;
