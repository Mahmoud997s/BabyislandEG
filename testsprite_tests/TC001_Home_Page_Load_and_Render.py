from playwright.sync_api import sync_playwright, Route, Request

def test_TC001_home_page_load_and_render():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Mock any network requests to respond with 200 and dummy data
        def handle_route(route: Route, request: Request):
            # Return a generic successful JSON response for all API calls
            route.fulfill(status=200, content_type="application/json", body='{"success":true}')
        
        page.route("**/*", handle_route)

        # Navigate to the Home Page URL (local frontend URL)
        page.goto("http://localhost:8080", timeout=30000)

        # Check key components existence by selectors typical for a React+ShadcnUI+Tailwind app
        # These selectors may vary depending on the actual component structure,
        # here we assume typical semantic or aria-label and text-based selectors

        # Confirm page loaded the main header with site title or welcome text
        header = page.locator("header, [role='banner']")
        assert header.is_visible(), "Header/banner should be visible"

        # Check if main headline or welcome text is rendered
        main_heading = page.locator("text=Welcome to Stroller Chic")
        assert main_heading.count() > 0 and main_heading.is_visible(), "Main welcome heading should be visible"

        # Check for primary call-to-action button (e.g., Shop Now)
        cta_button = page.locator("role=button[name='Shop Now'], text=Shop Now")
        assert cta_button.count() > 0 and cta_button.is_visible(), "Shop Now button should be visible"

        # Check for presence of navigation menu
        navbar = page.locator("nav, [role='navigation']")
        assert navbar.is_visible(), "Navigation bar/menu should be visible"

        # Check for footer presence
        footer = page.locator("footer, [role='contentinfo']")
        assert footer.is_visible(), "Footer should be visible"

        # Additional key visual components: hero image or banner
        hero_img = page.locator("img[alt*='stroller'], .hero-image")
        assert hero_img.count() > 0 and hero_img.is_visible(), "Hero image or banner should be visible"

        # Check for featured products container (an example UI section)
        featured_section = page.locator("section:has-text('Featured Products')")
        assert featured_section.count() > 0 and featured_section.is_visible(), "Featured Products section should be visible"

        browser.close()

test_TC001_home_page_load_and_render()