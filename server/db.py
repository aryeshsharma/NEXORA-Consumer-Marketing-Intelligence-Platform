import os
import sqlite3
import csv
import json
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
DB_PATH = os.path.join(DATA_DIR, "database.sqlite")
DATA_RAW_DIR = os.path.join(DATA_DIR, "raw")
UPLOADS_DIR = os.path.join(DATA_DIR, "uploads")
ACTIVE_DATASET_FILE = os.path.join(DATA_DIR, "active_dataset.json")

TABLE_FILE_MAP = [
    ("product_categories", "product_categories.csv"),
    ("products", "products.csv"),
    ("customer_segments", "customer_segments.csv"),
    ("customers", "customers.csv"),
    ("campaigns", "campaigns.csv"),
    ("social_accounts", "social_accounts.csv"),
    ("social_posts", "social_posts.csv"),
    ("social_post_metrics", "social_post_metrics.csv"),
    ("marketing_spend", "marketing_spend.csv"),
    ("marketing_metrics", "marketing_metrics.csv"),
    ("orders", "orders.csv"),
    ("order_items", "order_items.csv"),
    ("customer_acquisition", "customer_acquisition.csv"),
    ("attribution", "attribution.csv"),
    ("daily_kpis", "daily_kpis.csv")
]

REQUIRED_TABLE_COLUMNS = {
    "product_categories": ["category_id", "category_name"],
    "products": ["product_id", "category_id", "product_name", "price", "cost_price"],
    "customer_segments": ["segment_id", "segment_name"],
    "customers": ["customer_id", "name", "email", "created_at", "segment_id"],
    "campaigns": ["campaign_id", "campaign_name", "objective", "start_date", "end_date", "budget"],
    "social_accounts": ["account_id", "platform", "handle"],
    "social_posts": ["post_id", "account_id", "campaign_id", "format", "published_at"],
    "social_post_metrics": ["post_id", "date", "impressions", "reach", "likes", "comments", "shares", "saves"],
    "marketing_spend": ["spend_id", "campaign_id", "date", "channel", "spend"],
    "marketing_metrics": ["metric_id", "campaign_id", "date", "impressions", "reach", "clicks", "conversions", "attributed_revenue"],
    "orders": ["order_id", "customer_id", "order_date", "subtotal", "total_revenue"],
    "order_items": ["item_id", "order_id", "product_id", "quantity", "unit_price", "total_price"],
    "customer_acquisition": ["acquisition_id", "customer_id", "campaign_id", "channel", "acquisition_date", "cpa"],
    "attribution": ["attribution_id", "order_id", "campaign_id", "touchpoint_channel", "touchpoint_type", "attributed_revenue"],
    "daily_kpis": ["date", "total_revenue", "total_orders", "total_marketing_spend", "total_impressions", "total_website_visits"]
}

