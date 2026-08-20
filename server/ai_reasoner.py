import os
import sys
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from analytics import (
    get_executive_overview,
    get_campaign_analytics,
    get_content_analytics,
    get_commerce_analytics,
    get_funnel_analytics,
    compare_campaigns
)

def format_structured_response(observed_list, inferred_list, recommended_list):
    """Ensures AI response strictly adheres to OBSERVED, INFERRED, RECOMMENDED sections."""
    return {
        "observed": observed_list,
        "inferred": inferred_list,
        "recommended": recommended_list
    }

def interpret_area(area_name, context_data=None):
    """
    Dataset-driven AI Reasoner for focused analysis areas:
    - overview
    - campaigns
    - campaign_comparison
    - content
    - commerce
    - funnel
    """
    if area_name == "overview":
        overview = get_executive_overview()
        summary = overview["summary"]
        
        observed = [
            f"Total Brand Revenue generated across the period reached ${summary['total_revenue']:,.2f} on a total marketing spend of ${summary['total_spend']:,.2f}, delivering an overall ROAS of {summary['overall_roas']}x.",
            f"Total order volume stood at {summary['total_orders']:,} orders with an Average Order Value (AOV) of ${summary['aov']:,.2f}.",
            f"Customer retention achieved a {summary['repeat_purchase_rate']}% repeat purchase rate ({summary['returning_customers']:,} returning orders vs {summary['new_customers']:,} new customer acquisitions).",
            f"The single top revenue-generating campaign was '{summary['top_campaign']}'."
        ]
        
        inferred = [
            f"The {summary['repeat_purchase_rate']}% repeat purchase rate indicates strong brand loyalty and repeat customer lifetime value, reducing reliance on top-of-funnel acquisition over time.",
            f"Overall marketing return ({summary['overall_roas']}x ROAS) reflects healthy capital efficiency, anchored by high-performing scale in '{summary['top_campaign']}'."
        ]
        
        recommended = [
            f"Maintain disciplined spend allocation prioritizing proven high-ROAS channels while nurturing the {summary['repeat_purchase_rate']}% repeat customer base.",
            f"Deploy personalized cross-sell and product bundling workflows to increase the current Average Order Value (${summary['aov']:,.2f})."
        ]
        
        return format_structured_response(observed, inferred, recommended)

    elif area_name == "campaigns":
        campaigns = get_campaign_analytics()
        if not campaigns:
            return format_structured_response(
                ["No campaign data available in active dataset."],
                ["Awaiting campaign records for statistical inference."],
                ["Upload campaign dataset to generate recommendations."]
            )

        best_roas = max(campaigns, key=lambda c: c["results"]["actual_roas"])
        worst_roas = min(campaigns, key=lambda c: c["results"]["actual_roas"])
        best_rev = max(campaigns, key=lambda c: c["results"]["attributed_revenue"])
        min_spend = min(campaigns, key=lambda c: c["execution"]["actual_spend"])
        max_spend = max(campaigns, key=lambda c: c["execution"]["actual_spend"])
        
        observed = [
            f"Evaluated {len(campaigns)} marketing campaigns with actual spend ranging from ${min_spend['execution']['actual_spend']:,.2f} to ${max_spend['execution']['actual_spend']:,.2f}.",
            f"Highest ROAS was achieved by '{best_roas['campaign_name']}' ({best_roas['results']['actual_roas']}x ROAS, ${best_roas['results']['attributed_revenue']:,.2f} revenue on ${best_roas['execution']['actual_spend']:,.2f} spend).",
            f"Lowest ROAS was recorded by '{worst_roas['campaign_name']}' ({worst_roas['results']['actual_roas']}x ROAS, {worst_roas['results']['conversion_rate']}% conversion rate on ${worst_roas['execution']['actual_spend']:,.2f} spend)."
        ]
        
        inferred = [
            f"Campaign performance varies significantly by objective: high-efficiency pushes (e.g. '{best_roas['campaign_name']}') achieve up to {best_roas['results']['actual_roas']}x ROAS, whereas broad awareness campaigns show lower direct conversion efficiency.",
            f"Top revenue scale was delivered by '{best_rev['campaign_name']}' (${best_rev['results']['attributed_revenue']:,.2f} revenue), demonstrating effective audience demand capture."
        ]
        
        recommended = [
            f"Scale marketing budget dynamically into channels powering '{best_roas['campaign_name']}' while setting strict CPA thresholds on lower-return campaigns.",
            "Establish multi-touch attribution workflows to track assisted conversions from top-of-funnel awareness pushes."
        ]
        
        return format_structured_response(observed, inferred, recommended)

    elif area_name == "campaign_comparison":
        cmp_ids = context_data.get("campaign_ids", []) if context_data else []
        comparison = compare_campaigns(cmp_ids)
        rankings = comparison["rankings"]
        matrix = comparison["campaigns_compared"]
        
        obs = [
            f"Highest ROAS campaign among selected: {rankings['highest_roas']}.",
            f"Highest Absolute Revenue campaign among selected: {rankings['highest_revenue']}.",
            f"Lowest CPA campaign among selected: {rankings['lowest_cpa']}."
        ]
        for item in matrix[:4]:
            obs.append(f"Campaign '{item['campaign_name']}': ROAS={item['actual_roas']}x, Revenue=${item['attributed_revenue']:,.2f}, Spend=${item['actual_spend']:,.2f}, Conv Rate={item['conversion_rate']}%, CPA=${item['cpa']:,.2f}.")

        inf = [
            "Campaign comparison demonstrates a clear trade-off between scale and efficiency across active marketing initiatives.",
            f"The strategic contrast between '{rankings['highest_roas']}' (efficiency leader) and '{rankings['highest_revenue']}' (revenue leader) highlights the need to balance profit margin vs market penetration."
        ]

        rec = [
            f"Combine top-of-funnel awareness tactics from '{rankings['highest_revenue']}' with retargeting mechanisms modeled after '{rankings['highest_roas']}'.",
            "Establish dual-target campaign benchmarks: set a floor ROAS target alongside absolute revenue stretch goals."
        ]

        return format_structured_response(obs, inf, rec)

    elif area_name == "content":
        content = get_content_analytics()
        by_fmt = content["by_format"]
        leader = content["leaderboard"]
        
        top_fmt = max(by_fmt, key=lambda x: x["avg_engagement_rate"]) if by_fmt else None
        top_post = leader[0] if leader else None
        
        obs = [
            f"Social post leaderboard across {len(leader)} posts is led by '{top_post['format'] if top_post else 'Top Post'}' on {top_post['platform'] if top_post else 'social media'} ({top_post['impressions'] if top_post else 0:,} impressions, {top_post['engagement_rate'] if top_post else 0}% engagement rate).",
            f"Format performance: '{top_fmt['format'] if top_fmt else 'N/A'}' achieved the highest average engagement rate at {top_fmt['avg_engagement_rate'] if top_fmt else 0}%.",
            f"Top creative content theme identified: '{content['summary']['top_theme']}'."
        ]

        inf = [
            f"Audience response varies strongly by content format: '{top_fmt['format'] if top_fmt else 'Top Format'}' generates the strongest interactive engagement.",
            "High-engagement social assets serve as strong indicators of creative resonance that can be translated into paid acquisition campaigns."
        ]

        rec = [
            f"Allocate a larger share of content production to '{top_fmt['format'] if top_fmt else 'top-performing formats'}' to maximize organic and paid discovery.",
            "Repurpose high-performing organic posts into paid ad creatives to improve ad click-through rates and lower acquisition costs."
        ]

        return format_structured_response(obs, inf, rec)

    elif area_name == "commerce":
        commerce = get_commerce_analytics()
        products = commerce["products"]
        segments = commerce["segments"]
        
        top_prod = products[0] if products else {}
        top_seg = max(segments, key=lambda x: x["total_revenue"]) if segments else {}

        obs = [
            f"Top revenue product: '{top_prod.get('product_name', 'N/A')}' generating ${top_prod.get('total_revenue', 0.0):,.2f} with {top_prod.get('units_sold', 0)} units sold.",
            f"Top customer segment by revenue: '{top_seg.get('segment_name', 'N/A')}' contributing ${top_seg.get('total_revenue', 0.0):,.2f} with an AOV of ${top_seg.get('aov', 0.0):,.2f} and avg LTV of ${top_seg.get('avg_customer_ltv', 0.0):,.2f}.",
            f"Catalog health: {len(products)} products analyzed with an average unit gross margin of {commerce['summary']['avg_margin_percent']}%."
        ]

        inf = [
            f"'{top_seg.get('segment_name', 'N/A')}' represents the highest-value customer demographic, driving substantial revenue and high lifetime value.",
            f"Hero product '{top_prod.get('product_name', 'N/A')}' anchors the revenue portfolio, serving as a primary conversion anchor."
        ]

        rec = [
            f"Create product bundles pairing '{top_prod.get('product_name', 'N/A')}' with complementary accessories to elevate average basket sizes.",
            f"Develop dedicated lifecycle email and loyalty incentives tailored specifically to '{top_seg.get('segment_name', 'N/A')}' customers."
        ]

        return format_structured_response(obs, inf, rec)

    elif area_name == "funnel":
        funnel = get_funnel_analytics()
        stages = funnel["funnel_stages"]
        summary = funnel["summary"]

        obs = [
            f"Evaluated 5-stage conversion funnel across {summary['total_impressions']:,} ad impressions and {summary['total_visits']:,} website visits.",
            f"Primary conversion drop-off bottleneck stage: {summary['primary_drop_off_stage']}.",
            f"Overall visit-to-order conversion rate stood at {summary['overall_conv_rate']}% resulting in {summary['total_orders']:,} completed transactions."
        ]

        inf = [
            f"The primary loss of customer momentum occurs at {summary['primary_drop_off_stage']}, identifying the highest-leverage optimization target.",
            "Downstream traffic that completes initial product discovery shows steady conversion progression through to checkout."
        ]

        rec = [
            f"Target UX and copywriting optimizations directly at {summary['primary_drop_off_stage']} to reduce drop-off friction.",
            "Implement automated cart-abandonment and browse-abandonment recovery sequences to capture high-intent shoppers."
        ]

        return format_structured_response(obs, inf, rec)

    else:
        return format_structured_response(
            ["Analyzed cross-domain performance metrics across active dataset."],
            ["Data indicates direct correlation between creative engagement and conversion return."],
            ["Focus upcoming budget allocations on high-performing multi-channel campaigns."]
        )

