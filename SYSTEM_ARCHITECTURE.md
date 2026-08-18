# System Architecture

> **NEXORA Consumer & Marketing Intelligence Platform**  
> *Architecture Status*: Active / Presentation Ready

---

## 1. Architecture Overview

The system follows a multi-tier decoupled architecture combining structured relational data storage, deterministic SQL analytical calculations, hybrid AI evidence synthesis, and a light React frontend interface.

```
+-----------------------------------------------------------------------+
|                           CSV DATASETS                                |
|           (15 Operational Files in data/raw/*.csv)                    |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                         DATA INGESTION                                |
|             (server/db.py — Idempotent CSV Loader)                    |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                         SQLITE DATABASE                               |
|          (data/database.sqlite — Foreign Keys Enabled)                |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                         FASTAPI BACKEND                               |
|                  (server/main.py — REST API)                          |
+-----------------------------------------------------------------------+
                |                                      |
                v                                      v
+-------------------------------+      +-------------------------------+
|       ANALYTICS ENGINE        |      |       AI REASONER LAYER       |
|    (server/analytics.py)      |      |     (server/ai_reasoner.py)   |
|   Deterministic SQL Math &    |      |  OBSERVED → INFERRED →        |
|     Metric Aggregation        |      |    RECOMMENDED Synthesis      |
+-------------------------------+      +-------------------------------+
                \                                      /
                 \------------------+-----------------/
                                    |
                                    v
+-----------------------------------------------------------------------+
|                         REACT FRONTEND                                |
|         (React 19 + Vite 6 + Recharts + Progressive Disclosure)       |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                              USER                                     |
|           (Brand Marketer / Analyst / Executive Leader)               |
+-----------------------------------------------------------------------+
```

---

## 2. Data Layer

The platform relies on 15 relational CSV datasets stored in `data/raw/` and ingested into SQLite tables:

| Table Name | Primary Key | Important Foreign Keys | Purpose |
| :--- | :--- | :--- | :--- |
| `product_categories` | `category_id` | None | Defines high-level e-commerce product categories |
| `products` | `product_id` | `category_id` $\rightarrow$ `product_categories` | Product catalog prices, cost prices, ratings, sentiment |
| `customer_segments` | `segment_id` | None | Buyer personas and demographic target bands |
| `customers` | `customer_id` | `segment_id` $\rightarrow$ `customer_segments` | Individual customer profiles and demographics |
| `campaigns` | `campaign_id` | `featured_product_id` $\rightarrow$ `products` | Master campaign intentions, budgets, targets, and dates |
| `social_accounts` | `account_id` | None | Platform channels (Meta Ads, Instagram, TikTok, YouTube) |
| `social_posts` | `post_id` | `account_id` $\rightarrow$ `social_accounts`, `campaign_id` $\rightarrow$ `campaigns` | Social creative posts, captions, and formats |
| `social_post_metrics` | `post_id` | `post_id` $\rightarrow$ `social_posts` | Performance metrics per post (impressions, clicks, saves) |
| `marketing_spend` | `spend_id` | `campaign_id` $\rightarrow$ `campaigns` | Daily channel spend breakdowns |
| `marketing_metrics` | `metric_id` | `campaign_id` $\rightarrow$ `campaigns` | Daily performance metrics per campaign |
| `orders` | `order_id` | `customer_id` $\rightarrow$ `customers` | Completed transactions and revenue totals |
| `order_items` | `item_id` | `order_id` $\rightarrow$ `orders`, `product_id` $\rightarrow$ `products` | Line-item product quantities and prices |
| `attribution` | `attribution_id` | `order_id` $\rightarrow$ `orders` | Multi-touch campaign attribution records |
| `daily_kpis` | `date` | None | Pre-aggregated daily brand-level revenue, spend, visits |
| `customer_acquisition`| `acquisition_id`| `customer_id` $\rightarrow$ `customers`, `campaign_id` $\rightarrow$ `campaigns` | Acquisition costs per customer |

---

## 3. Database Relationships

Relational integrity is enforced in SQLite (`data/database.sqlite`) via explicit Foreign Key constraints:

