import requests

def run_logic_audit():
    print("🧪 STARTING FULL PROJECT LOGIC AUDIT...")
    try:
        # 1. Test API Connectivity
        response = requests.get("http://localhost:8000/products")
        products = response.json()
        
        results = {"passed": 0, "failed": 0, "errors": []}

        for p in products:
            # TEST: Lead Time Safety
            # If Runway is less than Lead Time, Priority MUST be CRITICAL
            if p['ai_runway'] <= p.get('lead_time_days', 3) and "CRITICAL" not in p['ai_priority']:
                results['failed'] += 1
                results['errors'].append(f"❌ {p['name']}: Priority should be CRITICAL (Runway {p['ai_runway']} <= Lead Time {p['lead_time_days']})")
                continue

            # TEST: Math Consistency
            # Stock Gap should never be negative
            if p.get('stock_gap', 0) < 0:
                results['failed'] += 1
                results['errors'].append(f"❌ {p['name']}: Negative stock gap detected!")
                continue

            results['passed'] += 1

        print(f"\n✅ PASSED: {results['passed']} | ❌ FAILED: {results['failed']}")
        for err in results['errors']: print(err)

    except Exception as e:
        print(f"🛑 CRITICAL: Backend not reachable. Ensure uvicorn is running. {e}")
def check_diverse_accuracy(products):
    for p in products:
        # Check 1: No impossible runways
        if p['stock_level'] > 0 and p['ai_runway'] == 0:
            print(f"❌ Accuracy Error: {p['name']} has stock but 0 runway.")
            
        # Check 2: Stock Gap accuracy
        expected_gap = max(0, p['target_stock'] - p['stock_level'])
        if p['stock_gap'] != expected_gap:
            print(f"❌ Math Error: {p['name']} stock gap is inconsistent.")

    print("⭐ Diverse Accuracy Check Completed.")

def test_supplier_accuracy(products):
    for p in products:
        # Check if Runway is less than Lead Time
        if p['ai_runway'] < p['lead_time_days']:
            if p['ai_priority'] != "CRITICAL (DELAY)":
                print(f"❌ ACCURACY FAIL: {p['name']} should be CRITICAL (DELAY)")
            else:
                print(f"✅ ACCURACY PASS: {p['name']} correctly flagged for delay")

if __name__ == "__main__":
    try:
        # Fetch the live data
        response = requests.get("http://localhost:8000/products")
        all_products = response.json()
        
        print(f"📊 Auditing {len(all_products)} products for accuracy...")
        print("-" * 30)

        # Run Test 1: Supplier Accuracy (Lead Time vs Runway)
        test_supplier_accuracy(all_products)
        
        # Run Test 2: Diverse Math Check
        check_diverse_accuracy(all_products)

    except Exception as e:
        print(f"🛑 Error connecting to project for audit: {e}")