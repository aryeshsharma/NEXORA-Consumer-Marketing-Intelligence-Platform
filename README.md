# NEXORA — Consumer & Marketing Intelligence Platform

> **NEXORA DTC Brand Intelligence Workspace**  
> *Version*: v1.0 Prototype | *Status*: Active / Presentation Ready

---

## 1. Project Overview

The **Consumer & Marketing Intelligence Platform** is a functional analytical prototype designed to help brand marketing leaders, data analysts, and commercial finance teams answer core operational questions:

- **What happened?** (Historical sales, campaign return, social engagement, and traffic conversion)
- **Why did it happen?** (Channel spend mix, creative format efficiency, and customer segment preferences)
- **What patterns can be identified?** (Repeat purchase behaviors, product margin velocity, and funnel drop-offs)
- **How do business activities compare?** (Side-by-side campaign return on ad spend and trade-off analysis)
- **What should the brand do next?** (Evidence-backed strategic direction for upcoming growth pushes)

The platform combines structured historical brand data, deterministic analytical math, and hybrid AI reasoning to convert raw business data into structured **Data $\rightarrow$ Analysis $\rightarrow$ Insight $\rightarrow$ Comparison $\rightarrow$ Recommendation**.

> **Note**: This system is built as a **FUNCTIONAL PROTOTYPE** demonstrating end-to-end intelligence workflows, not a multi-tenant production SaaS application.

---

## 2. Core Users

1. **Brand Marketing Teams**:
   - Evaluate historical campaign performance across channels (Meta, TikTok, Google, YouTube).
   - Analyze creative format engagement (Reels vs. Carousels vs. Long Video).
   - Optimize ad spend allocation based on cost per acquisition (CPA) and clickthrough rates (CTR).

2. **Marketing Decision-Makers & Growth Strategists**:
   - Compare historical marketing pushes side-by-side to understand scale vs. efficiency trade-offs.
   - Review executive strategic recommendations for future campaign angles, offer structures, and channel splits.

3. **Financial & Commercial Teams**:
   - Monitor total brand revenue, marketing spend, net profit, and gross product margins.
   - Track Average Order Value (AOV), customer repeat purchase rates (75.7%), and Customer Lifetime Value (LTV) across customer segments.

---

## 3. Core Workflow

```
DATA (15 Raw CSV Datasets)
  ↓
INGESTION ENGINE (idempotent CSV loader)
  ↓
RELATIONAL STORAGE (SQLite Database with Foreign Key Constraints)
  ↓
DETERMINISTIC ANALYTICS (Exact SQL Math & Metric Aggregation)
  ↓
EVIDENCE (Charts, Matrix Tables, Funnel Breakdown)
  ↓
AI REASONING (OBSERVED → INFERRED → RECOMMENDED Synthesis)
  ↓
STRATEGIC RECOMMENDATIONS (Next-Campaign Execution Blueprint)
```

1. **Data Ingestion**: Raw operational CSV files are loaded into SQLite relational tables.
2. **Deterministic Analytics**: SQL queries compute exact financial, customer, and marketing KPIs.
3. **Evidence**: Interactive tables and visual charts allow inspection of underlying numbers.
4. **AI Reasoning**: A structured reasoning layer categorizes analytical findings without hallucinated values.
5. **Strategic Recommendations**: The system generates actionable blueprints and experiment priorities.

---

## 4. Main Application Areas

The application interface is structured into **four primary navigation areas**:

### 1. Overview
- High-level business overview for the NEXORA DTC brand.
- 4 quiet primary KPIs: **Revenue (\$677K)**, **Overall ROAS (3.54x)**, **Orders (2,800)**, and **Repeat Purchase Rate (75.7%)**.
- Key Analytical Finding pinned as the main visual anchor.
- Direct entry rows into specific analytical domains.

### 2. Analyze
Unified investigation space covering five specialized analytical domains:
- **Campaign Performance**: Intention vs. execution return across 5 historical marketing pushes.
- **Content & Social**: Social post leaderboard (40 posts), format breakdown (Reels vs. Carousel), and theme metrics.
- **Commerce & Merchandising**: 12-product revenue matrix, unit margins, and qualitative review sentiment.
- **Customer Segments**: 5 demographic customer segments, purchase frequency, AOV, and customer LTV.
- **Traffic & Funnel**: 5-stage conversion funnel drop-off analysis (Ad impressions to completed orders).

**Progressive Disclosure Architecture**:
```
SUMMARY & MAIN FINDING (Always Visible Anchor)
  ↓
[ View Evidence & Details ] (Expands charts, matrices, & data tables below)
  ↓
[ View AI Reasoning ] (Expands [OBSERVED], [INFERRED], [RECOMMENDED] insights)
```

