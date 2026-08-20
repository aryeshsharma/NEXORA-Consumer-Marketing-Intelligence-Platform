import sqlite3
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from db import get_db_connection

def get_executive_overview():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Total Revenue, Total Spend, Total Orders
    kpi_summary = cursor.execute("""
    SELECT 
        SUM(total_revenue) as total_revenue,
        SUM(total_orders) as total_orders,
        SUM(new_customers) as new_customers,
        SUM(returning_customers) as returning_customers,
        SUM(total_marketing_spend) as total_spend,
        SUM(total_impressions) as total_impressions,
        SUM(total_website_visits) as total_visits
    FROM daily_kpis
    """).fetchone()

    total_revenue = (kpi_summary['total_revenue'] if kpi_summary else 0.0) or 0.0
    total_spend = (kpi_summary['total_spend'] if kpi_summary else 0.0) or 0.0
    total_orders = (kpi_summary['total_orders'] if kpi_summary else 0) or 0
    new_custs = (kpi_summary['new_customers'] if kpi_summary else 0) or 0
    ret_custs = (kpi_summary['returning_customers'] if kpi_summary else 0) or 0
    overall_roas = round(total_revenue / total_spend, 2) if total_spend > 0 else 0.0
    aov = round(total_revenue / total_orders, 2) if total_orders > 0 else 0.0

    # Repeat Purchase Rate
    repeat_stats = cursor.execute("""
    SELECT 
        COUNT(DISTINCT customer_id) as total_unique_customers,
        COUNT(CASE WHEN order_count > 1 THEN 1 END) as repeat_customers
    FROM (
        SELECT customer_id, COUNT(order_id) as order_count
        FROM orders
        GROUP BY customer_id
    )
    """).fetchone()
    
    total_unique_cust = (repeat_stats['total_unique_customers'] if repeat_stats else 1) or 1
    repeat_cust_count = (repeat_stats['repeat_customers'] if repeat_stats else 0) or 0
    repeat_rate = round((repeat_cust_count / total_unique_cust) * 100, 1)

    # Top performing campaign by revenue
    top_campaign = cursor.execute("""
    SELECT c.campaign_name, SUM(m.attributed_revenue) as rev, SUM(s.spend) as spend
    FROM campaigns c
    JOIN marketing_metrics m ON c.campaign_id = m.campaign_id
    JOIN marketing_spend s ON c.campaign_id = s.campaign_id
    GROUP BY c.campaign_id
    ORDER BY rev DESC
    LIMIT 1
    """).fetchone()

    top_cmp_name = top_campaign['campaign_name'] if top_campaign else "N/A"

    # Monthly revenue & spend trend
    monthly_trends = cursor.execute("""
    SELECT 
        STRFTIME('%Y-%m', date) as month,
        SUM(total_revenue) as revenue,
        SUM(total_marketing_spend) as spend,
        SUM(total_orders) as orders
    FROM daily_kpis
    GROUP BY month
    ORDER BY month ASC
    """).fetchall()

    monthly_data = [
        {
            "month": row["month"],
            "revenue": round(row["revenue"], 2),
            "spend": round(row["spend"], 2),
            "orders": row["orders"],
            "roas": round(row["revenue"] / row["spend"], 2) if row["spend"] > 0 else 0.0
        }
        for row in monthly_trends
    ]

    conn.close()

    return {
        "summary": {
            "total_revenue": round(total_revenue, 2),
            "total_spend": round(total_spend, 2),
            "net_profit": round(total_revenue - total_spend, 2),
            "overall_roas": overall_roas,
            "total_orders": total_orders,
            "aov": aov,
            "new_customers": new_custs,
            "returning_customers": ret_custs,
            "repeat_purchase_rate": repeat_rate,
            "top_campaign": top_cmp_name
        },
        "monthly_trend": monthly_data
    }

