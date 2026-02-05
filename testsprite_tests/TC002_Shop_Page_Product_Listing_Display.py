from playwright.sync_api import sync_playwright, Route, Request

def test_tc002_shop_page_product_listing_display():
    dummy_products = [
        {
            "id": "p1",
            "name": "Luxury Stroller Model A",
            "description": "Elegant and comfortable baby stroller with premium materials.",
            "price": "$1299.99",
            "image_url": "/images/stroller_a.jpg"
        },
        {
            "id": "p2",
            "name": "Luxury Stroller Model B",
            "description": "Stylish stroller with advanced suspension for smooth rides.",
            "price": "$1599.99",
            "image_url": "/images/stroller_b.jpg"
        },
        {
            "id": "p3",
            "name": "Luxury Stroller Model C",
            "description": "Compact and lightweight stroller designed for city use.",
            "price": "$999.99",
            "image_url": "/images/stroller_c.jpg"
        }
    ]

    def mock_api_route(route: Route, request: Request):
        # Mock the product listing API response with dummy products
        if "api/products" in request.url:
            route.fulfill(
                status=200,
                content_type="application/json",
                body=str.encode(str({"products": dummy_products}).replace("'", '"'))  # simple JSON stringify
            )
        else:
            # For all other requests, return 200 with empty or dummy success response
            route.fulfill(status=200, content_type="application/json", body=b'{}')

    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context()
        page = context.new_page()

        # Intercept all network requests and mock responses
        page.route("**/*", mock_api_route)

        # Navigate to the Shop Page URL
        page.goto("http://localhost:8080/shop", timeout=30000)

        # Verify the page loaded the product list container
        product_list_selector = "div[data-testid='product-list']"
        page.wait_for_selector(product_list_selector, timeout=30000)
        product_list = page.query_selector_all(f"{product_list_selector} > div.product-item")

        # Assert the count matches the dummy products count
        assert len(product_list) == len(dummy_products), f"Expected {len(dummy_products)} products, found {len(product_list)}"

        # Verify each product's displayed details match the dummy data
        for i, product in enumerate(dummy_products):
            product_item = product_list[i]

            name_elem = product_item.query_selector("h2.product-name")
            desc_elem = product_item.query_selector("p.product-description")
            price_elem = product_item.query_selector("span.product-price")
            img_elem = product_item.query_selector("img.product-image")

            assert name_elem and name_elem.inner_text().strip() == product["name"], f"Product name mismatch for product {i+1}"
            assert desc_elem and desc_elem.inner_text().strip() == product["description"], f"Product description mismatch for product {i+1}"
            assert price_elem and price_elem.inner_text().strip() == product["price"], f"Product price mismatch for product {i+1}"
            assert img_elem and img_elem.get_attribute("src") == product["image_url"], f"Product image URL mismatch for product {i+1}"

        # Close context and browser
        context.close()
        browser.close()

test_tc002_shop_page_product_listing_display()