### 3. Projects
- Simple operational workspace listing historical brand campaigns with status badges (*Completed*).
- Interactive project details popover displaying campaign objectives, timelines, and budgets.

### 4. Strategy
- Concise Strategic Intelligence Report generated from historical data evidence.
- Documents: **Strategic Summary**, **What Is Working (High Impact)**, **What Is Underperforming**, **Execution Blueprint**, and **Priority Action Items**.

---

## 5. Key Analytical Capabilities & Implemented Formulas

All calculations are performed deterministically in Python (`server/analytics.py`) using SQLite queries:

- **Return on Ad Spend (ROAS)**:  
  $$\text{ROAS} = \frac{\text{Attributed Revenue}}{\text{Actual Marketing Spend}}$$
- **Click-Through Rate (CTR %)**:  
  $$\text{CTR} = \left( \frac{\text{Clicks}}{\text{Impressions}} \right) \times 100$$
- **Conversion Rate (%)**:  
  $$\text{Conversion Rate} = \left( \frac{\text{Conversions}}{\text{Clicks}} \right) \times 100$$
- **Cost Per Acquisition (CPA)**:  
  $$\text{CPA} = \frac{\text{Actual Spend}}{\text{Conversions}}$$
- **Cost Per Click (CPC)**:  
  $$\text{CPC} = \frac{\text{Actual Spend}}{\text{Clicks}}$$
- **Cost Per Mille (CPM)**:  
  $$\text{CPM} = \left( \frac{\text{Actual Spend}}{\text{Impressions}} \right) \times 1000$$
- **Average Order Value (AOV)**:  
  $$\text{AOV} = \frac{\text{Total Revenue}}{\text{Total Orders}}$$
- **Repeat Purchase Rate (%)**:  
  $$\text{Repeat Purchase Rate} = \left( \frac{\text{Distinct Customers with }>1\text{ Order}}{\text{Total Distinct Customers}} \right) \times 100$$
- **Net Profit**:  
  $$\text{Net Profit} = \text{Total Revenue} - \text{Total Marketing Spend}$$
- **Funnel Stage Step Efficiency (%)**:  
  $$\text{Step Efficiency} = \left( \frac{\text{Count in Current Stage}}{\text{Count in Previous Stage}} \right) \times 100$$
- **Product Gross Margin (%)**:  
  $$\text{Margin \%} = \left( \frac{\text{Price} - \text{Cost Price}}{\text{Price}} \right) \times 100$$
- **Customer Segment LTV**:  
  $$\text{Segment Avg LTV} = \frac{\text{Total Segment Revenue}}{\text{Total Segment Customers}}$$

---

## 6. AI Reasoning System

The platform uses a hybrid AI reasoning architecture (`server/ai_reasoner.py`) that ingests computed analytical metrics and outputs structured insights across three distinct layers:

1. **`[OBSERVED]`**: Directly verifiable facts extracted from database queries (e.g., *"Diwali & Festive Glow Mega Sale generated $305K revenue at 5.24x ROAS"*).
2. **`[INFERRED]`**: Analytical interpretations based on combined evidence (e.g., *"Retargeting pushes maximize conversion efficiency, while short video Reels drive top-of-funnel discovery"*).
3. **`[RECOMMENDED]`**: Concrete business actions suggested by the evidence (e.g., *"Allocate 50% of budget to short video Reels and establish cart-abandonment email workflows"*).

> **Non-Conversational Design**: The AI system operates as an automated reasoning engine attached to analytical evidence. It is intentionally designed without conversational chatbot windows, prompt boxes, or avatars.

---

## 7. Data Architecture (15 CSV Datasets)

The prototype operates on 15 synthetic operational datasets covering 2025 brand activity for NEXORA (13,292 total records), stored in `data/raw/`:

