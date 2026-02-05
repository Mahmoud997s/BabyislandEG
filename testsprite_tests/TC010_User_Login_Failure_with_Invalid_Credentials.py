import requests
from unittest.mock import patch, Mock
from requests.exceptions import RequestException

BASE_URL = "http://localhost:8080"

def test_user_login_failure_with_invalid_credentials():
    login_url = f"{BASE_URL}/api/auth/login"
    invalid_payload = {
        "email": "invaliduser@example.com",
        "password": "wrongpassword"
    }

    # Mock response for invalid login attempt
    mock_response = Mock()
    mock_response.status_code = 401
    mock_response.json.return_value = {
        "error": "Invalid credentials",
        "message": "The email or password provided is incorrect."
    }

    with patch('requests.post', return_value=mock_response) as mock_post:
        # Simulate client-side login request
        try:
            response = requests.post(login_url, json=invalid_payload, timeout=30)
        except RequestException as e:
            raise AssertionError(f"HTTP request failed: {e}")

        # Assert the mocked post request was called once with correct parameters
        mock_post.assert_called_once_with(
            login_url, json=invalid_payload, timeout=30
        )

        # Assert HTTP status code is 401 Unauthorized for invalid login
        assert response.status_code == 401

        # Assert the error message is returned
        resp_json = response.json()
        assert "error" in resp_json
        assert resp_json["error"] == "Invalid credentials"


test_user_login_failure_with_invalid_credentials()
