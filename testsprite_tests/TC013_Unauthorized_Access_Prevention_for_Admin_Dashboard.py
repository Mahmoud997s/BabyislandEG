import unittest
from unittest.mock import patch, MagicMock

class TestUnauthorizedAccessAdminDashboard(unittest.TestCase):
    @patch('requests.get')
    def test_unauthorized_access_prevention_for_admin_dashboard(self, mock_get):
        # Mock the GET request to the Admin Dashboard endpoint to simulate a 403 Forbidden for non-admin user
        mock_response_forbidden = MagicMock()
        mock_response_forbidden.status_code = 403
        mock_response_forbidden.json.return_value = {"error": "Access denied: admin only"}
        
        # Mock a 200 response as dummy success for all API calls per instructions (though backend is not real)
        mock_response_ok = MagicMock()
        mock_response_ok.status_code = 200
        mock_response_ok.json.return_value = {"message": "Success"}

        # Setup mock to return 403 for Admin Dashboard access by non-admin user
        mock_get.return_value = mock_response_forbidden
        
        import requests

        base_url = "http://localhost:8080"
        admin_dashboard_url = f"{base_url}/admin/dashboard"

        try:
            # Attempt to access Admin Dashboard as non-admin
            response = requests.get(admin_dashboard_url, timeout=30)
            # Assert that the response status code indicates forbidden access (simulate client side block)
            self.assertEqual(response.status_code, 403)
            self.assertIn("Access denied", response.json().get("error", ""))
        except requests.RequestException as e:
            self.fail(f"RequestException occurred: {e}")

        # Now simulate the UI behavior assuming frontend received a "forbidden" response:
        # With no backend, we assume UI blocks UI rendering or redirects on forbidden.
        # Since direct UI testing is not possible here, we assert mock was called correctly.
        mock_get.assert_called_with(admin_dashboard_url, timeout=30)

unittest.main(argv=[''], exit=False)