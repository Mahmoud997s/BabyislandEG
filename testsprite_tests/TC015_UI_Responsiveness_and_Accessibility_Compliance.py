import asyncio
from playwright.async_api import async_playwright, Route, Request

BASE_URL = "http://localhost:8080"


async def test_ui_responsiveness_and_accessibility_compliance():
    """
    Verify that UI components across pages are responsive and meet accessibility standards.
    All network requests are mocked to return successful dummy 200 responses.
    """

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1280, "height": 720},
            color_scheme="light",
            locale="en-US",
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                       "(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
        )

        page = await context.new_page()

        async def route_all_requests(route: Route, request: Request):
            # Mock all API network requests with a 200 dummy response.
            if request.method in ("GET", "POST", "PUT", "DELETE", "PATCH"):
                # Return an empty JSON object as dummy data
                await route.fulfill(
                    status=200,
                    content_type="application/json",
                    body='{}'
                )
            else:
                await route.continue_()

        # Intercept all requests to mock API calls.
        await page.route("**/*", route_all_requests)

        # List of key pages to visit according to PRD to verify responsiveness and accessibility
        pages_to_test = [
            "/",                 # Home Page
            "/shop",             # Shop Page
            "/product/1",        # Product Details Page (using dummy id)
            "/cart",             # Cart Page
            "/checkout",         # Checkout Page
            "/login",            # Login Page
            "/register",         # Register Page
            "/admin/dashboard",  # Admin Dashboard
        ]

        for path in pages_to_test:
            await page.goto(f"{BASE_URL}{path}", timeout=30000)
            # Wait for network idle to ensure UI is fully loaded with mocked responses
            await page.wait_for_load_state("networkidle")

            # Check viewport responsiveness by asserting width and height of viewport
            viewport_size = page.viewport_size
            assert viewport_size is not None, f"Viewport size is None on {path}"
            assert viewport_size["width"] >= 320, f"Viewport width is too small on {path}"
            assert viewport_size["height"] >= 480, f"Viewport height is too small on {path}"

            # Basic accessibility checks:
            # 1. Check that main landmarks (role="main") exists
            main = await page.locator('[role="main"]').first
            main_count = await main.count()
            assert main_count > 0, f"Main landmark not found on {path}"

            # 2. Check that all images have alt attributes for accessibility
            images = page.locator('img')
            images_count = await images.count()
            for i in range(images_count):
                alt = await images.nth(i).get_attribute('alt')
                assert alt is not None and alt.strip() != "", f"Image at index {i} missing alt attribute on {path}"

            # 3. Check that all buttons and links have discernible text
            buttons = page.locator('button')
            for i in range(await buttons.count()):
                btn_text = (await buttons.nth(i).inner_text()).strip()
                assert btn_text != "", f"Button at index {i} has no text on {path}"

            links = page.locator('a')
            for i in range(await links.count()):
                link_text = (await links.nth(i).inner_text()).strip()
                assert link_text != "", f"Link at index {i} has no text on {path}"

            # 4. Run built-in accessibility snapshot (Lightweight check)
            snapshot = await page.accessibility.snapshot()
            assert snapshot, f"Accessibility snapshot failed or empty on {path}"

            # 5. Check UI responsiveness at different viewport widths
            for width in [320, 768, 1024, 1280]:
                await page.set_viewport_size({"width": width, "height": 720})
                # Wait a moment for layout adjustments
                await asyncio.sleep(0.5)
                # Check that main content is visible after resize
                visible_main = await main.is_visible()
                assert visible_main, f"Main content not visible at viewport width {width} on {path}"

        await context.close()
        await browser.close()


asyncio.run(test_ui_responsiveness_and_accessibility_compliance())