```
[Campaigns] ──┬──< [Marketing Spend] (campaign_id)
             ├──< [Marketing Metrics] (campaign_id)
             ├──< [Social Posts] (campaign_id)
             └──< [Customer Acquisition] (campaign_id)

[Social Accounts] ──< [Social Posts] (account_id) ──< [Social Post Metrics] (post_id)

[Customer Segments] ──< [Customers] (segment_id) ──┬──< [Orders] (customer_id)
                                                   └──< [Customer Acquisition] (customer_id)

[Orders] (order_id) ──┬──< [Attribution] (order_id)
                      └──< [Order Items] (order_id)

[Product Categories] ──< [Products] (category_id) ──┬──< [Order Items] (product_id)
                                                    └──< [Campaigns] (featured_product_id)
```

---

## 4. Data Ingestion Architecture

Data loading is managed by `server/db.py`:

1. **Database Initialization (`init_db`)**:
   - Creates `data/database.sqlite` if not present.
   - Executes DDL `CREATE TABLE IF NOT EXISTS` statements for all 15 tables.
   - Enables SQLite foreign keys: `PRAGMA foreign_keys = ON;`.

2. **CSV Loading (`ingest_csv_data`)**:
   - Clears existing table records idempotently.
   - Iterates through `data/raw/*.csv` files.
   - Converts raw strings to typed values (`FLOAT`, `INTEGER`, `TEXT`).
   - Executes batch `INSERT INTO` queries within a single SQLite transaction block.

3. **Reload Endpoint (`/api/ingest/reload`)**:
   - Exposes re-ingestion capability via REST POST request, allowing live dataset refreshes.

---

## 5. Analytics Layer

The analytics layer (`server/analytics.py`) performs deterministic SQL queries directly against SQLite. No mathematical estimations or LLM approximations are used for primary metrics.

### Key Implemented SQL Calculations:

- **Overall Return on Ad Spend (ROAS)**:
  ```sql
  SELECT SUM(total_revenue) / SUM(total_marketing_spend) FROM daily_kpis;
  ```
- **Click-Through Rate (CTR %)**:
  ```sql
  SELECT (SUM(clicks) * 100.0 / SUM(impressions)) FROM marketing_metrics WHERE campaign_id = ?;
  ```
- **Conversion Rate (%)**:
  ```sql
  SELECT (SUM(conversions) * 100.0 / SUM(clicks)) FROM marketing_metrics WHERE campaign_id = ?;
  ```
- **Cost Per Acquisition (CPA)**:
  ```sql
  SELECT (SUM(spend) / SUM(conversions)) FROM ...;
  ```
- **Repeat Purchase Rate (%)**:
  ```sql
  SELECT (COUNT(CASE WHEN order_count > 1 THEN 1 END) * 100.0 / COUNT(*))
  FROM (SELECT customer_id, COUNT(order_id) as order_count FROM orders GROUP BY customer_id);
  ```
- **Product Gross Margin (%)**:
  ```sql
  SELECT ((price - cost_price) / price) * 100.0 FROM products;
  ```
- **Customer Segment Avg LTV**:
  ```sql
  SELECT (SUM(orders.total_revenue) / COUNT(DISTINCT customers.customer_id))
  FROM customer_segments JOIN customers JOIN orders GROUP BY segment_id;
  ```
- **5-Stage Funnel Efficiency (%)**:
  Calculates step-by-step conversion efficiency across `1. Impressions` $\rightarrow$ `2. Website Visits` $\rightarrow$ `3. Product Page Views` $\rightarrow$ `4. Add to Carts` $\rightarrow$ `5. Orders`.

---

## 6. AI Reasoning Layer

The hybrid AI reasoning engine (`server/ai_reasoner.py`) sits directly on top of the deterministic analytics layer. It accepts computed analytical data payloads and formats insights into three mandatory structural sections:

1. **`[OBSERVED]`**: Verifiable empirical statements generated directly from database results.
2. **`[INFERRED]`**: Analytical interpretations explaining underlying drivers (e.g., scale vs. efficiency trade-offs).
3. **`[RECOMMENDED]`**: Prioritized strategic actions based on observed evidence and inferences.

> **Architecture Principle**: The AI reasoning layer does **NOT** compute raw metrics or alter mathematical calculations. Deterministic SQL math remains the single source of truth.

---

## 7. API Layer

The API layer is built using FastAPI (`server/main.py`) and communicates via JSON over HTTP:

