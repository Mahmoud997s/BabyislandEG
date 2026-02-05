from playwright.sync_api import sync_playwright, Page, Route, Request

BASE_URL = "http://localhost:8080"


def test_checkout_process_with_invalid_input_handling():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Mock all API requests to return dummy successful 200 responses with empty data or success confirmation
        def handle_route(route: Route, request: Request):
            # Return an empty JSON or minimal success response to all API calls
            route.fulfill(
                status=200,
                content_type="application/json",
                body='{}'
            )

        # Intercept all requests (including those that the Checkout page might attempt)
        page.route("**/*", handle_route)

        # Go to the Checkout page
        page.goto(f"{BASE_URL}/checkout", timeout=30000)

        # The test verifies client-side validation so no backend validation needed and backend calls mocked.

        # Prepare invalid inputs for shipping and payment (empty fields or invalid formats)
        # Attempt to submit with empty form
        submit_button_selector = "button[type='submit'], button:has-text('Place Order'), button:has-text('Checkout')"
        submit_button = page.locator(submit_button_selector)

        # Verify the submit button is visible before interaction
        assert submit_button.is_visible()

        # Click submit without filling form
        submit_button.click()

        # Expect validation error messages to appear for required shipping and payment fields
        # We try to detect validation UI text that typically appears such as 'required', 'invalid', etc.

        # Collect common expected validation error messages
        expected_errors = [
            "required",
            "Please enter",
            "Invalid",
            "field is required",
            "cannot be empty",
            "is invalid",
        ]

        # Check that the page shows visible error messages that contain any expected error substring
        errors_found = 0
        # Find all visible text elements that could be validation messages
        # Common selectors for validation messages could be aria-live regions, span with error class, etc.
        error_locators = page.locator("text=/required|please enter|invalid/i")

        count_errors = error_locators.count()

        for i in range(count_errors):
            text = error_locators.nth(i).inner_text().lower()
            if any(err.lower() in text for err in expected_errors):
                errors_found += 1

        # Assert at least one validation error is shown after submitting invalid form
        assert errors_found > 0

        # Now fill partially invalid data and check validation messages update accordingly
        # For example, fill shipping name but leave address empty, fill payment card number with invalid number

        # Example input selectors (assuming common form labels or placeholders)
        page.fill("input[name='shippingName'], input[placeholder*='Name']", "John Doe")
        page.fill("input[name='shippingAddress'], input[placeholder*='Address']", "")
        page.fill("input[name='paymentCardNumber'], input[placeholder*='Card Number']", "1234")

        # Click submit again
        submit_button.click()

        # Check validation message for incomplete address and invalid card number appear
        error_locators2 = page.locator("text=/required|please enter|invalid/i")
        count_errors2 = error_locators2.count()
        errors_found2 = 0
        for i in range(count_errors2):
            text = error_locators2.nth(i).inner_text().lower()
            if any(err.lower() in text for err in expected_errors):
                errors_found2 += 1

        assert errors_found2 > 0

        # Also verify no network error or navigation due to backend (since backend is mocked)
        # Just confirm we remain on the checkout page after invalid submits
        assert page.url == f"{BASE_URL}/checkout"

        browser.close()


test_checkout_process_with_invalid_input_handling()