def get_campaign_analytics():
    conn = get_db_connection()
    cursor = conn.cursor()

    campaigns = cursor.execute("SELECT * FROM campaigns ORDER BY start_date ASC").fetchall()
    results = []

    for c in campaigns:
        cmp_id = c["campaign_id"]

        # Aggregate marketing metrics & spend
        metrics = cursor.execute("""
        SELECT 
            SUM(impressions) as total_impressions,
            SUM(reach) as total_reach,
            SUM(clicks) as total_clicks,
            SUM(conversions) as total_conversions,
            SUM(attributed_revenue) as total_attributed_revenue
        FROM marketing_metrics
        WHERE campaign_id = ?
        """, (cmp_id,)).fetchone()

        spend_data = cursor.execute("""
        SELECT SUM(spend) as total_spend FROM marketing_spend WHERE campaign_id = ?
        """, (cmp_id,)).fetchone()

        # Customer acquisition count & CPA
        acq_data = cursor.execute("""
        SELECT COUNT(acquisition_id) as acq_count, AVG(cpa) as avg_cpa
        FROM customer_acquisition WHERE campaign_id = ?
        """, (cmp_id,)).fetchone()

        tot_imp = (metrics["total_impressions"] if metrics else 0) or 0
        tot_reach = (metrics["total_reach"] if metrics else 0) or 0
        tot_clicks = (metrics["total_clicks"] if metrics else 0) or 0
        tot_conv = (metrics["total_conversions"] if metrics else 0) or 0
        tot_rev = (metrics["total_attributed_revenue"] if metrics else 0.0) or 0.0
        tot_spend = (spend_data["total_spend"] if spend_data else 0.0) or 0.0
        tot_acq = (acq_data["acq_count"] if acq_data else 0) or 0

        ctr = round((tot_clicks / tot_imp * 100), 2) if tot_imp > 0 else 0.0
        conv_rate = round((tot_conv / tot_clicks * 100), 2) if tot_clicks > 0 else 0.0
        roas = round(tot_rev / tot_spend, 2) if tot_spend > 0 else 0.0
        cpc = round(tot_spend / tot_clicks, 2) if tot_clicks > 0 else 0.0
        cpa = round(tot_spend / tot_conv, 2) if tot_conv > 0 else 0.0
        cpm = round((tot_spend / tot_imp * 1000), 2) if tot_imp > 0 else 0.0

        # Channel breakdown for campaign
        channel_breakdown = cursor.execute("""
        SELECT channel, SUM(spend) as channel_spend
        FROM marketing_spend
        WHERE campaign_id = ?
        GROUP BY channel
        """, (cmp_id,)).fetchall()

        channels_info = [
            {"channel": ch["channel"], "spend": round(ch["channel_spend"], 2)}
            for ch in channel_breakdown
        ]

        planned_budget = c["budget"] or 1.0
        planned_roas = c["planned_roas"] or 0.0

        results.append({
            "campaign_id": cmp_id,
            "campaign_name": c["campaign_name"],
            "intention": {
                "objective": c["objective"],
                "start_date": c["start_date"],
                "end_date": c["end_date"],
                "budget": c["budget"],
                "target_audience": c["target_audience"],
                "geo_targeting": c["geo_targeting"],
                "demographic_targeting": c["demographic_targeting"],
                "channels": c["channels"],
                "ad_formats": c["ad_formats"],
                "featured_product_id": c["featured_product_id"],
                "campaign_message": c["campaign_message"],
                "offer_discount": c["offer_discount"],
                "planned_roas": planned_roas,
                "planned_conversions": c["planned_conversions"]
            },
            "execution": {
                "impressions": tot_imp,
                "reach": tot_reach,
                "frequency": round(tot_imp / max(1, tot_reach), 2),
                "actual_spend": round(tot_spend, 2),
                "budget_utilized_percent": round((tot_spend / planned_budget) * 100, 1),
                "channels_breakdown": channels_info
            },
            "results": {
                "clicks": tot_clicks,
                "ctr": ctr,
                "conversions": tot_conv,
                "conversion_rate": conv_rate,
                "cpc": cpc,
                "cpm": cpm,
                "cpa": cpa,
                "acquisitions": tot_acq,
                "attributed_revenue": round(tot_rev, 2),
                "actual_roas": roas,
                "roas_delta": round(roas - planned_roas, 2),
                "net_profit": round(tot_rev - tot_spend, 2)
            }
        })

    conn.close()
    return results

