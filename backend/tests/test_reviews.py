def test_create_review_unauthorized(client):
    res = client.post("/api/reviews/", json={
        "title": "test",
        "content": "test",
        "rating": 5,
        "category": "Магазин",
        "city": "Riga"
    })

    assert res.status_code == 401