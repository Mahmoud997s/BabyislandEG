from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:8080"


def test_admin_dashboard_access_and_product_management():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Mock all network requests to return successful dummy responses
        def route_handler(route, request):
            # Return a generic 200 OK response with dummy JSON for any request
            response_payload = {
                "status": "success",
                "data": {}
            }
            route.fulfill(
                status=200,
                content_type="application/json",
                body=str(response_payload).replace("'", '"')
            )

        page.route("**/*", route_handler)

        # Navigate to Admin Dashboard
        page.goto(f"{BASE_URL}/admin/dashboard")

        # Verify Admin Dashboard main UI elements render
        # Check presence of heading or key element indicating Admin Dashboard loaded
        assert page.locator("text=Admin Dashboard").is_visible()

        # Verify presence of Add Product UI components
        assert page.locator("button:has-text('Add Product')").is_visible()

        # Simulate adding a product
        page.click("button:has-text('Add Product')")
        # Fill in product form fields (simulate inputs)
        page.fill("input[name='productName']", "Test Stroller")
        page.fill("textarea[name='productDescription']", "A luxury test stroller")
        page.fill("input[name='productPrice']", "299.99")
        page.click("button:has-text('Save')")

        # After saving, verify UI shows success notification or updates product list
        assert page.locator("text=Product added successfully").is_visible() or page.locator("text=Test Stroller").is_visible()

        # Simulate updating the product
        # Find product item and click edit
        page.click("button:has-text('Edit')", timeout=5000)  # Assuming edit button for the first product
        page.fill("input[name='productPrice']", "279.99")  # Change price
        page.click("button:has-text('Save')")

        # Verify UI reflects updated product price or success message
        assert page.locator("text=Product updated successfully").is_visible() or page.locator("text=279.99").is_visible()

        # Simulate deleting the product
        page.click("button:has-text('Delete')", timeout=5000)  # Assuming delete button for the first product
        # Confirm deletion if prompt exists (simulate confirm dialog)
        page.on("dialog", lambda dialog: dialog.accept())

        # Verify UI shows success message or product removed from list
        assert page.locator("text=Product deleted successfully").is_visible() or page.locator("text=Test Stroller").count() == 0

        # Close browser context
        context.close()
        browser.close()


test_admin_dashboard_access_and_product_management()
