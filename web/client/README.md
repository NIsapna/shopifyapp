flowchart TD

A[🛍 Merchant Opens App in Shopify Admin] --> B[🔐 Authenticate via App Bridge]
B --> C[📋 Dashboard - Fetch Blogs via Shopify API]
C --> D[👁 Merchant Selects a Blog to Analyze]
D --> E[⚙️ Run Blog Analyzer Steps]

subgraph AnalyzerSteps[🧠 Step-by-Step SEO Analyzer]
E1[Step 1️⃣ Meta Tags Check<br>✓ Title, Description<br>⚙️ Auto-generate if missing] --> E2
E2[Step 2️⃣ Headings (H1–H3)<br>✓ Structure, Keywords<br>⚙️ Suggest Fix] --> E3
E3[Step 3️⃣ Internal & External Links<br>✓ Link Counts<br>⚙️ Suggest Related Links] --> E4
E4[Step 4️⃣ Keyword Optimization<br>✓ Density<br>⚙️ Improve Placement] --> E5
E5[Step 5️⃣ Word Count<br>✓ ≥ 800 Words<br>⚙️ Suggest Expansion] --> E6
E6[Step 6️⃣ Image Alt Text<br>✓ Presence<br>⚙️ Auto-generate Alt] --> E7
E7[Step 7️⃣ Readability<br>✓ Score<br>⚙️ Simplify Sentences] --> E8
E8[Step 8️⃣ Mobile-Friendliness<br>✓ Responsive Check] --> E9
E9[Step 9️⃣ Page Speed<br>✓ Lighthouse Analysis] --> E10
E10[Step 🔟 Schema + Canonical<br>✓ JSON-LD, Canonical] --> E11
E11[Step 11️⃣ OG & Twitter Tags<br>✓ Social Metadata] --> E12
E12[Step 12️⃣ HTTPS Validation<br>✓ Secure Links]
end

E12 --> F[📊 Show Results Summary<br>✅/❌ + SEO Score + Recommendations]

F --> G{⚙️ Merchant Chooses Action}
G -->|Fix Individually| H1[🧩 Apply Single Fix via API]
G -->|Fix All Automatically| H2[🔄 Apply All Fixes via Shopify API]
H1 --> I[♻️ Reanalyze Blog After Fix]
H2 --> I

I --> J[💾 Save Result to History Database]
J --> K[📈 Show in Reports Page<br>Blog, Score, Date]
K --> L[📤 Export PDF SEO Report]

L --> M{💰 Subscription Check}
M -->|Free Plan| N[⚠️ Limit 3 Analyses/Month<br>Show Upgrade Dialog]
M -->|Pro Plan| O[🚀 Unlimited Analysis + Auto-Fix Enabled]

O --> P[🏁 End - Merchant SEO Improved 🚀]

{
  "articleId": 123456,
  "title": "How to Improve Store SEO",
  "score": 78,
  "summary": {
    "passed": 9,
    "failed": 4
  },
  "checks": [
    {
      "id": "meta_tags",
      "label": "Meta Title & Description",
      "status": "fail",
      "message": "Missing meta description",
      "suggestion": "Add a short meta description under 160 chars",
      "fixable": true
    },
    {
      "id": "h1_structure",
      "label": "Headings",
      "status": "pass"
    }
  ]
}
