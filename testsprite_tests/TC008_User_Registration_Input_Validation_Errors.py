from playwright.sync_api import sync_playwright, Route, Request

def test_user_registration_input_validation_errors():
    base_url = "http://localhost:8080"
    
    def mock_api_response(route: Route, request: Request):
        # Always return a dummy 200 OK response with empty json for any API call
        route.fulfill(status=200, content_type="application/json", body='{}')

    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context()
        page = context.new_page()

        # Intercept all network requests and mock responses
        page.route("**/*", mock_api_response)

        # Navigate to the registration page
        page.goto(f"{base_url}/register")

        # Attempt to submit empty registration form to trigger validation errors
        submit_button_selector = "button[type=submit]"
        page.click(submit_button_selector)

        # Verify validation errors appear for required fields
        # Common registration fields: username, email, password, confirm password
        # Checking for visible validation error texts or error indicators

        # Check username validation error
        assert page.locator("text=Username is required").is_visible() or page.locator("[aria-invalid='true'][name='username']").is_visible()

        # Check email validation error
        assert page.locator("text=Email is required").is_visible() or page.locator("[aria-invalid='true'][name='email']").is_visible()

        # Check password validation error
        assert page.locator("text=Password is required").is_visible() or page.locator("[aria-invalid='true'][name='password']").is_visible()

        # Check confirm password validation error
        assert page.locator("text=Confirm password is required").is_visible() or page.locator("[aria-invalid='true'][name='confirmPassword']").is_visible()

        # Now fill invalid email and mismatched passwords to test other validation errors
        page.fill("input[name='username']", "testuser")
        page.fill("input[name='email']", "invalidemail")
        page.fill("input[name='password']", "password1")
        page.fill("input[name='confirmPassword']", "password2")
        page.click(submit_button_selector)

        # Email format validation error
        assert page.locator("text=Invalid email address").is_visible() or page.locator("[aria-invalid='true'][name='email']").is_visible()

        # Password mismatch validation error
        mismatch_error_text = page.locator("text=Passwords do not match")
        assert mismatch_error_text.is_visible()

        # Close context and browser
        context.close()
        browser.close()

test_user_registration_input_validation_errors()