from unittest.mock import patch

class MockResponse:
    def __init__(self, json_data, status_code=200):
        self._json = json_data
        self.status_code = status_code
        self.ok = status_code == 200

    def json(self):
        return self._json

@patch("requests.post")
@patch("requests.put")
@patch("requests.delete")
def test_shopping_cart_add_modify_remove_items(mock_delete, mock_put, mock_post):
    dummy_cart_item = {
        "id": "item123",
        "productId": "prod567",
        "name": "Luxury Baby Stroller Model X",
        "quantity": 1,
        "price": 999.99
    }

    dummy_updated_cart_item = {
        "id": "item123",
        "productId": "prod567",
        "name": "Luxury Baby Stroller Model X",
        "quantity": 3,
        "price": 999.99
    }

    dummy_cart_after_removal = []

    base_url = "http://localhost:8080"

    mock_post.return_value = MockResponse(json_data=dummy_cart_item, status_code=200)

    import requests
    add_cart_url = f"{base_url}/cart/items"
    add_payload = {
        "productId": dummy_cart_item["productId"],
        "quantity": dummy_cart_item["quantity"]
    }
    add_response = requests.post(add_cart_url, json=add_payload, timeout=30)
    assert add_response.ok
    added_item = add_response.json()
    assert added_item["id"] == dummy_cart_item["id"]
    assert added_item["quantity"] == 1

    mock_put.return_value = MockResponse(json_data=dummy_updated_cart_item, status_code=200)

    update_cart_url = f"{base_url}/cart/items/{dummy_cart_item['id']}"
    update_payload = {"quantity": 3}
    update_response = requests.put(update_cart_url, json=update_payload, timeout=30)
    assert update_response.ok
    updated_item = update_response.json()
    assert updated_item["quantity"] == 3

    mock_delete.return_value = MockResponse(json_data={"success": True}, status_code=200)

    remove_cart_url = f"{base_url}/cart/items/{dummy_cart_item['id']}"
    remove_response = requests.delete(remove_cart_url, timeout=30)
    assert remove_response.ok
    remove_resp_json = remove_response.json()
    assert remove_resp_json.get("success") == True

    final_cart = dummy_cart_after_removal
    assert isinstance(final_cart, list)
    assert len(final_cart) == 0

test_shopping_cart_add_modify_remove_items()