def compare_campaigns(campaign_ids=None, selected_metrics=None):
    all_campaigns = get_campaign_analytics()

    if campaign_ids:
        filtered = [c for c in all_campaigns if c["campaign_id"] in campaign_ids]
    else:
        filtered = all_campaigns

    if not selected_metrics:
        selected_metrics = ["actual_roas", "attributed_revenue", "actual_spend", "conversion_rate", "cpa", "ctr"]

    matrix = []
    for c in filtered:
        row = {
            "campaign_id": c["campaign_id"],
            "campaign_name": c["campaign_name"],
            "objective": c["intention"]["objective"],
            "actual_roas": c["results"]["actual_roas"],
            "attributed_revenue": c["results"]["attributed_revenue"],
            "actual_spend": c["execution"]["actual_spend"],
            "conversion_rate": c["results"]["conversion_rate"],
            "cpa": c["results"]["cpa"],
            "ctr": c["results"]["ctr"],
            "acquisitions": c["results"]["acquisitions"],
            "net_profit": c["results"]["net_profit"],
            "impressions": c["execution"]["impressions"]
        }
        matrix.append(row)

    # Rank campaigns by top metrics
    sorted_by_roas = sorted(matrix, key=lambda x: x["actual_roas"], reverse=True)
    sorted_by_rev = sorted(matrix, key=lambda x: x["attributed_revenue"], reverse=True)
    sorted_by_cpa = sorted(matrix, key=lambda x: x["cpa"], reverse=False)

    best_roas = sorted_by_roas[0] if sorted_by_roas else None
    best_revenue = sorted_by_rev[0] if sorted_by_rev else None
    best_cpa = sorted_by_cpa[0] if sorted_by_cpa else None

    tradeoff = ""
    if best_roas and best_revenue:
        tradeoff = f"Campaign '{best_roas['campaign_name']}' leads in efficiency with {best_roas['actual_roas']}x ROAS, whereas '{best_revenue['campaign_name']}' generated the largest total revenue scale at ${best_revenue['attributed_revenue']:,.2f}."

    return {
        "campaigns_compared": matrix,
        "rankings": {
            "highest_roas": best_roas["campaign_name"] if best_roas else "N/A",
            "highest_revenue": best_revenue["campaign_name"] if best_revenue else "N/A",
            "lowest_cpa": best_cpa["campaign_name"] if best_cpa else "N/A"
        },
        "tradeoff_analysis": tradeoff
    }

def get_content_analytics():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Post leaderboard
    posts = cursor.execute("""
    SELECT 
        sp.post_id, sp.published_at, sp.format, sp.content_theme, sp.caption, sp.post_url,
        sa.platform, sa.handle,
        c.campaign_name,
        pm.impressions, pm.reach, pm.likes, pm.comments, pm.shares, pm.saves, pm.video_views, pm.link_clicks
    FROM social_posts sp
    JOIN social_accounts sa ON sp.account_id = sa.account_id
    JOIN campaigns c ON sp.campaign_id = c.campaign_id
    JOIN social_post_metrics pm ON sp.post_id = pm.post_id
    ORDER BY pm.impressions DESC
    """).fetchall()

    leaderboard = []
    for p in posts:
        imp = p["impressions"]
        tot_eng = p["likes"] + p["comments"] + p["shares"] + p["saves"]
        eng_rate = round((tot_eng / imp * 100), 2) if imp > 0 else 0.0

        leaderboard.append({
            "post_id": p["post_id"],
            "platform": p["platform"],
            "campaign_name": p["campaign_name"],
            "format": p["format"],
            "content_theme": p["content_theme"],
            "caption": p["caption"],
            "impressions": imp,
            "reach": p["reach"],
            "likes": p["likes"],
            "comments": p["comments"],
            "shares": p["shares"],
            "saves": p["saves"],
            "video_views": p["video_views"],
            "link_clicks": p["link_clicks"],
            "total_engagement": tot_eng,
            "engagement_rate": eng_rate
        })

    # 2. Performance by format
    format_stats = cursor.execute("""
    SELECT 
        sp.format,
        COUNT(sp.post_id) as post_count,
        SUM(pm.impressions) as total_impressions,
        SUM(pm.likes + pm.comments + pm.shares + pm.saves) as total_engagement,
        SUM(pm.link_clicks) as total_clicks
    FROM social_posts sp
    JOIN social_post_metrics pm ON sp.post_id = pm.post_id
    GROUP BY sp.format
    """).fetchall()

    by_format = []
    for f in format_stats:
        imp = f["total_impressions"] or 0
        eng = f["total_engagement"] or 0
        by_format.append({
            "format": f["format"],
            "post_count": f["post_count"],
            "total_impressions": imp,
            "total_engagement": eng,
            "total_clicks": f["total_clicks"],
            "avg_engagement_rate": round((eng / imp * 100), 2) if imp > 0 else 0.0
        })

    # 3. Performance by theme
    theme_stats = cursor.execute("""
    SELECT 
        sp.content_theme,
        COUNT(sp.post_id) as post_count,
        SUM(pm.impressions) as total_impressions,
        SUM(pm.likes + pm.comments + pm.shares + pm.saves) as total_engagement,
        SUM(pm.link_clicks) as total_clicks
    FROM social_posts sp
    JOIN social_post_metrics pm ON sp.post_id = pm.post_id
    GROUP BY sp.content_theme
    """).fetchall()

    by_theme = [
        {
            "theme": t["content_theme"],
            "post_count": t["post_count"],
            "total_impressions": t["total_impressions"],
            "total_engagement": t["total_engagement"],
            "total_clicks": t["total_clicks"],
            "avg_engagement_rate": round((t["total_engagement"] / t["total_impressions"] * 100), 2) if t["total_impressions"] > 0 else 0.0
        }
        for t in theme_stats
    ]

    conn.close()

    # Dynamic summary synthesis
    top_format_item = max(by_format, key=lambda x: x["avg_engagement_rate"]) if by_format else None
    top_theme_item = max(by_theme, key=lambda x: x["total_impressions"]) if by_theme else None

    top_format_name = top_format_item["format"] if top_format_item else "N/A"
    top_format_rate = top_format_item["avg_engagement_rate"] if top_format_item else 0.0
    top_theme_name = top_theme_item["theme"] if top_theme_item else "N/A"

    main_finding = f"Content strategy is led by '{top_format_name}' delivering an average {top_format_rate}% engagement rate, with '{top_theme_name}' driving the highest impression reach across {len(leaderboard)} analyzed social posts."

    return {
        "summary": {
            "total_posts": len(leaderboard),
            "top_format": top_format_name,
            "top_format_engagement_rate": top_format_rate,
            "top_theme": top_theme_name,
            "main_finding": main_finding
        },
        "leaderboard": leaderboard,
        "by_format": by_format,
        "by_theme": by_theme
    }