| Dataset Filename | Description / Purpose | Record Count |
| :--- | :--- | :---: |
| `campaigns.csv` | Master metadata for historical marketing campaigns | 5 campaigns |
| `social_accounts.csv` | Social channel accounts (Instagram, Meta Ads, TikTok, YouTube) | 4 accounts |
| `social_posts.csv` | Metadata for published organic and paid social posts | 40 posts |
| `social_post_metrics.csv` | Impressions, reach, engagement, saves, and link clicks per post | 40 rows |
| `marketing_spend.csv` | Daily channel spend breakdowns across campaigns | 636 rows |
| `marketing_metrics.csv` | Daily impressions, clicks, conversions, and revenue per campaign | 212 rows |
| `product_categories.csv` | E-commerce product taxonomy categories | 4 categories |
| `products.csv` | Product catalog with prices, cost prices, margins, and ratings | 12 products |
| `customer_segments.csv` | Target buyer personas and demographic definitions | 5 segments |
| `customers.csv` | Customer directory with age, gender, location, and segment linkage | 1,200 customers |
| `orders.csv` | Completed customer orders with revenue, timestamps, and customer links | 2,800 orders |
| `order_items.csv` | Line-item product purchases per order | 4,081 items |
| `customer_acquisition.csv` | Customer acquisition records with CPA per campaign | 1,088 rows |
| `attribution.csv` | Multi-touch campaign attribution mapping per order | 2,800 rows |
| `daily_kpis.csv` | Pre-aggregated daily brand revenue, spend, visits, and orders | 365 days |

---

## 8. Database Architecture

- **Database System**: SQLite 3 (`data/database.sqlite`).
- **Foreign Key Constraints**: Enforced via `PRAGMA foreign_keys = ON;`.
- **Relational Integrity**:
  - `products` $\rightarrow$ `product_categories` (`category_id`)
  - `customers` $\rightarrow$ `customer_segments` (`segment_id`)
  - `campaigns` $\rightarrow$ `products` (`featured_product_id`)
  - `social_posts` $\rightarrow$ `social_accounts` (`account_id`), `campaigns` (`campaign_id`)
  - `social_post_metrics` $\rightarrow$ `social_posts` (`post_id`)
  - `marketing_spend` $\rightarrow$ `campaigns` (`campaign_id`)
  - `marketing_metrics` $\rightarrow$ `campaigns` (`campaign_id`)
  - `orders` $\rightarrow$ `customers` (`customer_id`)
  - `order_items` $\rightarrow$ `orders` (`order_id`), `products` (`product_id`)
  - `attribution` $\rightarrow$ `orders` (`order_id`)
  - `customer_acquisition` $\rightarrow$ `customers` (`customer_id`), `campaigns` (`campaign_id`)
- **Ingestion & Seeding**: Controlled via `server/db.py`. On startup, tables are initialized and CSVs are idempotently ingested.

---

## 9. Technical Stack

- **Frontend**:
  - React 19
  - Vite 6
  - Recharts 2 (Data Visualization)
  - Lucide React (Icons)
  - Vanilla CSS (`src/index.css` design tokens)
- **Backend**:
  - Python 3.12
  - FastAPI 0.115+
  - Uvicorn (ASGI Web Server)
  - SQLite3 (Standard Library)
  - Pydantic (Request Validation)
- **Tooling & Build**:
  - npm / Vite bundler
  - Standard REST API JSON communication

---

## 10. Project Directory Structure

```
d:/WORK/PROJECT/
├── data/
│   ├── database.sqlite            # SQLite database file
│   └── raw/                       # 15 Raw CSV datasets
│       ├── attribution.csv
│       ├── campaigns.csv
│       ├── customer_acquisition.csv
│       ├── customer_segments.csv
│       ├── customers.csv
│       ├── daily_kpis.csv
│       ├── marketing_metrics.csv
│       ├── marketing_spend.csv
│       ├── order_items.csv
│       ├── orders.csv
│       ├── product_categories.csv
│       ├── products.csv
│       ├── social_accounts.csv
│       ├── social_post_metrics.csv
│       └── social_posts.csv
├── dist/                          # Production Vite build assets
│   ├── assets/
│   └── index.html
├── scripts/
│   └── generate_data.py           # Synthetic dataset generator script
├── server/
│   ├── ai_reasoner.py             # Hybrid AI reasoning engine
│   ├── analytics.py               # Deterministic analytics calculation engine
│   ├── db.py                      # SQLite DDL schema and CSV loader
│   └── main.py                    # FastAPI server & static file host
├── src/
│   ├── components/
│   │   ├── AnalyzeView.jsx        # Unified domain analysis & progressive disclosure
│   │   ├── CampaignComparison.jsx # Side-by-side campaign comparison matrix
│   │   ├── OverviewView.jsx       # Business summary & entry points
│   │   ├── ProjectsView.jsx       # Historical campaign projects workspace
│   │   └── StrategyView.jsx       # Editorial Strategic Intelligence Report
│   ├── App.jsx                    # Navigation bar & top-level layout router
│   ├── index.css                  # Light editorial CSS design tokens
│   └── main.jsx                   # React application entry point
├── index.html                     # HTML template
├── package.json                   # Dependencies and scripts
├── vite.config.js                 # Vite build configuration
├── README.md                      # Primary project documentation
└── SYSTEM_ARCHITECTURE.md         # Technical architecture documentation
```

