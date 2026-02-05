from unittest.mock import patch
import requests

BASE_URL = "http://localhost:8080"

@patch("requests.post")
def test_user_registration_happy_path(mock_post):
    # Arrange
    registration_endpoint = f"{BASE_URL}/api/register"
    registration_payload = {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "StrongPassw0rd!",
        "confirmPassword": "StrongPassw0rd!"
    }
    mock_response = requests.Response()
    mock_response.status_code = 200
    mock_response._content = b'{"message":"Registration successful","userId":"12345"}'
    mock_post.return_value = mock_response

    # Act
    response = requests.post(registration_endpoint, json=registration_payload, timeout=30)

    # Assert
    assert response.status_code == 200
    json_resp = response.json()
    assert "message" in json_resp
    assert json_resp["message"] == "Registration successful"
    assert "userId" in json_resp and isinstance(json_resp["userId"], str)

test_user_registration_happy_path()