```
GET  /api/health                     --> System health & database connection verification
POST /api/ingest/reload              --> Triggers full CSV-to-SQLite database re-ingestion
GET  /api/analytics/overview         --> Returns total revenue, ROAS, orders, and monthly trends
GET  /api/analytics/campaigns        --> Returns campaign intention, execution, and results
POST /api/analytics/compare          --> Returns side-by-side campaign comparison matrix
GET  /api/analytics/content          --> Returns social post leaderboard, format & theme breakdowns
GET  /api/analytics/commerce         --> Returns product revenue/margin matrix and segment LTV
GET  /api/analytics/funnel           --> Returns 5-stage conversion funnel drop-off metrics
GET  /api/projects                   --> Returns workspace campaign projects list
POST /api/projects                   --> Creates new project and attaches uploaded dataset files
DELETE /api/projects/{project_id}    --> Deletes custom user-created project
POST /api/ai/interpret               --> Returns structured OBSERVED/INFERRED/RECOMMENDED insights
POST /api/ai/recommend-next-campaign --> Returns executive next-campaign blueprint report
```

---

## 8. Frontend Layer

The frontend is built using React 19 and Vite 6, styled with vanilla CSS design tokens (`src/index.css`):

- **Main Navigation Router (`App.jsx`)**: Renders top tab navigation (`Overview`, `Analyze`, `Projects`, `Strategy`).
- **Overview View (`OverviewView.jsx`)**: Executive summary, quiet primary KPIs, key finding visual anchor, and gateway action rows.
- **Analyze View (`AnalyzeView.jsx`)**: Domain selector pills (*Campaigns*, *Content*, *Commerce*, *Customers*, *Funnel*) and progressive disclosure toggles.
- **Campaign Comparison (`CampaignComparison.jsx`)**: Side-by-side comparison matrix, metric customization dropdown, and trade-off analysis.
- **Projects View (`ProjectsView.jsx`)**: Operational project list with lightweight details popover.
- **Strategy View (`StrategyView.jsx`)**: Editorial strategic report presenting execution blueprints and priority action items.

### Progressive Disclosure Model
```
[ ANALYSIS DOMAIN TITLE & CONTEXT ]
  ↓
[ IMPORTANT METRICS & MAIN FINDING ] (Always Pinned Visual Anchor)
  ↓
[ View Evidence & Details ↓ ] --> Expands Data Tables & Recharts Graphs
  ↓
[ View AI Reasoning ↓ ]      --> Expands OBSERVED / INFERRED / RECOMMENDED Panels
```

---

## 9. Application User Flow

```
USER ACCESSIBILITY
  │
  ├──> OVERVIEW TAB
  │     ├── 4 Quiet Primary KPIs
  │     ├── Key Analytical Finding Anchor
  │     └── What Do You Want To Analyze? Action Gateway
  │
  ├──> ANALYZE TAB
  │     ├── Select Domain Pill (Campaigns | Content | Commerce | Customers | Funnel)
  │     ├── View Pinned Summary & Main Finding
  │     ├── Expand Evidence & Details (Tables & Charts)
  │     └── Expand AI Reasoning ([OBSERVED] | [INFERRED] | [RECOMMENDED])
  │
  ├──> PROJECTS TAB
  │     └── View Campaign Project List & Details Popover
  │
  └──> STRATEGY TAB
        └── View Executive Strategic Intelligence Report & Blueprint
```

---

## 10. Security & Production Considerations

As a **v1.0 Functional Prototype**, the current architecture prioritizes deterministic analytical correctness and local execution simplicity. For future production SaaS deployment, the following architectural upgrades would be required:

| Component | Current Prototype State | Required Production Architecture |
| :--- | :--- | :--- |
| **Authentication** | None (Local single-user access) | OAuth 2.0 / OIDC / JWT Session Authentication |
| **Authorization** | None | Role-Based Access Control (RBAC) & Tenant Isolation |
| **Secrets Management**| Local environment variables | AWS Secrets Manager / HashiCorp Vault |
| **API Security** | Open CORS (`*`) | Restricted CORS, API Rate Limiting & Web Application Firewall |
| **Database** | File-based SQLite 3 | Managed PostgreSQL / AWS RDS with Connection Pooling |
| **Data Ingestion** | Local CSV File Loader | Scheduled Apache Airflow / AWS Lambda ETL Pipeline |
| **Hosting** | FastAPI Uvicorn on Port 5000 | Containerized Docker deployment on AWS ECS / Kubernetes |

---

## 11. Current Architecture Status

```
Architecture Status: v1.0 Functional Prototype — Frozen
```
