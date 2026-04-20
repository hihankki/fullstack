def test_weather_api(client):
    res = client.get("/api/external/weather?city=London")

    assert res.status_code == 200
    data = res.json()

    assert "temperature" in data
    assert data["city"] == "London"