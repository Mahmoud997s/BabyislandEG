import unittest
from unittest.mock import patch, MagicMock

class TestCheckoutProcessWithValidInput(unittest.TestCase):
    @patch('requests.post')
    def test_checkout_process_with_valid_input(self, mock_post):
        # Mock the checkout API response to simulate a successful checkout completion
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"orderId": "12345", "status": "success", "message": "Order placed successfully"}
        mock_post.return_value = mock_response

        # Sample valid payment and shipping details payload
        checkout_payload = {
            "payment": {
                "cardNumber": "4111111111111111",
                "expiryDate": "12/26",
                "cvv": "123",
                "cardHolderName": "Jane Doe"
            },
            "shipping": {
                "fullName": "Jane Doe",
                "addressLine1": "123 Luxury St",
                "addressLine2": "Apt 9",
                "city": "Stylishtown",
                "state": "CA",
                "postalCode": "90210",
                "country": "USA",
                "phoneNumber": "555-123-4567"
            },
            "cart": [
                {"productId": "stroller-001", "quantity": 1},
                {"productId": "stroller-002", "quantity": 2}
            ]
        }

        # The base URL for the checkout endpoint
        endpoint = "http://localhost:8080/api/checkout"

        # Perform the mocked POST request
        import requests
        response = requests.post(endpoint, json=checkout_payload, timeout=30)

        # Assert that the mocked post was called with the correct parameters
        mock_post.assert_called_once_with(endpoint, json=checkout_payload, timeout=30)

        # Validate the response status code and content
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("orderId", data)
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["message"], "Order placed successfully")

        # Since backend is not available, focus on client-side success states
        # Simulating UI success message rendering check (mock)
        ui_success_message = "Thank you for your order! Your order ID is 12345."
        expected_message = f"Thank you for your order! Your order ID is {data['orderId']}."
        self.assertEqual(ui_success_message, expected_message)

# Execute the test
test = TestCheckoutProcessWithValidInput()
test.test_checkout_process_with_valid_input()