def get_commerce_analytics():
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Product Matrix
    products = cursor.execute("""
    SELECT 
        p.product_id, p.product_name, p.price, p.cost_price, p.margin_percent, p.avg_rating, p.review_count, p.review_sentiment, p.sample_review,
        pc.category_name,
        SUM(oi.quantity) as total_units_sold,
        SUM(oi.total_price) as total_revenue
    FROM products p
    JOIN product_categories pc ON p.category_id = pc.category_id
    LEFT JOIN order_items oi ON p.product_id = oi.product_id
    GROUP BY p.product_id
    ORDER BY total_revenue DESC
    """).fetchall()

    product_list = [
        {
            "product_id": pr["product_id"],
            "product_name": pr["product_name"],
            "category_name": pr["category_name"],
            "price": pr["price"],
            "cost_price": pr["cost_price"],
            "margin_percent": pr["margin_percent"],
            "avg_rating": pr["avg_rating"],
            "review_count": pr["review_count"],
            "review_sentiment": pr["review_sentiment"],
            "sample_review": pr["sample_review"],
            "units_sold": pr["total_units_sold"] or 0,
            "total_revenue": round(pr["total_revenue"] or 0.0, 2),
            "estimated_gross_profit": round((pr["total_revenue"] or 0.0) * ((pr["margin_percent"] or 0.0) / 100), 2)
        }
        for pr in products
    ]

    # 2. Customer Segments analysis
    segments = cursor.execute("""
    SELECT 
        cs.segment_id, cs.segment_name, cs.age_band, cs.gender_focus, cs.region, cs.purchasing_behavior,
        COUNT(DISTINCT c.customer_id) as total_customers,
        COUNT(o.order_id) as total_orders,
        SUM(o.total_revenue) as segment_revenue
    FROM customer_segments cs
    LEFT JOIN customers c ON cs.segment_id = c.segment_id
    LEFT JOIN orders o ON c.customer_id = o.customer_id
    GROUP BY cs.segment_id
    ORDER BY segment_revenue DESC
    """).fetchall()

    segment_list = []
    for seg in segments:
        cust_cnt = seg["total_customers"] or 1
        rev = seg["segment_revenue"] or 0.0
        orders_cnt = seg["total_orders"] or 0
        segment_list.append({
            "segment_id": seg["segment_id"],
            "segment_name": seg["segment_name"],
            "age_band": seg["age_band"],
            "gender_focus": seg["gender_focus"],
            "region": seg["region"],
            "purchasing_behavior": seg["purchasing_behavior"],
            "total_customers": cust_cnt,
            "total_orders": orders_cnt,
            "total_revenue": round(rev, 2),
            "aov": round(rev / orders_cnt, 2) if orders_cnt > 0 else 0.0,
            "avg_customer_ltv": round(rev / cust_cnt, 2)
        })

    # Repeat Purchase Rate
    repeat_stats = cursor.execute("""
    SELECT 
        COUNT(DISTINCT customer_id) as total_unique_customers,
        COUNT(CASE WHEN order_count > 1 THEN 1 END) as repeat_customers
    FROM (
        SELECT customer_id, COUNT(order_id) as order_count
        FROM orders
        GROUP BY customer_id
    )
    """).fetchone()
    
    total_unique_cust = (repeat_stats['total_unique_customers'] if repeat_stats else 1) or 1
    repeat_cust_count = (repeat_stats['repeat_customers'] if repeat_stats else 0) or 0
    repeat_rate = round((repeat_cust_count / total_unique_cust) * 100, 1)

    conn.close()

    top_prod = product_list[0] if product_list else {}
    avg_margin = round(sum(p["margin_percent"] for p in product_list) / max(1, len(product_list)), 1) if product_list else 0.0
    top_seg = segment_list[0] if segment_list else {}

    commerce_finding = f"Top-ranking product '{top_prod.get('product_name', 'N/A')}' generated ${top_prod.get('total_revenue', 0.0):,.2f} in revenue across a catalog of {len(product_list)} items with an average {avg_margin}% unit gross margin."
    segment_finding = f"'{top_seg.get('segment_name', 'N/A')}' represents the primary customer segment (${top_seg.get('total_revenue', 0.0):,.2f} revenue, ${top_seg.get('avg_customer_ltv', 0.0):,.2f} avg LTV) with a {repeat_rate}% overall brand repeat purchase rate."

    return {
        "summary": {
            "top_product": top_prod.get("product_name", "N/A"),
            "top_product_revenue": top_prod.get("total_revenue", 0.0),
            "avg_margin_percent": avg_margin,
            "total_catalog_size": len(product_list),
            "main_finding": commerce_finding,
            "top_segment_name": top_seg.get("segment_name", "N/A"),
            "top_segment_revenue": top_seg.get("total_revenue", 0.0),
            "top_segment_ltv": top_seg.get("avg_customer_ltv", 0.0),
            "repeat_purchase_rate": repeat_rate,
            "segments_main_finding": segment_finding
        },
        "products": product_list,
        "segments": segment_list
    }

