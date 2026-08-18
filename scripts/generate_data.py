import os
import csv
import random
import math
from datetime import datetime, timedelta

# Create data/raw directory
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "raw")
os.makedirs(DATA_DIR, exist_ok=True)

# Set seed for reproducible realistic mock data
random.seed(42)

# Start date and end date for historical data (1 year: 2025-01-01 to 2025-12-31)
START_DATE = datetime(2025, 1, 1)
END_DATE = datetime(2025, 12, 31)
TOTAL_DAYS = (END_DATE - START_DATE).days + 1

def format_date(dt):
    return dt.strftime("%Y-%m-%d")

def format_datetime(dt):
    return dt.strftime("%Y-%m-%d %H:%M:%S")

print("Generating 15 Interconnected Datasets for AuraLiving...")

# ---------------------------------------------------------
# 1. Product Categories (4 categories)
# ---------------------------------------------------------
categories = [
    {"category_id": "CAT-1", "category_name": "Ergonomic Furniture", "description": "Standing desks, ergonomic chairs, and posture balance seating"},
    {"category_id": "CAT-2", "category_name": "Ambient Lighting", "description": "Smart LED desk lamps, sunset lamps, and warm mood lighting"},
    {"category_id": "CAT-3", "category_name": "Acoustic & Organization", "description": "Desk organizers, acoustic wall panels, and cable management"},
    {"category_id": "CAT-4", "category_name": "Wellness & Aromatherapy", "description": "Ultrasonic diffusers, essential oil blends, and hydration bottles"}
]

