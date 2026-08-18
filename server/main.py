import os
import json
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Any, Dict

from db import init_db, ingest_csv_data
from analytics import (
    get_executive_overview,
    get_campaign_analytics,
    compare_campaigns,
    get_content_analytics,
    get_commerce_analytics,
    get_funnel_analytics
)
from ai_reasoner import interpret_area, recommend_next_campaign

# Initialize DB on server start
init_db()
ingest_csv_data()

app = FastAPI(title="NEXORA Consumer & Marketing Intelligence Platform API", version="1.0.0")

# Enable CORS for frontend Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CompareRequest(BaseModel):
    campaign_ids: Optional[List[str]] = None
    selected_metrics: Optional[List[str]] = None

class InterpretRequest(BaseModel):
    area: str
    context: Optional[dict] = None

class UploadedFilePayload(BaseModel):
    name: str
    size: int
    dataset_type: Optional[str] = "custom_dataset"
    row_count: Optional[int] = 0
    content: Optional[str] = None

class CreateProjectRequest(BaseModel):
    project_name: str
    description: str
    category: Optional[str] = "Growth & Marketing"
    campaign_id: Optional[str] = None
    budget: Optional[float] = 0.0
    target_roas: Optional[float] = 0.0
    status: Optional[str] = "Active"
    uploaded_files: Optional[List[UploadedFilePayload]] = []

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
CUSTOM_PROJECTS_FILE = os.path.join(DATA_DIR, "custom_projects.json")
UPLOADS_DIR = os.path.join(DATA_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

# Default base projects in workspace
DEFAULT_PROJECTS = [
    {
        "project_id": "PRJ-01",
        "project_name": "Q1 Work From Home Campaign",
        "campaign_id": "CMP-2025-01",
        "category": "Home Office",
        "budget": 25000,
        "target_roas": 3.2,
        "status": "Completed",
        "description": "Focus on home office standing desk setup transformation and productivity ergonomics.",
        "created_at": "2025-01-05",
        "uploaded_files": [
            {"name": "marketing_metrics.csv", "size": 16403, "dataset_type": "Marketing Metrics", "row_count": 212},
            {"name": "marketing_spend.csv", "size": 40691, "dataset_type": "Marketing Spend", "row_count": 636}
        ]
    },
    {
        "project_id": "PRJ-02",
        "project_name": "Spring Gen Z Aesthetic Campaign",
        "campaign_id": "CMP-2025-02",
        "category": "Aesthetics & Lighting",
        "budget": 18000,
        "target_roas": 4.0,
        "status": "Completed",
        "description": "Viral short video campaign targeting ambient sunset lighting and aesthetic desk spaces.",
        "created_at": "2025-02-20",
        "uploaded_files": [
            {"name": "social_posts.csv", "size": 10566, "dataset_type": "Social Posts", "row_count": 40},
            {"name": "social_post_metrics.csv", "size": 2433, "dataset_type": "Social Metrics", "row_count": 40}
        ]
    },
    {
        "project_id": "PRJ-03",
        "project_name": "Mindful Workspaces & Aromatherapy",
        "campaign_id": "CMP-2025-03",
        "category": "Wellness",
        "budget": 15000,
        "target_roas": 3.5,
        "status": "Completed",
        "description": "Wellness marketing strategy driving repeat diffuser and essential oil purchases.",
        "created_at": "2025-05-10",
        "uploaded_files": [
            {"name": "products.csv", "size": 2164, "dataset_type": "Product Catalog", "row_count": 12},
            {"name": "attribution.csv", "size": 203339, "dataset_type": "Attribution", "row_count": 2800}
        ]
    },
    {
        "project_id": "PRJ-04",
        "project_name": "Diwali & Festive Glow Mega Campaign",
        "campaign_id": "CMP-2025-04",
        "category": "Festive Gifting",
        "budget": 60000,
        "target_roas": 5.0,
        "status": "Completed",
        "description": "High-scale holiday gifting push across Meta, Google Shopping, and YouTube.",
        "created_at": "2025-09-15",
        "uploaded_files": [
            {"name": "orders.csv", "size": 217421, "dataset_type": "Orders", "row_count": 2800},
            {"name": "order_items.csv", "size": 174515, "dataset_type": "Order Items", "row_count": 4081}
        ]
    },
    {
        "project_id": "PRJ-05",
        "project_name": "Winter Retargeting Push",
        "campaign_id": "CMP-2025-05",
        "category": "Retargeting",
        "budget": 20000,
        "target_roas": 4.5,
        "status": "Completed",
        "description": "High-efficiency cart abandonment push maximizing ROAS for end-of-year sale.",
        "created_at": "2025-11-15",
        "uploaded_files": [
            {"name": "customer_acquisition.csv", "size": 67575, "dataset_type": "Customer Acquisition", "row_count": 1088}
        ]
    }
]

def load_custom_projects() -> List[dict]:
    if os.path.exists(CUSTOM_PROJECTS_FILE):
        try:
            with open(CUSTOM_PROJECTS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_custom_projects(projects: List[dict]):
    with open(CUSTOM_PROJECTS_FILE, "w", encoding="utf-8") as f:
        json.dump(projects, f, indent=2)

def get_all_projects() -> List[dict]:
    custom = load_custom_projects()
    # Merge, ensuring no duplicates by project_id
    custom_ids = {p["project_id"] for p in custom}
    merged = [p for p in DEFAULT_PROJECTS if p["project_id"] not in custom_ids] + custom
    return merged

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "brand": "NEXORA",
        "database": "SQLite Relational DB Connected",
        "version": "1.0.0"
    }

@app.post("/api/ingest/reload")
def reload_data():
    res = ingest_csv_data()
    return res

@app.get("/api/analytics/overview")
def overview_endpoint():
    return get_executive_overview()

@app.get("/api/analytics/campaigns")
def campaigns_endpoint():
    return get_campaign_analytics()

@app.post("/api/analytics/compare")
def compare_endpoint(req: CompareRequest):
    return compare_campaigns(req.campaign_ids, req.selected_metrics)

@app.get("/api/analytics/content")
def content_endpoint():
    return get_content_analytics()

@app.get("/api/analytics/commerce")
def commerce_endpoint():
    return get_commerce_analytics()

@app.get("/api/analytics/funnel")
def funnel_endpoint():
    return get_funnel_analytics()

@app.get("/api/projects")
def projects_endpoint():
    return get_all_projects()

@app.post("/api/projects")
def create_project_endpoint(req: CreateProjectRequest):
    all_projects = get_all_projects()
    next_idx = len(all_projects) + 1
    project_id = f"PRJ-{next_idx:02d}"
    campaign_id = req.campaign_id.strip() if req.campaign_id and req.campaign_id.strip() else f"CMP-2026-{next_idx:02d}"

    project_dir = os.path.join(UPLOADS_DIR, project_id)
    os.makedirs(project_dir, exist_ok=True)

    saved_files_metadata = []
    if req.uploaded_files:
        for file_item in req.uploaded_files:
            file_name = file_item.name
            safe_name = os.path.basename(file_name)
            file_path = os.path.join(project_dir, safe_name)
            
            # Save file content if provided
            if file_item.content:
                try:
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(file_item.content)
                except Exception as e:
                    print(f"Error saving uploaded file {safe_name}: {e}")

            saved_files_metadata.append({
                "name": safe_name,
                "size": file_item.size,
                "dataset_type": file_item.dataset_type or "Custom Dataset",
                "row_count": file_item.row_count or (len(file_item.content.splitlines()) - 1 if file_item.content else 0)
            })

    new_project = {
        "project_id": project_id,
        "project_name": req.project_name,
        "campaign_id": campaign_id,
        "category": req.category or "Growth & Marketing",
        "budget": req.budget or 0.0,
        "target_roas": req.target_roas or 0.0,
        "status": req.status or "Active",
        "description": req.description,
        "created_at": datetime.now().strftime("%Y-%m-%d"),
        "uploaded_files": saved_files_metadata
    }

    custom_projects = load_custom_projects()
    custom_projects.append(new_project)
    save_custom_projects(custom_projects)

    return new_project

@app.delete("/api/projects/{project_id}")
def delete_project_endpoint(project_id: str):
    custom_projects = load_custom_projects()
    updated = [p for p in custom_projects if p["project_id"] != project_id]
    if len(updated) == len(custom_projects):
        # Might be a default project
        raise HTTPException(status_code=404, detail="Custom project not found or default project cannot be removed")
    save_custom_projects(updated)
    return {"status": "success", "message": f"Project {project_id} deleted"}

@app.post("/api/ai/interpret")
def interpret_endpoint(req: InterpretRequest):
    return interpret_area(req.area, req.context)

@app.post("/api/ai/recommend-next-campaign")
def recommend_next_campaign_endpoint():
    return recommend_next_campaign()

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

DIST_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dist")
if os.path.exists(DIST_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST_DIR, "assets")), name="assets")

    @app.get("/")
    def serve_frontend_root():
        return FileResponse(os.path.join(DIST_DIR, "index.html"))

    @app.get("/{catchall:path}")
    def serve_frontend_catchall(catchall: str):
        if catchall.startswith("api"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        file_path = os.path.join(DIST_DIR, catchall)
        if os.path.exists(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(DIST_DIR, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000)
