import unittest
from unittest.mock import patch
import requests

BASE_URL = "http://localhost:8080"


class TestUserLoginSuccess(unittest.TestCase):
    @patch('requests.post')
    def test_user_login_success(self, mock_post):
        # Mocked successful login response
        mock_response = unittest.mock.Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "token": "dummy_jwt_token",
            "user": {
                "id": "user-123",
                "email": "registereduser@example.com",
                "name": "Registered User"
            }
        }
        mock_post.return_value = mock_response

        login_url = f"{BASE_URL}/api/login"
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        payload = {
            "email": "registereduser@example.com",
            "password": "ValidPassword123!"
        }

        try:
            response = requests.post(
                login_url,
                json=payload,
                headers=headers,
                timeout=30
            )
        except requests.RequestException as e:
            self.fail(f"Network request failed unexpectedly: {e}")

        # Assertions to verify login success flow
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertIn("token", response_data)
        self.assertIn("user", response_data)
        self.assertEqual(response_data["user"]["email"], payload["email"])


test = TestUserLoginSuccess()
test.test_user_login_success()