with open(os.path.join(DATA_DIR, "product_categories.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["category_id", "category_name", "description"])
    writer.writeheader()
    writer.writerows(categories)

# ---------------------------------------------------------
# 2. Products & Reviews (12 products across categories)
# ---------------------------------------------------------
products = [
    {"product_id": "PRD-101", "category_id": "CAT-1", "product_name": "AuraDesk Pro Standing Desk", "sku": "AL-DESK-PRO", "price": 599.00, "cost_price": 240.00, "avg_rating": 4.8, "review_count": 142, "sample_review": "Incredible stability and slick wooden finish. Changed my work-from-home routine completely!", "review_sentiment": "Positive"},
    {"product_id": "PRD-102", "category_id": "CAT-1", "product_name": "ErgoFlow Mesh Chair", "sku": "AL-CHAIR-MESH", "price": 349.00, "cost_price": 125.00, "avg_rating": 4.6, "review_count": 98, "sample_review": "Great lumbar support, though the armrests could use slightly softer padding.", "review_sentiment": "Positive"},
    {"product_id": "PRD-103", "category_id": "CAT-1", "product_name": "Balance Active Stool", "sku": "AL-STOOL-ACT", "price": 149.00, "cost_price": 50.00, "avg_rating": 3.9, "review_count": 45, "sample_review": "Good core engagement but gets uncomfortable after 2 hours of continuous sitting.", "review_sentiment": "Mixed"},
    
    {"product_id": "PRD-201", "category_id": "CAT-2", "product_name": "Lumina Glow Smart Desk Lamp", "sku": "AL-LAMP-GLOW", "price": 89.00, "cost_price": 28.00, "avg_rating": 4.9, "review_count": 210, "sample_review": "The natural daylight mode reduces eye strain significantly during late night coding sessions.", "review_sentiment": "Positive"},
    {"product_id": "PRD-202", "category_id": "CAT-2", "product_name": "Horizon Sunset Mood Bar", "sku": "AL-LAMP-SUNSET", "price": 69.00, "cost_price": 20.00, "avg_rating": 4.7, "review_count": 175, "sample_review": "Vibrant colors! Created an aesthetic background for all my video calls and social posts.", "review_sentiment": "Positive"},
    {"product_id": "PRD-203", "category_id": "CAT-2", "product_name": "Eclipse Ambient Monitor Lightbar", "sku": "AL-BAR-ECLIPSE", "price": 79.00, "cost_price": 24.00, "avg_rating": 4.5, "review_count": 88, "sample_review": "Zero screen glare and simple touch controls. Fits my curved monitor perfectly.", "review_sentiment": "Positive"},

    {"product_id": "PRD-301", "category_id": "CAT-3", "product_name": "Modular Walnut Desk Shelf", "sku": "AL-SHELF-WALNUT", "price": 129.00, "cost_price": 38.00, "avg_rating": 4.7, "review_count": 130, "sample_review": "Premium real wood grain. Keeps my dual monitor setup clean and elevated.", "review_sentiment": "Positive"},
    {"product_id": "PRD-302", "category_id": "CAT-3", "product_name": "Acoustic Felt Wall Tile Pack", "sku": "AL-TILE-FELT", "price": 59.00, "cost_price": 15.00, "avg_rating": 4.2, "review_count": 64, "sample_review": "Dampens echo well in small home offices. Easy adhesive installation.", "review_sentiment": "Positive"},
    {"product_id": "PRD-303", "category_id": "CAT-3", "product_name": "Magnetic Cable Management System", "sku": "AL-CABLE-MAG", "price": 29.00, "cost_price": 6.00, "avg_rating": 3.7, "review_count": 52, "sample_review": "Magnets are a bit weak for thick braided cords, but works okay for phone chargers.", "review_sentiment": "Mixed"},

    {"product_id": "PRD-401", "category_id": "CAT-4", "product_name": "ZenMist Ceramic Diffuser", "sku": "AL-DIFF-ZEN", "price": 79.00, "cost_price": 22.00, "avg_rating": 4.9, "review_count": 320, "sample_review": "Whisper quiet operation and beautiful aesthetic ceramic cover. Smells amazing with lavender.", "review_sentiment": "Positive"},
    {"product_id": "PRD-402", "category_id": "CAT-4", "product_name": "Organic Essential Oils Trio", "sku": "AL-OIL-TRIO", "price": 35.00, "cost_price": 8.00, "avg_rating": 4.8, "review_count": 280, "sample_review": "Pure scents without synthetic perfume smell. Focus blend is a staple for morning work.", "review_sentiment": "Positive"},
    {"product_id": "PRD-403", "category_id": "CAT-4", "product_name": "Smart Hydration Tumbler", "sku": "AL-BOTTLE-HYD", "price": 49.00, "cost_price": 14.00, "avg_rating": 3.6, "review_count": 76, "sample_review": "Battery life on LED timer lid is short and app pairing is glitchy.", "review_sentiment": "Negative"}
]

for p in products:
    p["margin_percent"] = round(((p["price"] - p["cost_price"]) / p["price"]) * 100, 2)

with open(os.path.join(DATA_DIR, "products.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["product_id", "category_id", "product_name", "sku", "price", "cost_price", "margin_percent", "avg_rating", "review_count", "sample_review", "review_sentiment"])
    writer.writeheader()
    writer.writerows(products)

# ---------------------------------------------------------
# 3. Customer Segments (5 analytical groupings)
# ---------------------------------------------------------
segments = [
    {"segment_id": "SEG-1", "segment_name": "Remote Professionals", "age_band": "28-42", "gender_focus": "Balanced", "region": "North America / EU", "purchasing_behavior": "High AOV, values ergonomics & desk setup productivity"},
    {"segment_id": "SEG-2", "segment_name": "Gen Z Content Creators", "age_band": "18-24", "gender_focus": "Female Leaning", "region": "Urban Global", "purchasing_behavior": "High Social response, aesthetic lighting & trendy decor"},
    {"segment_id": "SEG-3", "segment_name": "Wellness & Mindful Living", "age_band": "25-45", "gender_focus": "Female Leaning", "region": "Suburban", "purchasing_behavior": "High repeat purchases in aromatherapy & desk wellness"},
    {"segment_id": "SEG-4", "segment_name": "Tech Enthusiasts & Gamers", "age_band": "20-35", "gender_focus": "Male Leaning", "region": "North America / Asia", "purchasing_behavior": "High spend on premium desk accessories & monitor bars"},
    {"segment_id": "SEG-5", "segment_name": "Bargain Seekers", "age_band": "22-50", "gender_focus": "Balanced", "region": "Global", "purchasing_behavior": "Price sensitive, purchases during promotional discounts & sales"}
]

with open(os.path.join(DATA_DIR, "customer_segments.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["segment_id", "segment_name", "age_band", "gender_focus", "region", "purchasing_behavior"])
    writer.writeheader()
    writer.writerows(segments)

# ---------------------------------------------------------
# 4. Customers (1,200 realistic customers)
# ---------------------------------------------------------
first_names = ["Alex", "Jordan", "Taylor", "Morgan", "Sam", "Chris", "Pat", "Riley", "Casey", "Dakota", "Avery", "Reese", "Quinn", "Skyler", "Cameron", "Jamie", "Peyton", "Kendall", "Hayden", "Logan", "Maya", "Liam", "Noah", "Emma", "Olivia", "Ava", "Sophia", "Isabella", "Lucas", "Ethan"]
last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris"]
cities = ["New York, NY", "Los Angeles, CA", "Chicago, IL", "Austin, TX", "Seattle, WA", "San Francisco, CA", "Toronto, ON", "London, UK", "Miami, FL", "Denver, CO", "Boston, MA", "Portland, OR"]

customers = []
for i in range(1, 1201):
    c_id = f"CUST-{i:04d}"
    fn = random.choice(first_names)
    ln = random.choice(last_names)
    name = f"{fn} {ln}"
    email = f"{fn.lower()}.{ln.lower()}{i}@example.com"
    seg = random.choices(segments, weights=[0.30, 0.25, 0.20, 0.15, 0.10])[0]
    
    # Assign age based on segment
    if seg["segment_id"] == "SEG-1":
        age = random.randint(28, 42)
        gender = random.choice(["Male", "Female", "Non-binary"])
    elif seg["segment_id"] == "SEG-2":
        age = random.randint(18, 24)
        gender = random.choice(["Female", "Female", "Male", "Non-binary"])
    elif seg["segment_id"] == "SEG-3":
        age = random.randint(25, 45)
        gender = random.choice(["Female", "Female", "Female", "Male"])
    elif seg["segment_id"] == "SEG-4":
        age = random.randint(20, 35)
        gender = random.choice(["Male", "Male", "Female"])
    else:
        age = random.randint(22, 55)
        gender = random.choice(["Male", "Female"])
        
    location = random.choice(cities)
    created_dt = START_DATE + timedelta(days=random.randint(0, 350), hours=random.randint(0, 23))
    
    customers.append({
        "customer_id": c_id,
        "name": name,
        "email": email,
        "created_at": format_datetime(created_dt),
        "segment_id": seg["segment_id"],
        "age": age,
        "gender": gender,
        "location": location
    })

with open(os.path.join(DATA_DIR, "customers.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["customer_id", "name", "email", "created_at", "segment_id", "age", "gender", "location"])
    writer.writeheader()
    writer.writerows(customers)

# ---------------------------------------------------------
# 5. Campaigns (5 major historical campaigns with distinct characteristics)
# ---------------------------------------------------------
campaigns = [
    {
        "campaign_id": "CMP-2025-01",
        "campaign_name": "New Year WFH Productivity Boost",
        "objective": "Customer Acquisition & High ROAS",
        "start_date": "2025-01-10",
        "end_date": "2025-02-15",
        "budget": 35000.00,
        "target_audience": "Remote Professionals & Ergonomics Seekers",
        "geo_targeting": "United States & Canada",
        "demographic_targeting": "Age 28-45",
        "channels": "Meta Ads, Google Search, LinkedIn",
        "ad_formats": "Carousel, Video Showcase, Search Text Ads",
        "featured_product_id": "PRD-101",
        "campaign_message": "Transform your home desk setup for 2025 with ergonomic perfection",
        "offer_discount": "15% OFF Standing Desks with code WFH2025",
        "planned_roas": 4.0,
        "planned_conversions": 350
    },
    {
        "campaign_id": "CMP-2025-02",
        "campaign_name": "Spring Aesthetic Glow",
        "objective": "Brand Awareness & Social Engagement",
        "start_date": "2025-03-01",
        "end_date": "2025-04-15",
        "budget": 45000.00,
        "target_audience": "Gen Z Content Creators & Aesthetic Enthusiasts",
        "geo_targeting": "Global Urban Centers",
        "demographic_targeting": "Age 18-28",
        "channels": "TikTok, Instagram Reels, Influencer Sponsorships",
        "ad_formats": "Short-Form Video Reels, TikTok Spark Ads",
        "featured_product_id": "PRD-202",
        "campaign_message": "Light up your space and create viral ambient desk aesthetics",
        "offer_discount": "10% OFF Sunset & Lamp Collections",
        "planned_roas": 2.5,
        "planned_conversions": 500
    },
    {
        "campaign_id": "CMP-2025-03",
        "campaign_name": "Zen & Mindful Workspaces",
        "objective": "Customer Retention & Repeat Orders",
        "start_date": "2025-05-15",
        "end_date": "2025-06-30",
        "budget": 25000.00,
        "target_audience": "Wellness & Mindful Living Segment",
        "geo_targeting": "North America & UK",
        "demographic_targeting": "Age 25-45, Female Leaning",
        "channels": "Instagram, Email Marketing, Pinterest",
        "ad_formats": "Static Moodboards, Story Ads, Email Workflows",
        "featured_product_id": "PRD-401",
        "campaign_message": "Calm your mind while you work with ceramic diffusers & pure essential oils",
        "offer_discount": "Free Oil Trio with Diffuser Purchase",
        "planned_roas": 3.8,
        "planned_conversions": 400
    },
    {
        "campaign_id": "CMP-2025-04",
        "campaign_name": "Diwali & Festive Glow Mega Sale",
        "objective": "Maximum Revenue Scale & High ROAS",
        "start_date": "2025-10-01",
        "end_date": "2025-11-15",
        "budget": 60000.00,
        "target_audience": "All Segments & Festive Gifting Buyers",
        "geo_targeting": "Global Tier 1 Cities",
        "demographic_targeting": "Age 20-50",
        "channels": "Meta Ads, Google Shopping, YouTube Video Ads, TikTok",
        "ad_formats": "Video Ads, Shopping Catalog Ads, Retargeting Banners",
        "featured_product_id": "PRD-201",
        "campaign_message": "Illuminate your desk and gift your loved ones premium workspace luxury",
        "offer_discount": "20% OFF Site-Wide Festive Discount",
        "planned_roas": 4.5,
        "planned_conversions": 900
    },
    {
        "campaign_id": "CMP-2025-05",
        "campaign_name": "Winter Cyber Sale & Retargeting Push",
        "objective": "Conversion Efficiency & Low CPA",
        "start_date": "2025-11-20",
        "end_date": "2025-12-25",
        "budget": 30000.00,
        "target_audience": "High-intent Visitors & Cart Abandoners",
        "geo_targeting": "North America",
        "demographic_targeting": "Age 22-45",
        "channels": "Meta Retargeting, Google Remarketing, SMS",
        "ad_formats": "Dynamic Product Ads, Urgency Countdown Banners",
        "featured_product_id": "PRD-301",
        "campaign_message": "Final chance of the year! Upgrade your setup before sale ends",
        "offer_discount": "25% OFF Select Bundles",
        "planned_roas": 5.0,
        "planned_conversions": 600
    }
]

with open(os.path.join(DATA_DIR, "campaigns.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["campaign_id", "campaign_name", "objective", "start_date", "end_date", "budget", "target_audience", "geo_targeting", "demographic_targeting", "channels", "ad_formats", "featured_product_id", "campaign_message", "offer_discount", "planned_roas", "planned_conversions"])
    writer.writeheader()
    writer.writerows(campaigns)

# ---------------------------------------------------------
# 6. Social Accounts (4 main channels)
# ---------------------------------------------------------
social_accounts = [
    {"account_id": "SOC-101", "platform": "Instagram", "handle": "@auraliving.co", "followers": 145000, "growth_rate": "+3.4%/mo"},
    {"account_id": "SOC-102", "platform": "TikTok", "handle": "@auraliving_official", "followers": 280000, "growth_rate": "+7.1%/mo"},
    {"account_id": "SOC-103", "platform": "YouTube", "handle": "AuraLiving Design Studio", "followers": 62000, "growth_rate": "+1.9%/mo"},
    {"account_id": "SOC-104", "platform": "Meta Ads Page", "handle": "AuraLiving Official", "followers": 95000, "growth_rate": "+2.1%/mo"}
]

with open(os.path.join(DATA_DIR, "social_accounts.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["account_id", "platform", "handle", "followers", "growth_rate"])
    writer.writeheader()
    writer.writerows(social_accounts)

# ---------------------------------------------------------
# 7. Social Posts & Social Post Metrics (40 posts across campaigns)
# ---------------------------------------------------------
post_themes = ["Desk Tour Aesthetic", "Ergonomic Posture Tips", "Lighting Unboxing & Sunset Vibe", "Zen Mood Aromatherapy", "Productivity ASMR", "Cyber Sale Flash Promo"]
post_formats = ["Reels / Short Video", "Carousel", "Static Photo", "Long Video Unboxing"]

social_posts = []
social_post_metrics = []

post_counter = 1
for cmp in campaigns:
    cmp_id = cmp["campaign_id"]
    c_start = datetime.strptime(cmp["start_date"], "%Y-%m-%d")
    c_end = datetime.strptime(cmp["end_date"], "%Y-%m-%d")
    days_span = (c_end - c_start).days
    
    # Generate 8 posts per campaign
    for p in range(8):
        post_id = f"POST-{post_counter:03d}"
        post_counter += 1
        account = random.choice(social_accounts)
        acc_id = account["account_id"]
        fmt = random.choice(post_formats)
        theme = random.choice(post_themes)
        pub_dt = c_start + timedelta(days=random.randint(0, max(1, days_span-1)), hours=random.randint(9, 20))
        caption = f"{cmp['campaign_message']} ✨ Check out our {cmp['featured_product_id']}! #homeoffice #desksetup #{account['platform'].lower()}"
        post_url = f"https://{account['platform'].lower()}.com/auraliving/p/{post_id.lower()}"
        
        social_posts.append({
            "post_id": post_id,
            "account_id": acc_id,
            "campaign_id": cmp_id,
            "content_theme": theme,
            "format": fmt,
            "published_at": format_datetime(pub_dt),
            "caption": caption,
            "post_url": post_url
        })
        
        # Calculate realistic post metrics
        if fmt == "Reels / Short Video":
            impressions = random.randint(18000, 85000)
            reach = int(impressions * random.uniform(0.75, 0.90))
            likes = int(impressions * random.uniform(0.04, 0.08))
            comments = int(likes * random.uniform(0.05, 0.12))
            shares = int(likes * random.uniform(0.08, 0.20))
            saves = int(likes * random.uniform(0.10, 0.25))
            video_views = int(impressions * random.uniform(0.80, 0.95))
            watch_time_sec = video_views * random.randint(8, 22)
            link_clicks = int(impressions * random.uniform(0.015, 0.035))
        elif fmt == "Carousel":
            impressions = random.randint(12000, 45000)
            reach = int(impressions * random.uniform(0.70, 0.85))
            likes = int(impressions * random.uniform(0.03, 0.06))
            comments = int(likes * random.uniform(0.04, 0.10))
            shares = int(likes * random.uniform(0.05, 0.12))
            saves = int(likes * random.uniform(0.20, 0.40))
            video_views = 0
            watch_time_sec = 0
            link_clicks = int(impressions * random.uniform(0.025, 0.050))
        else: # Static
            impressions = random.randint(8000, 30000)
            reach = int(impressions * random.uniform(0.65, 0.80))
            likes = int(impressions * random.uniform(0.02, 0.05))
            comments = int(likes * random.uniform(0.03, 0.08))
            shares = int(likes * random.uniform(0.02, 0.06))
            saves = int(likes * random.uniform(0.05, 0.15))
            video_views = 0
            watch_time_sec = 0
            link_clicks = int(impressions * random.uniform(0.01, 0.025))

        social_post_metrics.append({
            "post_id": post_id,
            "date": format_date(pub_dt),
            "impressions": impressions,
            "reach": reach,
            "likes": likes,
            "comments": comments,
            "shares": shares,
            "saves": saves,
            "video_views": video_views,
            "watch_time_sec": watch_time_sec,
            "link_clicks": link_clicks
        })

with open(os.path.join(DATA_DIR, "social_posts.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["post_id", "account_id", "campaign_id", "content_theme", "format", "published_at", "caption", "post_url"])
    writer.writeheader()
    writer.writerows(social_posts)

with open(os.path.join(DATA_DIR, "social_post_metrics.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["post_id", "date", "impressions", "reach", "likes", "comments", "shares", "saves", "video_views", "watch_time_sec", "link_clicks"])
    writer.writeheader()
    writer.writerows(social_post_metrics)

# ---------------------------------------------------------
# 8 & 9. Marketing Spend & Marketing Metrics
# ---------------------------------------------------------
marketing_spend = []
marketing_metrics = []

spend_id_counter = 1
metric_id_counter = 1

campaign_perf_config = {
    "CMP-2025-01": {"actual_spend": 34800, "actual_roas": 3.25, "channels": ["Meta Ads", "Google Search", "LinkedIn"]},
    "CMP-2025-02": {"actual_spend": 44500, "actual_roas": 1.82, "channels": ["TikTok", "Instagram Reels", "Influencer"]},
    "CMP-2025-03": {"actual_spend": 24600, "actual_roas": 4.15, "channels": ["Instagram", "Email Marketing", "Pinterest"]},
    "CMP-2025-04": {"actual_spend": 59200, "actual_roas": 5.24, "channels": ["Meta Ads", "Google Shopping", "YouTube Video Ads"]},
    "CMP-2025-05": {"actual_spend": 29400, "actual_roas": 5.85, "channels": ["Meta Retargeting", "Google Remarketing", "SMS"]}
}

for cmp in campaigns:
    cmp_id = cmp["campaign_id"]
    cfg = campaign_perf_config[cmp_id]
    c_start = datetime.strptime(cmp["start_date"], "%Y-%m-%d")
    c_end = datetime.strptime(cmp["end_date"], "%Y-%m-%d")
    days_count = (c_end - c_start).days + 1
    
    daily_target_spend = cfg["actual_spend"] / days_count
    target_total_rev = cfg["actual_spend"] * cfg["actual_roas"]
    daily_target_rev = target_total_rev / days_count
    
    for d in range(days_count):
        curr_dt = c_start + timedelta(days=d)
        dt_str = format_date(curr_dt)
        
        day_factor = random.uniform(0.85, 1.15)
        d_spend = round(daily_target_spend * day_factor, 2)
        d_rev = round(daily_target_rev * day_factor * random.uniform(0.95, 1.05), 2)
        
        chans = cfg["channels"]
        chan_spends = []
        rem_spend = d_spend
        for ch_idx, ch in enumerate(chans):
            if ch_idx == len(chans) - 1:
                ch_spend = round(rem_spend, 2)
            else:
                ch_spend = round(d_spend * (1 / len(chans)) * random.uniform(0.8, 1.2), 2)
                rem_spend -= ch_spend
            
            cpm = round(random.uniform(8.50, 18.20), 2)
            cpc = round(random.uniform(0.80, 2.60), 2)
            
            marketing_spend.append({
                "spend_id": f"SPD-{spend_id_counter:05d}",
                "campaign_id": cmp_id,
                "date": dt_str,
                "channel": ch,
                "spend": ch_spend,
                "cpc": cpc,
                "cpm": cpm
            })
            spend_id_counter += 1
            
        impressions = int((d_spend / random.uniform(10.0, 15.0)) * 1000)
        reach = int(impressions * random.uniform(0.70, 0.88))
        frequency = round(impressions / max(1, reach), 2)
        
        if cmp_id == "CMP-2025-02":
            ctr = round(random.uniform(3.2, 4.8), 2)
            conv_rate = round(random.uniform(0.8, 1.4), 2)
        elif cmp_id == "CMP-2025-05":
            ctr = round(random.uniform(2.1, 3.2), 2)
            conv_rate = round(random.uniform(3.8, 5.5), 2)
        else:
            ctr = round(random.uniform(2.4, 3.8), 2)
            conv_rate = round(random.uniform(2.2, 3.6), 2)
            
        clicks = int(impressions * (ctr / 100))
        conversions = int(clicks * (conv_rate / 100))
        
        marketing_metrics.append({
            "metric_id": f"MET-{metric_id_counter:05d}",
            "campaign_id": cmp_id,
            "date": dt_str,
            "impressions": impressions,
            "reach": reach,
            "frequency": frequency,
            "clicks": clicks,
            "ctr": ctr,
            "conversions": conversions,
            "conversion_rate": conv_rate,
            "attributed_revenue": d_rev
        })
        metric_id_counter += 1

with open(os.path.join(DATA_DIR, "marketing_spend.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["spend_id", "campaign_id", "date", "channel", "spend", "cpc", "cpm"])
    writer.writeheader()
    writer.writerows(marketing_spend)

with open(os.path.join(DATA_DIR, "marketing_metrics.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["metric_id", "campaign_id", "date", "impressions", "reach", "frequency", "clicks", "ctr", "conversions", "conversion_rate", "attributed_revenue"])
    writer.writeheader()
    writer.writerows(marketing_metrics)

# ---------------------------------------------------------
# 10, 11, 12, 13, 14. Orders, Order Items, Customer Acquisition, Attribution, Daily KPIs
# ---------------------------------------------------------
orders = []
order_items = []
customer_acquisitions = []
attributions = []

order_counter = 1
item_counter = 1
acq_counter = 1
attr_counter = 1

cmp_date_ranges = []
for cmp in campaigns:
    cmp_date_ranges.append({
        "campaign_id": cmp["campaign_id"],
        "start": datetime.strptime(cmp["start_date"], "%Y-%m-%d"),
        "end": datetime.strptime(cmp["end_date"], "%Y-%m-%d"),
        "channels": campaign_perf_config[cmp["campaign_id"]]["channels"]
    })

customer_order_counts = {}
orders_by_date = {format_date(START_DATE + timedelta(days=d)): [] for d in range(TOTAL_DAYS)}

for i in range(1, 2801):
    o_id = f"ORD-{i:05d}"
    cust = random.choice(customers)
    c_id = cust["customer_id"]

    if random.random() < 0.70:
        active_cmp = random.choice(cmp_date_ranges)
        days_in_cmp = (active_cmp["end"] - active_cmp["start"]).days
        o_date_dt = active_cmp["start"] + timedelta(days=random.randint(0, max(0, days_in_cmp)), hours=random.randint(8, 22))
        associated_cmp_id = active_cmp["campaign_id"]
        channel = random.choice(active_cmp["channels"])
    else:
        o_date_dt = START_DATE + timedelta(days=random.randint(0, TOTAL_DAYS-1), hours=random.randint(8, 22))
        associated_cmp_id = "CMP-ORGANIC"
        channel = random.choice(["Organic Search", "Direct Traffic", "Social Organic", "Email Newsletter"])
        
    o_date_str = format_date(o_date_dt)
    
    if c_id not in customer_order_counts:
        customer_order_counts[c_id] = 1
        acq_id = f"ACQ-{acq_counter:04d}"
        acq_counter += 1
        cpa_cost = round(random.uniform(18.50, 42.00), 2)
        customer_acquisitions.append({
            "acquisition_id": acq_id,
            "customer_id": c_id,
            "campaign_id": associated_cmp_id if associated_cmp_id != "CMP-ORGANIC" else "CMP-2025-01",
            "channel": channel,
            "acquisition_date": o_date_str,
            "cpa": cpa_cost
        })
    else:
        customer_order_counts[c_id] += 1
        
    num_items = random.choices([1, 2, 3], weights=[0.65, 0.25, 0.10])[0]
    selected_products = random.sample(products, num_items)
    
    subtotal = 0.0
    items_for_order = []
    for p in selected_products:
        qty = random.choices([1, 2], weights=[0.85, 0.15])[0]
        item_total = p["price"] * qty
        subtotal += item_total
        
        items_for_order.append({
            "item_id": f"ITM-{item_counter:06d}",
            "order_id": o_id,
            "product_id": p["product_id"],
            "quantity": qty,
            "unit_price": p["price"],
            "total_price": item_total
        })
        item_counter += 1
        
    discount = round(subtotal * random.choice([0.0, 0.10, 0.15, 0.20]), 2) if associated_cmp_id != "CMP-ORGANIC" else 0.0
    tax = round((subtotal - discount) * 0.08, 2)
    shipping = 0.0 if subtotal > 100 else 12.00
    total_rev = round(subtotal - discount + tax + shipping, 2)
    
    order_rec = {
        "order_id": o_id,
        "customer_id": c_id,
        "order_date": format_datetime(o_date_dt),
        "subtotal": subtotal,
        "discount_amount": discount,
        "tax": tax,
        "shipping": shipping,
        "total_revenue": total_rev,
        "order_status": "Completed"
    }
    orders.append(order_rec)
    order_items.extend(items_for_order)
    orders_by_date[o_date_str].append(order_rec)
    
    attributions.append({
        "attribution_id": f"ATTR-{attr_counter:05d}",
        "order_id": o_id,
        "campaign_id": associated_cmp_id,
        "touchpoint_channel": channel,
        "touchpoint_type": "Last Click" if associated_cmp_id != "CMP-ORGANIC" else "Direct",
        "attributed_revenue": total_rev,
        "attribution_weight": 1.0 if associated_cmp_id != "CMP-ORGANIC" else 0.8,
        "confidence_score": 0.95 if associated_cmp_id != "CMP-ORGANIC" else 0.85
    })
    attr_counter += 1

with open(os.path.join(DATA_DIR, "orders.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["order_id", "customer_id", "order_date", "subtotal", "discount_amount", "tax", "shipping", "total_revenue", "order_status"])
    writer.writeheader()
    writer.writerows(orders)

with open(os.path.join(DATA_DIR, "order_items.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["item_id", "order_id", "product_id", "quantity", "unit_price", "total_price"])
    writer.writeheader()
    writer.writerows(order_items)

with open(os.path.join(DATA_DIR, "customer_acquisition.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["acquisition_id", "customer_id", "campaign_id", "channel", "acquisition_date", "cpa"])
    writer.writeheader()
    writer.writerows(customer_acquisitions)

with open(os.path.join(DATA_DIR, "attribution.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["attribution_id", "order_id", "campaign_id", "touchpoint_channel", "touchpoint_type", "attributed_revenue", "attribution_weight", "confidence_score"])
    writer.writeheader()
    writer.writerows(attributions)

# ---------------------------------------------------------
# 15. Daily KPIs
# ---------------------------------------------------------
daily_spend_map = {}
for sp in marketing_spend:
    dt = sp["date"]
    daily_spend_map[dt] = daily_spend_map.get(dt, 0.0) + sp["spend"]

daily_imp_map = {}
for mm in marketing_metrics:
    dt = mm["date"]
    daily_imp_map[dt] = daily_imp_map.get(dt, 0) + mm["impressions"]

daily_kpis = []
for d_idx in range(TOTAL_DAYS):
    dt_curr = START_DATE + timedelta(days=d_idx)
    dt_str = format_date(dt_curr)
    
    day_orders = orders_by_date.get(dt_str, [])
    tot_rev = sum(o["total_revenue"] for o in day_orders)
    tot_orders = len(day_orders)
    
    new_custs = sum(1 for o in day_orders if o["customer_id"] in [ac["customer_id"] for ac in customer_acquisitions if ac["acquisition_date"] == dt_str])
    ret_custs = max(0, tot_orders - new_custs)
    
    m_spend = round(daily_spend_map.get(dt_str, 0.0), 2)
    m_imps = daily_imp_map.get(dt_str, 0)
    
    web_visits = int((m_imps * 0.032) + random.randint(300, 800))
    prod_views = int(web_visits * random.uniform(0.55, 0.70))
    add_carts = int(prod_views * random.uniform(0.15, 0.28))
    
    overall_roas = round(tot_rev / m_spend, 2) if m_spend > 0 else 0.0
    aov = round(tot_rev / tot_orders, 2) if tot_orders > 0 else 0.0
    
    daily_kpis.append({
        "date": dt_str,
        "total_revenue": round(tot_rev, 2),
        "total_orders": tot_orders,
        "new_customers": new_custs,
        "returning_customers": ret_custs,
        "total_marketing_spend": m_spend,
        "total_impressions": m_imps,
        "total_website_visits": web_visits,
        "total_product_views": prod_views,
        "total_add_to_carts": add_carts,
        "overall_roas": overall_roas,
        "aov": aov
    })

with open(os.path.join(DATA_DIR, "daily_kpis.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["date", "total_revenue", "total_orders", "new_customers", "returning_customers", "total_marketing_spend", "total_impressions", "total_website_visits", "total_product_views", "total_add_to_carts", "overall_roas", "aov"])
    writer.writeheader()
    writer.writerows(daily_kpis)

print("[OK] Successfully generated all 15 interconnected CSV datasets in data/raw/")