def recommend_next_campaign():
    """Generates evidence-based strategic direction for the brand's next marketing campaign from active dataset."""
    campaigns = get_campaign_analytics()
    content = get_content_analytics()
    commerce = get_commerce_analytics()
    overview = get_executive_overview()

    if not campaigns:
        return {
            "strategic_direction": {
                "title": "Strategic Direction Blueprint",
                "target_audience": {"primary_segment": "All Customers", "demographics": "N/A", "evidence_badge": "[OBSERVED] Baseline data"},
                "messaging_concept": {"angle": "Growth Campaign", "core_value_prop": "Quality & Performance", "offer_strategy": "Introductory Discount", "evidence_badge": "[OBSERVED]"},
                "content_and_channels": {"channel_split": "50% Paid Social, 50% Search", "creative_formats": "Video & Display", "evidence_badge": "[OBSERVED]"},
                "budget_and_kpis": {"recommended_budget": 25000.0, "target_roas": 3.5, "target_cpa": 25.0, "planned_conversions": 500, "evidence_badge": "[OBSERVED]"},
                "what_is_working": ["Active dataset loaded."],
                "what_is_underperforming": ["Optimization in progress."],
                "key_experiments": ["Test ad creatives."],
                "pitfalls_to_avoid": ["Avoid unmonitored spend."]
            }
        }

    # Synthesize dynamic evidence
    best_cmp = max(campaigns, key=lambda c: c["results"]["actual_roas"])
    best_rev_cmp = max(campaigns, key=lambda c: c["results"]["attributed_revenue"])
    top_product = commerce["products"][0] if commerce["products"] else {"product_name": "Hero Product"}
    top_segment = commerce["segments"][0] if commerce["segments"] else {"segment_name": "Target Audience"}
    top_format = content["summary"].get("top_format", "Short Video")

    # Extract top channels from best campaign
    top_channels = ", ".join([ch["channel"] for ch in best_cmp["execution"]["channels_breakdown"][:3]]) if best_cmp["execution"]["channels_breakdown"] else "Paid Social, Search"

    rec_budget = round(best_cmp["execution"]["actual_spend"] * 1.2, -2) if best_cmp["execution"]["actual_spend"] > 0 else 25000.0
    target_roas = best_cmp["results"]["actual_roas"]
    target_cpa = best_cmp["results"]["cpa"] if best_cmp["results"]["cpa"] > 0 else 25.0

    what_is_working = [
        f"Top Campaign '{best_rev_cmp['campaign_name']}': Delivered ${best_rev_cmp['results']['attributed_revenue']:,.2f} revenue at {best_rev_cmp['results']['actual_roas']}x ROAS.",
        f"Customer Retention: {overview['summary']['repeat_purchase_rate']}% repeat purchase rate with {top_segment.get('segment_name', 'Top Segment')} driving ${top_segment.get('aov', 0):,.2f} AOV.",
        f"Top Creative Format: '{top_format}' achieved {content['summary'].get('top_format_engagement_rate', 0)}% avg engagement across social posts."
    ]

    worst_cmp = min(campaigns, key=lambda c: c["results"]["actual_roas"])
    what_is_underperforming = [
        f"Campaign '{worst_cmp['campaign_name']}': Generated {worst_cmp['results']['actual_roas']}x ROAS with {worst_cmp['results']['conversion_rate']}% conversion rate.",
        f"Ad conversion drop-off remains highest on unoptimized first-click channels without dynamic retargeting."
    ]

    return {
        "strategic_direction": {
            "title": f"Strategic Direction: Next Growth Campaign Blueprint",
            "target_audience": {
                "primary_segment": top_segment.get("segment_name", "Target Audience"),
                "demographics": f"Targeting {top_segment.get('age_band', 'Key')} Demographics in {top_segment.get('region', 'Primary Regions')}",
                "evidence_badge": f"[OBSERVED] Drove highest customer LTV (${top_segment.get('avg_customer_ltv', 0):,.2f}) and total segment revenue (${top_segment.get('total_revenue', 0):,.2f})."
            },
            "messaging_concept": {
                "angle": f"Premium Performance & Value: Featuring {top_product.get('product_name', 'Flagship Product')}",
                "core_value_prop": f"Deliver top-tier quality and seamless customer experience with {top_product.get('product_name', 'our flagship lineup')}.",
                "offer_strategy": f"Special Promotional Bundle featuring {top_product.get('product_name', 'Hero Item')}",
                "evidence_badge": f"[OBSERVED] Campaign '{best_rev_cmp['campaign_name']}' proved demand by generating ${best_rev_cmp['results']['attributed_revenue']:,.2f} in revenue."
            },
            "content_and_channels": {
                "channel_split": f"Focus on top validated channels: {top_channels}",
                "creative_formats": f"Primary emphasis on '{top_format}' and interactive multi-slide carousels",
                "evidence_badge": f"[OBSERVED] '{top_format}' achieved {content['summary'].get('top_format_engagement_rate', 0)}% engagement rate across analyzed creative assets."
            },
            "budget_and_kpis": {
                "recommended_budget": rec_budget,
                "target_roas": target_roas,
                "target_cpa": target_cpa,
                "planned_conversions": int(best_cmp["results"]["conversions"] * 1.1) if best_cmp["results"]["conversions"] > 0 else 500,
                "evidence_badge": f"[OBSERVED] Campaign '{best_cmp['campaign_name']}' demonstrated that {best_cmp['results']['actual_roas']}x ROAS is achievable."
            },
            "what_is_working": what_is_working,
            "what_is_underperforming": what_is_underperforming,
            "key_experiments": [
                f"Test short-form video UGC vs studio showcase ads on top channels ({top_channels}).",
                f"Test post-purchase upsell workflows for top accessory products to lift Average Order Value."
            ],
            "pitfalls_to_avoid": [
                "Do NOT scale broad awareness campaigns without retargeting pixels and capture mechanisms.",
                "Do NOT rely on single static creatives; multi-format testing drives higher clickthrough rates."
            ]
        }
    }
