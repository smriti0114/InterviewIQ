def test_generate_interview_validation_error(client, auth_headers):
    # Test invalid question count (< 5)
    response = client.post(
        "/api/interviews/generate",
        headers=auth_headers,
        json={
            "role_title": "Python Developer",
            "required_skills": "Python, FastAPI",
            "question_count": 2  # Minimum is 5
        }
    )
    assert response.status_code == 422


def test_generate_interview_demo_mode(client, auth_headers):
    response = client.post(
        "/api/interviews/generate",
        headers=auth_headers,
        json={
            "role_title": "Senior Python Developer",
            "required_skills": "Python, SQL, FastApi, Docker",
            "experience_level": "Senior",
            "interview_type": "Mixed",
            "difficulty": "Hard",
            "question_count": 5,
            "demo_mode": True
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["role_title"] == "Senior Python Developer"
    assert len(data["questions"]) == 5

    # Check rubric consistency
    for q in data["questions"]:
        assert q["max_score"] > 0
        rubric_sum = sum(c["max_points"] for c in q["evaluation_rubric"])
        assert rubric_sum == q["max_score"]
        assert len(q["key_concepts"]) > 0
        assert len(q["suggested_answer"]) > 10


def test_user_ownership_isolation(client, auth_headers, other_auth_headers):
    # User 1 creates an interview
    create_resp = client.post(
        "/api/interviews/generate",
        headers=auth_headers,
        json={
            "role_title": "Frontend Architect",
            "required_skills": "React, TypeScript, CSS",
            "question_count": 5,
            "demo_mode": True
        }
    )
    assert create_resp.status_code == 201
    interview_id = create_resp.json()["id"]

    # User 2 attempts to fetch User 1's interview -> 404
    forbidden_get = client.get(
        f"/api/interviews/{interview_id}",
        headers=other_auth_headers
    )
    assert forbidden_get.status_code == 404

    # User 2 attempts to delete User 1's interview -> 404
    forbidden_delete = client.delete(
        f"/api/interviews/{interview_id}",
        headers=other_auth_headers
    )
    assert forbidden_delete.status_code == 404


def test_update_and_regenerate_question(client, auth_headers):
    # 1. Create interview
    create_resp = client.post(
        "/api/interviews/generate",
        headers=auth_headers,
        json={
            "role_title": "Data Engineer",
            "required_skills": "Python, PySpark, Airflow",
            "question_count": 5,
            "demo_mode": True
        }
    )
    assert create_resp.status_code == 201
    interview_id = create_resp.json()["id"]
    original_q1 = create_resp.json()["questions"][0]

    # 2. Regenerate question 1
    regen_resp = client.post(
        f"/api/interviews/{interview_id}/regenerate-question",
        headers=auth_headers,
        json={
            "question_id": original_q1["id"],
            "feedback": "Make it focused on PySpark performance tuning"
        }
    )
    assert regen_resp.status_code == 200
    updated_q1 = regen_resp.json()["questions"][0]
    assert updated_q1["id"] == original_q1["id"]

    # 3. Update interview evaluations
    update_resp = client.put(
        f"/api/interviews/{interview_id}",
        headers=auth_headers,
        json={
            "evaluations": {
                updated_q1["id"]: {
                    "candidate_answer": "Candidate explained broadcast joins and partitioning well.",
                    "overall_question_score": 9,
                    "feedback": "Solid answer."
                }
            }
        }
    )
    assert update_resp.status_code == 200
    assert updated_q1["id"] in update_resp.json()["evaluations"]


def test_duplicate_and_delete_interview(client, auth_headers):
    # Create interview
    create_resp = client.post(
        "/api/interviews/generate",
        headers=auth_headers,
        json={
            "role_title": "DevOps Engineer",
            "required_skills": "Kubernetes, Terraform, CI/CD",
            "question_count": 5,
            "demo_mode": True
        }
    )
    assert create_resp.status_code == 201
    interview_id = create_resp.json()["id"]

    # Duplicate
    dup_resp = client.post(
        f"/api/interviews/{interview_id}/duplicate",
        headers=auth_headers
    )
    assert dup_resp.status_code == 201
    dup_id = dup_resp.json()["id"]
    assert dup_id != interview_id
    assert "Copy" in dup_resp.json()["role_title"]

    # Delete duplicate
    del_resp = client.delete(
        f"/api/interviews/{dup_id}",
        headers=auth_headers
    )
    assert del_resp.status_code == 200

    # Ensure deleted
    get_resp = client.get(
        f"/api/interviews/{dup_id}",
        headers=auth_headers
    )
    assert get_resp.status_code == 404