---

## 11. API Endpoints Reference

The FastAPI backend exposes the following REST API endpoints:

| Endpoint | Method | Purpose | Response Payload |
| :--- | :---: | :--- | :--- |
| `/api/health` | GET | System health & DB connection status | `{"status": "online", "brand": "NEXORA", ...}` |
| `/api/ingest/reload` | POST | Triggers idempotent CSV data reloading | `{"status": "success", "tables_loaded": [...]}` |
| `/api/analytics/overview` | GET | Executive revenue, spend, ROAS & monthly trends | Summary object & monthly trend array |
| `/api/analytics/campaigns` | GET | Intention vs. execution metrics for all campaigns | List of campaign detail objects |
| `/api/analytics/compare` | POST | Multi-campaign comparison matrix & rankings | Matrix array, rankings, & trade-off text |
| `/api/analytics/content` | GET | Social post leaderboard, format & theme breakdown | Leaderboard, `by_format`, & `by_theme` arrays |
| `/api/analytics/commerce` | GET | Product revenue/margin matrix & customer segments | `products` array & `segments` array |
| `/api/analytics/funnel` | GET | 5-stage conversion funnel drop-off metrics | `funnel_stages` array & overall conv rate |
| `/api/projects` | GET, POST | List workspace projects & create new project with dataset upload | List of project metadata objects / Created project |
| `/api/ai/interpret` | POST | Generates structured AI reasoning for a domain | `{"observed": [...], "inferred": [...], "recommended": [...]}` |
| `/api/ai/recommend-next-campaign` | POST | Generates strategic direction blueprint report | `{"strategic_direction": {...}}` |

---

## 12. Local Setup & Execution Instructions

### Prerequisites
- **Python 3.10+** (Python 3.12 recommended)
- **Node.js 18+** & `npm`

### Step 1: Clone & Install Frontend Dependencies
```bash
cd d:/WORK/PROJECT
npm install
```

### Step 2: Install Python Backend Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Run Backend & Serve Application
```bash
python server/main.py
```
*The FastAPI server will start at `http://127.0.0.1:5000`.*

### Step 4: Access Application
Open your browser and navigate to:  
**`http://127.0.0.1:5000`**

### Step 5: Rebuilding Frontend (Optional)
If modifying frontend code, rebuild the production bundle:
```bash
npm run build
```

---

## 13. Data Reload Mechanism

To re-ingest the CSV datasets from scratch into SQLite without restarting the process:

**Via API**:
Send a `POST` request to `http://127.0.0.1:5000/api/ingest/reload`.

**Via CLI**:
```bash
python server/db.py
```
This process clears existing table data and repopulates SQLite directly from `data/raw/*.csv`.

---

## 14. Validation & Quality Verification Status

- **Production Build**: Verified (`npm run build` completes in 5.04s, 0 errors).
- **API Health**: Verified (`/api/health` returns `200 OK`).
- **Database Storage**: Verified (SQLite foreign keys enforced, 13,292 records loaded).
- **Data Pipeline**: Verified (`/api/ingest/reload` executes idempotently).
- **Analytics Calculations**: Verified (Exact math for ROAS, CTR, Conv Rate, CPA, AOV, Repeat Purchase Rate).
- **AI Reasoning**: Verified (Structured `OBSERVED`, `INFERRED`, `RECOMMENDED` output).
- **Workflows**: Verified (All 14 UI views and navigation tabs confirmed fully operational).

---

## 15. Prototype Scope & Limitations

- **Functional Prototype Scope**: Built as a demonstration prototype for a single DTC brand ("NEXORA").
- **Mock/Synthetic Datasets**: Operating on 15 generated operational CSV files for FY2025.
- **Local Deployment**: Configured for local execution via FastAPI static file hosting on port 5000.
- **No Production Auth**: Authentication, role-based access control (RBAC), and multi-tenant DB isolation are omitted by design.
- **No Live Social API Connections**: Social post metrics are loaded from relational tables rather than live Instagram/TikTok Graph APIs.

---

## 16. Future Scope

Future extensions beyond the v1.0 functional prototype may include:
- Direct API connectors for Meta Ads Manager, Shopify Admin API, and Google Analytics 4.
- Automated ETL background jobs for daily incremental CSV/S3 ingestion.
- Multi-brand enterprise workspace architecture.
- Machine learning predictive models for dynamic ad spend allocation.

---

## 17. Project Status

```
Version: v1.0 Prototype
Status: Frozen / Ready for Presentation
```
