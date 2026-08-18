import os
import sqlite3
import csv
import glob

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "database.sqlite")
DATA_RAW_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "raw")

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
    print("[DB] SQLite Schema Initialized.")

def ingest_csv_data():
    """Reads raw CSV datasets and seeds the SQLite database with validation."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Enable FK constraint check
    cursor.execute("PRAGMA foreign_keys = OFF;")

    table_file_map = [
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

    total_records = 0
    validation_reports = []

    for table_name, csv_filename in table_file_map:
        csv_path = os.path.join(DATA_RAW_DIR, csv_filename)
        if not os.path.exists(csv_path):
            validation_reports.append(f"MISSING FILE: {csv_filename}")
            continue

        with open(csv_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            rows = list(reader)

        if not rows:
            validation_reports.append(f"EMPTY FILE: {csv_filename}")
            continue

        columns = list(rows[0].keys())
        placeholders = ", ".join(["?"] * len(columns))
        col_names = ", ".join(columns)

        cursor.execute(f"DELETE FROM {table_name};")
        
        insert_sql = f"INSERT INTO {table_name} ({col_names}) VALUES ({placeholders})"
        data_tuples = [tuple(row[col] for col in columns) for row in rows]

        cursor.executemany(insert_sql, data_tuples)
        total_records += len(rows)
        validation_reports.append(f"[OK] {table_name}: {len(rows)} records ingested.")

    cursor.execute("PRAGMA foreign_keys = ON;")
    conn.commit()
    conn.close()

    return {
        "status": "success",
        "total_records": total_records,
        "details": validation_reports
    }

if __name__ == "__main__":
    init_db()
    res = ingest_csv_data()
    print("Ingestion Result:", res)
