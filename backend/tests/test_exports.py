import json


def test_export_interview_endpoints(client, auth_headers):
    # 1. Create interview
    create_resp = client.post(
        "/api/interviews/generate",
        headers=auth_headers,
        json={
            "role_title": "Full Stack Engineer",
            "required_skills": "React, Node.js, PostgreSQL",
            "question_count": 5,
            "demo_mode": True
        }
    )
    assert create_resp.status_code == 201
    interview_id = create_resp.json()["id"]

    # 2. Test PDF Export
    pdf_resp = client.get(
        f"/api/interviews/{interview_id}/export/pdf",
        headers=auth_headers
    )
    assert pdf_resp.status_code == 200
    assert pdf_resp.headers["content-type"] == "application/pdf"
    # PDF magic bytes
    assert pdf_resp.content.startswith(b"%PDF")

    # 3. Test CSV Export
    csv_resp = client.get(
        f"/api/interviews/{interview_id}/export/csv",
        headers=auth_headers
    )
    assert csv_resp.status_code == 200
    assert "text/csv" in csv_resp.headers["content-type"]
    assert "InterviewIQ" in csv_resp.text
    assert "Full Stack Engineer" in csv_resp.text

    # 4. Test JSON Export
    json_resp = client.get(
        f"/api/interviews/{interview_id}/export/json",
        headers=auth_headers
    )
    assert json_resp.status_code == 200
    assert "application/json" in json_resp.headers["content-type"]
    exported_data = json.loads(json_resp.text)
    assert exported_data["id"] == interview_id
    assert len(exported_data["questions"]) == 5
