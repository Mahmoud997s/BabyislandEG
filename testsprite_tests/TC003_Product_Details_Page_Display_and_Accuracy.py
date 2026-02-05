from playwright.sync_api import sync_playwright, Route, Request

def test_product_details_page_display_and_accuracy():
    dummy_product_response = {
        "id": "stroller123",
        "name": "Luxury Baby Stroller",
        "description": "A premium stroller with superior comfort and safety features.",
        "price": 999.99,
        "currency": "USD",
        "images": [
            "https://example.com/images/stroller123-front.jpg",
            "https://example.com/images/stroller123-side.jpg"
        ],
        "specifications": {
            "weight": "15kg",
            "max_load": "22kg",
            "foldable": True,
            "material": "Aluminum frame",
            "wheels": "All-terrain rubber"
        }
    }

    base_url = "http://localhost:8080"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()

        # Intercept product detail API call and mock response
        def handle_route(route: Route, request: Request):
            if "/api/products/" in request.url:
                route.fulfill(
                    status=200,
                    content_type="application/json",
                    body=str(dummy_product_response).replace("'", '"'),
                )
            else:
                route.continue_()

        page = context.new_page()
        page.route("**/api/products/*", handle_route)

        # Navigate to product details page for the dummy product
        product_id = dummy_product_response["id"]
        page.goto(f"{base_url}/product/{product_id}", wait_until="networkidle")

        # UI assertions for product name
        product_name_selector = "h1[data-testid='product-name']"
        assert page.is_visible(product_name_selector)
        assert page.inner_text(product_name_selector) == dummy_product_response["name"]

        # UI assertions for product images
        images_selector = "div[data-testid='product-images'] img"
        images = page.query_selector_all(images_selector)
        assert len(images) == len(dummy_product_response["images"])
        for i, img_element in enumerate(images):
            src = img_element.get_attribute("src")
            assert src == dummy_product_response["images"][i]

        # UI assertions for price display
        price_selector = "span[data-testid='product-price']"
        assert page.is_visible(price_selector)
        expected_price_text = f"${dummy_product_response['price']:.2f}"
        assert page.inner_text(price_selector) == expected_price_text

        # UI assertions for specifications
        specs = dummy_product_response["specifications"]
        for spec_key, spec_value in specs.items():
            # Assuming each spec is rendered in an element with data-testid="spec-{spec_key}"
            spec_selector = f"li[data-testid='spec-{spec_key}']"
            assert page.is_visible(spec_selector)
            # Convert value to string representation if bool
            displayed_spec = page.inner_text(spec_selector)
            expected_spec = str(spec_value) if not isinstance(spec_value, bool) else ("Yes" if spec_value else "No")
            assert expected_spec in displayed_spec or displayed_spec in expected_spec

        browser.close()

test_product_details_page_display_and_accuracy()