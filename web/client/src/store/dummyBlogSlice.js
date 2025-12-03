import { createSlice } from "@reduxjs/toolkit";


const updateMetafield = (edges, key, value) => {
  const edge = edges.find((e) => e.node.key === key);
  if (edge) {
    edge.node.value = value;
  } else {
    edges.push({
      node: {
        key,
        value,
      },
    });
  }
};

// Initial dummy blog article data
const INITIAL_DUMMY_BLOG = {
  id: "gid://shopify/Article/123456789",
  title: "10 Essential Tips for E-commerce Success in 2024",
  body: `
    <h1>10 Essential Tips for E-commerce Success in 2024</h1>
    <p>Running an online store has never been more competitive. With millions of e-commerce businesses vying for customer attention, standing out requires strategic planning and execution.</p>
    
    <h2>1. Optimize Your Product Pages</h2>
    <p>Your product pages are the heart of your e-commerce store. Make sure they include high-quality images, detailed descriptions, and clear pricing.</p>
    
    <h2>2. Focus on Mobile Experience</h2>
    <p>With over 60% of online shopping happening on mobile devices, your store must be mobile-friendly. Test your site on various devices to ensure a smooth experience.</p>
    
    <p>For more information, check out our <a href="/products/essential-guide">Essential Guide</a> and visit <a href="https://www.shopify.com/blog">Shopify's blog</a> for additional resources.</p>
    
    <h3>3. Build Trust with Reviews</h3>
    <p>Customer reviews are crucial for building trust. Encourage satisfied customers to leave reviews and respond to feedback promptly.</p>
    
    <img src="https://via.placeholder.com/600x400" alt="E-commerce dashboard showing analytics" />
    <img src="https://via.placeholder.com/600x400" />
    
    <p>Remember, success in e-commerce is about creating value for your customers while building a sustainable business model.</p>
  `,
  metafields: {
    edges: [
      {
        node: {
          key: "metaTitle",
          value: "E-commerce Success Tips 2024",
        },
      },
      {
        node: {
          key: "metaDescription",
          value: "Discover 10 essential tips to grow your online store and achieve e-commerce success in 2024.",
        },
      },
    ],
  },
  author: {
    firstName: "John",
    lastName: "Doe",
    bio: "John is an experienced e-commerce consultant with over 10 years in the industry.",
  },
  image: {
    src: "https://via.placeholder.com/400x300",
    altText: "E-commerce success tips",
  },
};

const initialState = {
  blogData: INITIAL_DUMMY_BLOG,
};

const dummyBlogSlice = createSlice({
  name: "dummyBlog",
  initialState,
  reducers: {
    updateBlog: (state, action) => {
      const { title, metaTitle, metaDescription, body, imageUrl } = action.payload;

      if (title !== undefined) {
        state.blogData.title = title;
      }

      if (body !== undefined) {
        state.blogData.body = body;
      }

      if (imageUrl !== undefined) {
        state.blogData.image = {
          ...state.blogData.image,
          src: imageUrl,
        };
      }

      if (metaTitle !== undefined) {
        updateMetafield(state.blogData.metafields.edges, "metaTitle", metaTitle);
      }

      if (metaDescription !== undefined) {
        updateMetafield(state.blogData.metafields.edges, "metaDescription", metaDescription);
      }
    },
    resetBlog: (state) => {
      state.blogData = INITIAL_DUMMY_BLOG;
    },
  },
});

export const { updateBlog, resetBlog } = dummyBlogSlice.actions;
export default dummyBlogSlice.reducer;

