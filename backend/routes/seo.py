from __future__ import annotations

from fastapi import APIRouter, Response

from config import APP_BASE_URL, FRONTEND_BASE_URL
from db import list_reviews

router = APIRouter()


@router.get("/robots.txt", response_class=Response)
async def robots_txt():
    content = "\n".join(
        [
            "User-agent: *",
            "Allow: /",
            "Disallow: /login",
            "Disallow: /register",
            "Disallow: /my",
            "Disallow: /create",
            "Disallow: /admin",
            f"Sitemap: {APP_BASE_URL}/sitemap.xml",
        ]
    )
    return Response(content=content, media_type="text/plain; charset=utf-8")


@router.get("/sitemap.xml", response_class=Response)
async def sitemap_xml():
    public_urls = [
        f"{FRONTEND_BASE_URL}/",
        f"{FRONTEND_BASE_URL}/search",
    ]

    review_urls = [
        f"{FRONTEND_BASE_URL}/reviews/{review.id}"
        for review in list_reviews()
    ]

    urls = public_urls + review_urls

    body = "".join(
        f"""
    <url>
      <loc>{url}</loc>
    </url>"""
        for url in urls
    )

    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  {body}
</urlset>"""
    return Response(content=xml, media_type="application/xml; charset=utf-8")