def get_funnel_analytics():
    conn = get_db_connection()
    cursor = conn.cursor()

    totals = cursor.execute("""
    SELECT 
        SUM(total_impressions) as impressions,
        SUM(total_website_visits) as visits,
        SUM(total_product_views) as product_views,
        SUM(total_add_to_carts) as add_to_carts,
        SUM(total_orders) as orders,
        SUM(total_revenue) as revenue
    FROM daily_kpis
    """).fetchone()

    imp = (totals["impressions"] if totals else 1) or 1
    visits = (totals["visits"] if totals else 1) or 1
    pviews = (totals["product_views"] if totals else 1) or 1
    carts = (totals["add_to_carts"] if totals else 1) or 1
    orders = (totals["orders"] if totals else 1) or 1
    total_rev = (totals["revenue"] if totals else 0.0) or 0.0

    conn.close()

    stages = [
        {"stage": "1. Ad Impressions", "count": imp, "conversion_from_prev": 100.0},
        {"stage": "2. Website Visits", "count": visits, "conversion_from_prev": round((visits / imp) * 100, 2)},
        {"stage": "3. Product Page Views", "count": pviews, "conversion_from_prev": round((pviews / visits) * 100, 2)},
        {"stage": "4. Add to Cart", "count": carts, "conversion_from_prev": round((carts / pviews) * 100, 2)},
        {"stage": "5. Completed Orders", "count": orders, "conversion_from_prev": round((orders / carts) * 100, 2)}
    ]

    # Find bottleneck stage (lowest non-100% conversion rate)
    sub_stages = stages[1:]
    bottleneck_stage = min(sub_stages, key=lambda s: s["conversion_from_prev"]) if sub_stages else stages[0]
    overall_conv = round((orders / visits) * 100, 2)

    funnel_finding = f"The primary conversion bottleneck occurs at {bottleneck_stage['stage']} ({bottleneck_stage['conversion_from_prev']}% step conversion), resulting in an overall visit-to-order rate of {overall_conv}% across {visits:,} website visits."

    return {
        "summary": {
            "total_impressions": imp,
            "total_visits": visits,
            "total_orders": orders,
            "overall_conv_rate": overall_conv,
            "primary_drop_off_stage": f"{bottleneck_stage['stage']} ({bottleneck_stage['conversion_from_prev']}%)",
            "main_finding": funnel_finding
        },
        "funnel_stages": stages,
        "overall_visit_to_order_conv_rate": overall_conv,
        "total_revenue": round(total_rev, 2)
    }

if __name__ == "__main__":
    print("Testing Analytics Engine...")
    print("Overview:", get_executive_overview()["summary"])
    print("Commerce Summary:", get_commerce_analytics()["summary"])
    print("Funnel Summary:", get_funnel_analytics()["summary"])
