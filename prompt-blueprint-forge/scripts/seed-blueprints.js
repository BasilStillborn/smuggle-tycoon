/**
 * Seed Content Generator
 *
 * Generates additional blueprints to reach the 50-blueprint
 * launch threshold. Run once before going live.
 *
 * Usage: node scripts/seed-blueprints.js
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const BLUEPRINTS_FILE = path.join(DATA_DIR, "blueprints.json");

const authors = ["user_1", "user_2", "user_3", "user_4", "user_6"];
const categories = ["cat_1", "cat_2", "cat_3", "cat_4", "cat_5", "cat_6", "cat_7", "cat_8"];
const difficulties = ["beginner", "intermediate", "advanced"];

const newBlueprints = [
  // Content Writing (cat_1) - 5 more
  { title: "Email Marketing Sequence Generator", description: "Craft high-converting email sequences from welcome to re-engagement with this 6-step prompt chain.", price: 24.99, categoryId: "cat_1", tags: ["email", "marketing", "copywriting", "automation"], steps: 6, tokens: 2800, compatibleModels: ["GPT-4", "Claude 3", "Gemini Pro"], includes: ["Welcome email prompt", "Nurture series", "Sales email", "Re-engagement prompt", "A/B test generator"] },
  { title: "SEO Meta Description Optimizer", description: "Generate click-optimized meta descriptions and title tags that rank higher and drive organic traffic.", price: 14.99, categoryId: "cat_1", tags: ["seo", "meta", "description", "organic", "traffic"], steps: 3, tokens: 1500, compatibleModels: ["GPT-4", "Claude 3"], includes: ["Meta title generator", "Description optimizer", "Keyword integration prompt"] },
  { title: "Technical Documentation Writer", description: "Transform complex technical concepts into clear, structured documentation with code examples.", price: 34.99, categoryId: "cat_1", tags: ["documentation", "technical", "writing", "api", "developer"], steps: 4, tokens: 3500, compatibleModels: ["GPT-4", "Claude 3 Opus"], includes: ["API doc prompt", "Code example generator", "Tutorial structure", "Quick start guide"] },
  { title: "Press Release & Media Kit Generator", description: "Create professional press releases and media kits that get journalists' attention.", price: 29.99, categoryId: "cat_1", tags: ["press", "media", "pr", "announcement", "journalism"], steps: 5, tokens: 3000, compatibleModels: ["GPT-4", "Claude 3"], includes: ["Press release template", "Media kit structure", "Quote generator", "Boilerplate builder", "Distribution checklist"] },
  { title: "Newsletter Content Curator", description: "Curate and summarize the best industry news into engaging newsletter content your subscribers will love.", price: 19.99, categoryId: "cat_1", tags: ["newsletter", "curation", "summary", "content", "email"], steps: 4, tokens: 2200, compatibleModels: ["GPT-4", "Claude 3", "Gemini Pro"], includes: ["Article summarizer", "Editorial note prompt", "Headline generator", "CTA optimizer"] },

  // Code Generation (cat_2) - 5 more
  { title: "REST API Endpoint Builder", description: "Design and implement production-ready REST API endpoints with validation, error handling, and documentation.", price: 44.99, categoryId: "cat_2", tags: ["api", "rest", "backend", "node", "express"], steps: 5, tokens: 4000, compatibleModels: ["GPT-4", "Claude 3 Opus", "Gemini Ultra"], includes: ["Route design prompt", "Controller generator", "Validation schema", "Error handler", "API docs template"] },
  { title: "Database Schema Designer", description: "Design normalized database schemas with relationships, indexes, and migration scripts for any project.", price: 39.99, categoryId: "cat_2", tags: ["database", "schema", "sql", "postgres", "migration"], steps: 4, tokens: 3200, compatibleModels: ["GPT-4", "Claude 3 Opus"], includes: ["Schema designer", "Relationship mapper", "Index optimizer", "Migration script generator"] },
  { title: "Unit Test Suite Generator", description: "Generate comprehensive unit tests with mocks, edge cases, and coverage reports for your codebase.", price: 34.99, categoryId: "cat_2", tags: ["testing", "unit", "jest", "mocha", "coverage"], steps: 4, tokens: 3500, compatibleModels: ["GPT-4", "Claude 3"], includes: ["Test case generator", "Mock factory", "Edge case finder", "Coverage reporter"] },
  { title: "CI/CD Pipeline Architect", description: "Design and implement CI/CD pipelines for GitHub Actions, GitLab CI, or Jenkins with best practices.", price: 49.99, categoryId: "cat_2", tags: ["cicd", "devops", "github-actions", "jenkins", "automation"], steps: 6, tokens: 4500, compatibleModels: ["GPT-4", "Claude 3 Opus"], includes: ["Pipeline structure prompt", "Step generator", "Secret manager", "Deploy strategy", "Notification config", "Rollback plan"] },
  { title: "Code Review Assistant", description: "Automate thorough code reviews with security scanning, style checking, and performance suggestions.", price: 29.99, categoryId: "cat_2", tags: ["code-review", "security", "quality", "performance", "best-practices"], steps: 4, tokens: 3000, compatibleModels: ["GPT-4", "Claude 3"], includes: ["Security scanner prompt", "Style checker", "Performance analyzer", "Best practices enforcer"] },

  // Data Analysis (cat_3) - 5 more
  { title: "Statistical Analysis Workflow", description: "Run comprehensive statistical analyses on datasets with hypothesis testing, correlation analysis, and regression modeling.", price: 44.99, categoryId: "cat_3", tags: ["statistics", "analysis", "hypothesis", "regression", "data-science"], steps: 5, tokens: 4000, compatibleModels: ["GPT-4", "Claude 3 Opus", "Gemini Ultra"], includes: ["Hypothesis tester", "Correlation analyzer", "Regression modeler", "Visualization prompter", "Report generator"] },
  { title: "Data Cleaning & Preprocessing Pipeline", description: "Automate the tedious process of cleaning, normalizing, and preprocessing messy datasets for analysis.", price: 29.99, categoryId: "cat_3", tags: ["data-cleaning", "preprocessing", "normalization", "pipeline", "etl"], steps: 6, tokens: 3500, compatibleModels: ["GPT-4", "Claude 3"], includes: ["Missing value handler", "Outlier detector", "Normalization prompter", "Feature encoder", "Data validator", "Pipeline builder"] },
  { title: "Time Series Forecasting Engine", description: "Generate accurate time series forecasts using trend analysis, seasonality decomposition, and ARIMA modeling.", price: 49.99, categoryId: "cat_3", tags: ["time-series", "forecasting", "trend", "seasonality", "arima"], steps: 5, tokens: 3800, compatibleModels: ["GPT-4", "Claude 3 Opus"], includes: ["Trend analyzer", "Seasonality decomposer", "Model selector", "Forecast generator", "Accuracy reporter"] },
  { title: "A/B Test Analyzer", description: "Design, run, and analyze A/B tests with statistical significance calculations and actionable recommendations.", price: 34.99, categoryId: "cat_3", tags: ["ab-test", "experiment", "significance", "conversion", "optimization"], steps: 4, tokens: 2800, compatibleModels: ["GPT-4", "Claude 3"], includes: ["Test designer", "Sample size calculator", "Significance tester", "Recommendation engine"] },
  { title: "Natural Language Data Explorer", description: "Explore unstructured text data through topic modeling, sentiment analysis, and keyword extraction.", price: 39.99, categoryId: "cat_3", tags: ["nlp", "text-analysis", "sentiment", "topic-modeling", "keywords"], steps: 5, tokens: 3500, compatibleModels: ["GPT-4", "Claude 3 Opus", "Gemini Pro"], includes: ["Topic modeler", "Sentiment analyzer", "Keyword extractor", "Summary generator", "Visualization prompter"] },

  // Creative Arts (cat_4) - 5 more
  { title: "Fantasy Worldbuilding Generator", description: "Build rich, consistent fantasy worlds with detailed geography, cultures, magic systems, and history.", price: 34.99, categoryId: "cat_4", tags: ["fantasy", "worldbuilding", "ttrpg", "writing", "creative"], steps: 7, tokens: 5000, compatibleModels: ["GPT-4", "Claude 3 Opus"], includes: ["Geography generator", "Culture builder", "Magic system designer", "History timeline", "Pantheon creator", "Bestiary prompter", "Map prompt"] },
  { title: "Character Dialogue Writer", description: "Write authentic, character-specific dialogue with distinct voices, subtext, and emotional arcs.", price: 24.99, categoryId: "cat_4", tags: ["dialogue", "character", "writing", "voice", "script"], steps: 4, tokens: 2500, compatibleModels: ["GPT-4", "Claude 3"], includes: ["Voice definition prompt", "Dialogue generator", "Subtext enhancer", "Emotion arc tracker"] },
  { title: "Music Video Concept Generator", description: "Generate creative music video concepts with visual treatments, storyboards, and production notes.", price: 29.99, categoryId: "cat_4", tags: ["music", "video", "concept", "storyboard", "creative"], steps: 5, tokens: 3000, compatibleModels: ["GPT-4", "Claude 3"], includes: ["Concept brainstormer", "Visual treatment prompter", "Storyboard generator", "Shot list creator", "Production notes"] },
  { title: "Logo Design Brief Generator", description: "Create comprehensive design briefs for logo designers with brand personality, color psychology, and style direction.", price: 19.99, categoryId: "cat_4", tags: ["design", "logo", "branding", "brief", "creative"], steps: 4, tokens: 2200, compatibleModels: ["GPT-4", "Claude 3", "Gemini Pro"], includes: ["Brand personality profiler", "Color psychologist", "Style direction prompter", "Brief template"] },
  { title: "Sci-Fi Technology Concept Designer", description: "Design believable sci-fi technologies with explanations of their mechanics, societal impact, and narrative potential.", price: 34.99, categoryId: "cat_4", tags: ["scifi", "technology", "worldbuilding", "creative", "writing"], steps: 5, tokens: 3500, compatibleModels: ["GPT-4", "Claude 3 Opus"], includes: ["Tech concept generator", "Mechanics explainer", "Impact analyzer", "Narrative hook finder", "Visual description prompter"] },

  // Business Strategy (cat_5) - 5 more
  { title: "Business Model Canvas Builder", description: "Design and validate business models using the Lean Canvas framework with risk assessment and hypothesis testing.", price: 39.99, categoryId: "cat_5", tags: ["business", "canvas", "lean", "startup", "strategy"], steps: 5, tokens: 3500, compatibleModels: ["GPT-4", "Claude 3"], includes: ["Value proposition designer", "Revenue modeler", "Cost structure analyzer", "Channel strategist", "Risk assessor"] },
  { title: "Competitive Intelligence Report Generator", description: "Produce in-depth competitive analysis reports with SWOT, market positioning, and strategic recommendations.", price: 44.99, categoryId: "cat_5", tags: ["competitive", "intelligence", "swot", "analysis", "strategy"], steps: 6, tokens: 4000, compatibleModels: ["GPT-4", "Claude 3 Opus"], includes: ["Competitor profiler", "SWOT analyzer", "Market position mapper", "Threat assessor", "Opportunity finder", "Recommendation engine"] },
  { title: "OKR & KPI Framework Designer", description: "Design aligned OKRs and KPIs across your organization with measurable targets and regular check-in prompts.", price: 34.99, categoryId: "cat_5", tags: ["okr", "kpi", "goals", "metrics", "management"], steps: 4, tokens: 3000, compatibleModels: ["GPT-4", "Claude 3"], includes: ["OKR designer", "KPI selector", "Target setter", "Check-in facilitator"] },
  { title: "Investor Pitch Deck Creator", description: "Craft compelling investor pitch decks with slide-by-slide prompts covering problem, solution, market, traction, and ask.", price: 49.99, categoryId: "cat_5", tags: ["investor", "pitch", "fundraising", "startup", "deck"], steps: 8, tokens: 5000, compatibleModels: ["GPT-4", "Claude 3 Opus"], includes: ["Problem slide prompter", "Solution architect", "Market size calculator", "Traction reporter", "Team prompter", "Financial modeler", "Competitive slide", "Ask structure"] },
  { title: "Product Roadmap Strategist", description: "Build strategic product roadmaps with priority scoring, dependency mapping, and stakeholder communication templates.", price: 39.99, categoryId: "cat_5", tags: ["product", "roadmap", "strategy", "priorities", "management"], steps: 5, tokens: 3500, compatibleModels: ["GPT-4", "Claude 3", "Gemini Pro"], includes: ["Feature prioritizer", "Dependency mapper", "Timeline generator", "Stakeholder communicator", "Risk buffer planner"] },

  // Education & Tutor (cat_6) - 5 more
  { title: "Lesson Plan Generator", description: "Create comprehensive lesson plans with learning objectives, activities, assessments, and differentiation strategies.", price: 24.99, categoryId: "cat_6", tags: ["education", "lesson-plan", "teaching", "curriculum", "classroom"], steps: 5, tokens: 3000, compatibleModels: ["GPT-4", "Claude 3"], includes: ["Objective writer", "Activity designer", "Assessment creator", "Differentiation planner", "Resource list"] },
  { title: "Quiz & Assessment Builder", description: "Generate varied assessment questions with difficulty calibration, answer explanations, and plagiarism detection.", price: 19.99, categoryId: "cat_6", tags: ["quiz", "assessment", "questions", "testing", "education"], steps: 4, tokens: 2500, compatibleModels: ["GPT-4", "Claude 3", "Gemini Pro"], includes: ["Question generator", "Difficulty calibrator", "Answer explainer", "Plagiarism checker"] },
  { title: "Study Guide Creator", description: "Transform course materials into structured study guides with summaries, key concepts, practice problems, and mnemonics.", price: 14.99, categoryId: "cat_6", tags: ["study", "guide", "summary", "practice", "learning"], steps: 4, tokens: 2000, compatibleModels: ["GPT-4", "Claude 3"], includes: ["Concept extractor", "Summary writer", "Practice problem generator", "Mnemonic creator"] },
  { title: "Science Experiment Designer", description: "Design safe, educational science experiments with hypothesis, procedure, materials list, and discussion questions.", price: 29.99, categoryId: "cat_6", tags: ["science", "experiment", "lab", "education", "stem"], steps: 6, tokens: 3200, compatibleModels: ["GPT-4", "Claude 3 Opus"], includes: ["Hypothesis generator", "Procedure writer", "Materials list", "Safety checker", "Data recorder", "Discussion prompter"] },
  { title: "Language Learning Companion", description: "Practice any language with immersive conversation scenarios, grammar explanations, and vocabulary building exercises.", price: 34.99, categoryId: "cat_6", tags: ["language", "learning", "conversation", "grammar", "vocabulary"], steps: 5, tokens: 4000, compatibleModels: ["GPT-4", "Claude 3"], includes: ["Scenario builder", "Grammar explainer", "Vocabulary expander", "Pronunciation guide", "Culture note prompter"] },

  // Research & Analysis (cat_7) - 5 more
  { title: "Literature Review Synthesizer", description: "Synthesize academic papers and research articles into comprehensive literature reviews with thematic analysis.", price: 44.99, categoryId: "cat_7", tags: ["research", "literature", "review", "academic", "synthesis"], steps: 5, tokens: 4500, compatibleModels: ["GPT-4", "Claude 3 Opus", "Gemini Ultra"], includes: ["Paper summarizer", "Theme finder", "Gap analyzer", "Synthesis writer", "Reference formatter"] },
  { title: "Research Methodology Designer", description: "Design robust research methodologies with appropriate sampling, data collection, and analysis techniques.", price: 39.99, categoryId: "cat_7", tags: ["methodology", "research", "sampling", "study-design", "academic"], steps: 5, tokens: 3500, compatibleModels: ["GPT-4", "Claude 3 Opus"], includes: ["Method selector", "Sampling strategist", "Data collection prompter", "Analysis planner", "Ethics checker"] },
  { title: "Data Visualisation Brief Generator", description: "Create detailed data visualization briefs specifying chart types, color schemes, annotations, and narrative flow.", price: 29.99, categoryId: "cat_7", tags: ["visualization", "charts", "data", "design", "presentation"], steps: 4, tokens: 2800, compatibleModels: ["GPT-4", "Claude 3", "Gemini Pro"], includes: ["Chart type selector", "Color scheme designer", "Annotation writer", "Narrative flow builder"] },
  { title: "Market Research Survey Builder", description: "Design effective market research surveys with unbiased questions, skip logic, and analysis frameworks.", price: 34.99, categoryId: "cat_7", tags: ["survey", "market-research", "questions", "analysis", "feedback"], steps: 5, tokens: 3000, compatibleModels: ["GPT-4", "Claude 3"], includes: ["Question designer", "Bias checker", "Skip logic builder", "Analysis framework", "Report template"] },
  { title: "Case Study Framework", description: "Structure compelling case studies with problem definition, solution analysis, results measurement, and lessons learned.", price: 24.99, categoryId: "cat_7", tags: ["case-study", "analysis", "framework", "business", "research"], steps: 5, tokens: 2800, compatibleModels: ["GPT-4", "Claude 3"], includes: ["Problem framer", "Solution analyzer", "Results measurer", "Lesson extractor", "Executive summary writer"] },

  // Marketing & SEO (cat_8) - 5 more
  { title: "Social Media Content Calendar Generator", description: "Plan and create month-long social media content calendars with platform-specific optimization and engagement strategies.", price: 24.99, categoryId: "cat_8", tags: ["social-media", "content", "calendar", "planning", "engagement"], steps: 5, tokens: 3000, compatibleModels: ["GPT-4", "Claude 3", "Gemini Pro"], includes: ["Platform strategist", "Content ideator", "Copywriter", "Hashtag researcher", "Engagement tracker"] },
  { title: "Google Ads Copy Optimizer", description: "Write high-converting Google Ads copy with keyword integration, ad extensions, and A/B test variations.", price: 34.99, categoryId: "cat_8", tags: ["google-ads", "ppc", "copywriting", "conversion", "seo"], steps: 4, tokens: 2800, compatibleModels: ["GPT-4", "Claude 3"], includes: ["Keyword integrator", "Headline generator", "Description writer", "Extension prompter", "A/B variant creator"] },
  { title: "Email Drip Campaign Architect", description: "Design automated email drip campaigns for lead nurturing, onboarding, and customer retention.", price: 29.99, categoryId: "cat_8", tags: ["email", "drip", "automation", "nurture", "retention"], steps: 6, tokens: 3500, compatibleModels: ["GPT-4", "Claude 3"], includes: ["Campaign strategist", "Email sequence writer", "Subject line tester", "CTA optimizer", "Timeline designer", "Analytics prompter"] },
  { title: "Influencer Outreach Script Generator", description: "Craft personalized influencer outreach messages that get responses and build authentic partnerships.", price: 19.99, categoryId: "cat_8", tags: ["influencer", "outreach", "partnership", "marketing", "growth"], steps: 3, tokens: 2000, compatibleModels: ["GPT-4", "Claude 3"], includes: ["Outreach strategist", "Message personalizer", "Follow-up sequence", "Partnership proposal template"] },
  { title: "Conversion Rate Optimization (CRO) Framework", description: "Systematically improve conversion rates through user research, hypothesis testing, and data-driven optimization.", price: 44.99, categoryId: "cat_8", tags: ["cro", "conversion", "optimization", "testing", "ux"], steps: 6, tokens: 4000, compatibleModels: ["GPT-4", "Claude 3 Opus"], includes: ["User research prompter", "Hypothesis generator", "Test designer", "Data analyzer", "Implementation planner", "Results reporter"] },
];

function generateBlueprint(index, data, authors, categories, difficulties) {
  const authorId = authors[index % authors.length];
  const categoryId = data.categoryId;
  const difficulty = difficulties[index % difficulties.length];
  const sales = Math.floor(Math.random() * 500) + 5;
  const rating = (3.5 + Math.random() * 1.5).toFixed(1);
  const reviewCount = Math.floor(sales * (0.05 + Math.random() * 0.15));
  const createdAt = new Date(2025, Math.floor(Math.random() * 4), Math.floor(Math.random() * 28) + 1).toISOString().split("T")[0];

  return {
    id: `bp_seed_${index + 13}`,
    title: data.title,
    description: data.description,
    longDescription: data.description + " This blueprint includes " + data.includes.join(", ") + ". Suitable for " + difficulty + " users.",
    price: data.price,
    categoryId,
    authorId,
    rating: parseFloat(rating),
    reviewCount,
    sales,
    difficulty,
    tags: data.tags,
    createdAt,
    updatedAt: createdAt,
    image: "/blueprints/default-pending.svg",
    featured: false,
    steps: data.steps,
    tokens: data.tokens,
    compatibleModels: data.compatibleModels,
    includes: data.includes,
    submissionStatus: "approved",
    reviewNotes: "",
    platformCommissionRate: 0.2,
  };
}

// Load existing blueprints
const existing = JSON.parse(fs.readFileSync(BLUEPRINTS_FILE, "utf-8"));
console.log(`Existing blueprints: ${existing.length}`);

// Generate new ones
const startIndex = existing.length;
newBlueprints.forEach((data, i) => {
  const bp = generateBlueprint(startIndex + i, data, authors, categories, difficulties);
  existing.push(bp);
});

fs.writeFileSync(BLUEPRINTS_FILE, JSON.stringify(existing, null, 2), "utf-8");
console.log(`Added ${newBlueprints.length} blueprints. Total: ${existing.length}`);
console.log("✅ Seed content generation complete.");