NUMERIC_COLUMNS = {
    "products": ["price", "cost_price"],
    "marketing_spend": ["spend"],
    "marketing_metrics": ["impressions", "reach", "clicks", "conversions", "attributed_revenue"],
    "orders": ["subtotal", "total_revenue"],
    "order_items": ["quantity", "unit_price", "total_price"],
    "customer_acquisition": ["cpa"],
    "attribution": ["attributed_revenue"],
    "daily_kpis": ["total_revenue", "total_orders", "total_marketing_spend", "total_impressions", "total_website_visits"]
}

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_db_connection()
    cursor = conn.cursor()

    # Enable foreign key constraints
    cursor.execute("PRAGMA foreign_keys = ON;")

    # 1. Product Categories
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS product_categories (
        category_id TEXT PRIMARY KEY,
        category_name TEXT NOT NULL,
        description TEXT
    );
    """)

    # 2. Products
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS products (
        product_id TEXT PRIMARY KEY,
        category_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        sku TEXT UNIQUE,
        price REAL NOT NULL,
        cost_price REAL NOT NULL,
        margin_percent REAL,
        avg_rating REAL,
        review_count INTEGER,
        sample_review TEXT,
        review_sentiment TEXT,
        FOREIGN KEY (category_id) REFERENCES product_categories(category_id)
    );
    """)

    # 3. Customer Segments
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS customer_segments (
        segment_id TEXT PRIMARY KEY,
        segment_name TEXT NOT NULL,
        age_band TEXT,
        gender_focus TEXT,
        region TEXT,
        purchasing_behavior TEXT
    );
    """)

    # 4. Customers
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS customers (
        customer_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        created_at TEXT NOT NULL,
        segment_id TEXT NOT NULL,
        age INTEGER,
        gender TEXT,
        location TEXT,
        FOREIGN KEY (segment_id) REFERENCES customer_segments(segment_id)
    );
    """)

    # 5. Campaigns
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS campaigns (
        campaign_id TEXT PRIMARY KEY,
        campaign_name TEXT NOT NULL,
        objective TEXT,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        budget REAL NOT NULL,
        target_audience TEXT,
        geo_targeting TEXT,
        demographic_targeting TEXT,
        channels TEXT,
        ad_formats TEXT,
        featured_product_id TEXT,
        campaign_message TEXT,
        offer_discount TEXT,
        planned_roas REAL,
        planned_conversions INTEGER,
        FOREIGN KEY (featured_product_id) REFERENCES products(product_id)
    );
    """)

    # 6. Social Accounts
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS social_accounts (
        account_id TEXT PRIMARY KEY,
        platform TEXT NOT NULL,
        handle TEXT NOT NULL,
        followers INTEGER,
        growth_rate TEXT
    );
    """)

    # 7. Social Posts
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS social_posts (
        post_id TEXT PRIMARY KEY,
        account_id TEXT NOT NULL,
        campaign_id TEXT NOT NULL,
        content_theme TEXT,
        format TEXT NOT NULL,
        published_at TEXT NOT NULL,
        caption TEXT,
        post_url TEXT,
        FOREIGN KEY (account_id) REFERENCES social_accounts(account_id),
        FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id)
    );
    """)

    # 8. Social Post Metrics
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS social_post_metrics (
        post_id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        impressions INTEGER NOT NULL,
        reach INTEGER NOT NULL,
        likes INTEGER NOT NULL,
        comments INTEGER NOT NULL,
        shares INTEGER NOT NULL,
        saves INTEGER NOT NULL,
        video_views INTEGER NOT NULL,
        watch_time_sec INTEGER NOT NULL,
        link_clicks INTEGER NOT NULL,
        FOREIGN KEY (post_id) REFERENCES social_posts(post_id)
    );
    """)

    # 9. Marketing Spend
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS marketing_spend (
        spend_id TEXT PRIMARY KEY,
        campaign_id TEXT NOT NULL,
        date TEXT NOT NULL,
        channel TEXT NOT NULL,
        spend REAL NOT NULL,
        cpc REAL NOT NULL,
        cpm REAL NOT NULL,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id)
    );
    """)

    # 10. Marketing Metrics
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS marketing_metrics (
        metric_id TEXT PRIMARY KEY,
        campaign_id TEXT NOT NULL,
        date TEXT NOT NULL,
        impressions INTEGER NOT NULL,
        reach INTEGER NOT NULL,
        frequency REAL NOT NULL,
        clicks INTEGER NOT NULL,
        ctr REAL NOT NULL,
        conversions INTEGER NOT NULL,
        conversion_rate REAL NOT NULL,
        attributed_revenue REAL NOT NULL,
        FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id)
    );
    """)

    # 11. Orders
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS orders (
        order_id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        order_date TEXT NOT NULL,
        subtotal REAL NOT NULL,
        discount_amount REAL NOT NULL,
        tax REAL NOT NULL,
        shipping REAL NOT NULL,
        total_revenue REAL NOT NULL,
        order_status TEXT NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
    );
    """)

    # 12. Order Items
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS order_items (
        item_id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        total_price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(order_id),
        FOREIGN KEY (product_id) REFERENCES products(product_id)
    );
    """)

    # 13. Customer Acquisition
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS customer_acquisition (
        acquisition_id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        campaign_id TEXT NOT NULL,
        channel TEXT NOT NULL,
        acquisition_date TEXT NOT NULL,
        cpa REAL NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
        FOREIGN KEY (campaign_id) REFERENCES campaigns(campaign_id)
    );
    """)

    # 14. Attribution
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS attribution (
        attribution_id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        campaign_id TEXT NOT NULL,
        touchpoint_channel TEXT NOT NULL,
        touchpoint_type TEXT NOT NULL,
        attributed_revenue REAL NOT NULL,
        attribution_weight REAL NOT NULL,
        confidence_score REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(order_id)
    );
    """)

    # 15. Daily KPIs
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS daily_kpis (
        date TEXT PRIMARY KEY,
        total_revenue REAL NOT NULL,
        total_orders INTEGER NOT NULL,
        new_customers INTEGER NOT NULL,
        returning_customers INTEGER NOT NULL,
        total_marketing_spend REAL NOT NULL,
        total_impressions INTEGER NOT NULL,
        total_website_visits INTEGER NOT NULL,
        total_product_views INTEGER NOT NULL,
        total_add_to_carts INTEGER NOT NULL,
        overall_roas REAL NOT NULL,
        aov REAL NOT NULL
    );
    """)

    conn.commit()
    conn.close()

def get_active_dataset_info():
    if os.path.exists(ACTIVE_DATASET_FILE):
        try:
            with open(ACTIVE_DATASET_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "active_dataset_type": "baseline",
        "active_project_id": "PRJ-00",
        "active_brand_name": "NEXORA",
        "active_project_name": "NEXORA Baseline Demo Dataset",
        "source_dir": DATA_RAW_DIR,
        "activated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

def set_active_dataset_info(info: dict):
    with open(ACTIVE_DATASET_FILE, "w", encoding="utf-8") as f:
        json.dump(info, f, indent=2)

def validate_dataset(source_dir: str) -> dict:
    """
    Validates that source_dir contains all 15 required CSVs, 
    with proper column headers, parseable numeric types, and foreign key integrity.
    Raises ValueError with descriptive diagnostics if validation fails.
    """
    if not os.path.exists(source_dir):
        raise ValueError(f"Dataset directory not found: {source_dir}")

    # 1. Check all 15 CSV files exist
    missing_files = []
    for table_name, csv_filename in TABLE_FILE_MAP:
        csv_path = os.path.join(source_dir, csv_filename)
        if not os.path.exists(csv_path):
            missing_files.append(csv_filename)

    if missing_files:
        raise ValueError(f"Missing required CSV dataset files ({len(missing_files)}/15 missing): {', '.join(missing_files)}")

    # 2. Check structure, headers, and numeric types for each file
    parsed_tables = {}
    row_counts = {}

    for table_name, csv_filename in TABLE_FILE_MAP:
        csv_path = os.path.join(source_dir, csv_filename)
        try:
            with open(csv_path, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                rows = list(reader)
        except Exception as e:
            raise ValueError(f"Failed to parse CSV file '{csv_filename}': {str(e)}")

        if not rows:
            raise ValueError(f"Dataset file '{csv_filename}' is empty (no data rows found).")

        headers = list(rows[0].keys())
        required_cols = REQUIRED_TABLE_COLUMNS.get(table_name, [])
        missing_cols = [c for c in required_cols if c not in headers]
        if missing_cols:
            raise ValueError(f"Dataset file '{csv_filename}' is missing required columns: {', '.join(missing_cols)}")

        # Validate numeric types on rows
        num_cols = NUMERIC_COLUMNS.get(table_name, [])
        for r_idx, row in enumerate(rows[:50]):  # validate sample rows
            for col in num_cols:
                if col in row and row[col] not in (None, ""):
                    try:
                        float(row[col])
                    except ValueError:
                        raise ValueError(f"Invalid numeric value '{row[col]}' in '{csv_filename}' (column '{col}', row {r_idx + 1}).")

        parsed_tables[table_name] = rows
        row_counts[table_name] = len(rows)

    # 3. Referential integrity checks
    cat_ids = {r["category_id"] for r in parsed_tables["product_categories"] if "category_id" in r}
    prod_ids = {r["product_id"] for r in parsed_tables["products"] if "product_id" in r}
    seg_ids = {r["segment_id"] for r in parsed_tables["customer_segments"] if "segment_id" in r}
    cust_ids = {r["customer_id"] for r in parsed_tables["customers"] if "customer_id" in r}
    cmp_ids = {r["campaign_id"] for r in parsed_tables["campaigns"] if "campaign_id" in r}
    soc_acc_ids = {r["account_id"] for r in parsed_tables["social_accounts"] if "account_id" in r}
    soc_post_ids = {r["post_id"] for r in parsed_tables["social_posts"] if "post_id" in r}
    order_ids = {r["order_id"] for r in parsed_tables["orders"] if "order_id" in r}

    # Products -> Categories
    for p in parsed_tables["products"]:
        if p.get("category_id") and p["category_id"] not in cat_ids:
            raise ValueError(f"Foreign key mismatch in products.csv: category_id '{p['category_id']}' does not exist in product_categories.csv.")

    # Customers -> Segments
    for c in parsed_tables["customers"]:
        if c.get("segment_id") and c["segment_id"] not in seg_ids:
            raise ValueError(f"Foreign key mismatch in customers.csv: segment_id '{c['segment_id']}' does not exist in customer_segments.csv.")

    # Social Posts -> Accounts & Campaigns
    for sp in parsed_tables["social_posts"]:
        if sp.get("account_id") and sp["account_id"] not in soc_acc_ids:
            raise ValueError(f"Foreign key mismatch in social_posts.csv: account_id '{sp['account_id']}' does not exist in social_accounts.csv.")
        if sp.get("campaign_id") and sp["campaign_id"] not in cmp_ids:
            raise ValueError(f"Foreign key mismatch in social_posts.csv: campaign_id '{sp['campaign_id']}' does not exist in campaigns.csv.")

    # Marketing Spend & Metrics -> Campaigns
    for s in parsed_tables["marketing_spend"]:
        if s.get("campaign_id") and s["campaign_id"] not in cmp_ids:
            raise ValueError(f"Foreign key mismatch in marketing_spend.csv: campaign_id '{s['campaign_id']}' does not exist in campaigns.csv.")

    for m in parsed_tables["marketing_metrics"]:
        if m.get("campaign_id") and m["campaign_id"] not in cmp_ids:
            raise ValueError(f"Foreign key mismatch in marketing_metrics.csv: campaign_id '{m['campaign_id']}' does not exist in campaigns.csv.")

    # Orders -> Customers
    for o in parsed_tables["orders"]:
        if o.get("customer_id") and o["customer_id"] not in cust_ids:
            raise ValueError(f"Foreign key mismatch in orders.csv: customer_id '{o['customer_id']}' does not exist in customers.csv.")

    # Order Items -> Orders & Products
    for oi in parsed_tables["order_items"]:
        if oi.get("order_id") and oi["order_id"] not in order_ids:
            raise ValueError(f"Foreign key mismatch in order_items.csv: order_id '{oi['order_id']}' does not exist in orders.csv.")
        if oi.get("product_id") and oi["product_id"] not in prod_ids:
            raise ValueError(f"Foreign key mismatch in order_items.csv: product_id '{oi['product_id']}' does not exist in products.csv.")

    return {
        "status": "valid",
        "row_counts": row_counts,
        "total_records": sum(row_counts.values())
    }

def ingest_csv_data(source_dir: str = None, project_id: str = None, project_name: str = None) -> dict:
    """
    Safely seeds SQLite database from source_dir.
    Validates all files first. If valid, performs an atomic database refresh in a single transaction.
    """
    init_db()

    target_dir = source_dir if source_dir and os.path.exists(source_dir) else DATA_RAW_DIR
    
    # 1. Validate dataset completely before modifying database
    val_result = validate_dataset(target_dir)

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Disable FK checking during batch loading within transaction
        cursor.execute("PRAGMA foreign_keys = OFF;")
        cursor.execute("BEGIN TRANSACTION;")

        total_records = 0
        details = []

        for table_name, csv_filename in TABLE_FILE_MAP:
            csv_path = os.path.join(target_dir, csv_filename)
            with open(csv_path, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                rows = list(reader)

            columns = list(rows[0].keys())
            placeholders = ", ".join(["?"] * len(columns))
            col_names = ", ".join(columns)

            cursor.execute(f"DELETE FROM {table_name};")
            insert_sql = f"INSERT INTO {table_name} ({col_names}) VALUES ({placeholders})"
            data_tuples = [tuple(row[col] for col in columns) for row in rows]

            cursor.executemany(insert_sql, data_tuples)
            total_records += len(rows)
            details.append(f"[OK] {table_name}: {len(rows)} records ingested.")

        # Re-enable FK and check
        cursor.execute("PRAGMA foreign_keys = ON;")
        fk_errors = cursor.execute("PRAGMA foreign_key_check;").fetchall()
        if fk_errors:
            cursor.execute("ROLLBACK;")
            conn.close()
            raise ValueError(f"SQLite Foreign Key Integrity Check failed with {len(fk_errors)} violation(s).")

        cursor.execute("COMMIT;")
        conn.close()

        # Update active dataset record
        is_baseline = (os.path.abspath(target_dir) == os.path.abspath(DATA_RAW_DIR) or not project_id or project_id == "PRJ-00")
        brand_name = "NEXORA" if is_baseline else (project_name or "Custom Brand")
        
        active_info = {
            "active_dataset_type": "baseline" if is_baseline else "custom",
            "active_project_id": "PRJ-00" if is_baseline else project_id,
            "active_brand_name": brand_name,
            "active_project_name": "NEXORA Baseline Demo Dataset" if is_baseline else (project_name or f"Project {project_id} Dataset"),
            "source_dir": target_dir,
            "total_records": total_records,
            "activated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        set_active_dataset_info(active_info)

        return {
            "status": "success",
            "total_records": total_records,
            "active_dataset": active_info,
            "details": details
        }

    except Exception as e:
        try:
            cursor.execute("ROLLBACK;")
        except Exception:
            pass
        conn.close()
        raise e

if __name__ == "__main__":
    init_db()
    res = ingest_csv_data()
    print("Ingestion Result:", res)
