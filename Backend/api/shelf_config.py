"""
Shelf Configuration for Pentavision
Define actual shelf capacities and thresholds for your supermarket
"""

# ACTUAL SHELF CAPACITIES (adjust these based on your real shelves)
SHELF_CAPACITIES = {
    # Product: (full_capacity, warning_threshold, critical_threshold)
    "banana": {
        "full_capacity": 33,  # Your actual full shelf capacity
        "warning_threshold": 20,  # Below this = warning
        "critical_threshold": 10   # Below this = critical
    },
    "apple": {
        "full_capacity": 25,
        "warning_threshold": 15,
        "critical_threshold": 8
    },
    "orange": {
        "full_capacity": 20,
        "warning_threshold": 12,
        "critical_threshold": 6
    },
    "milk": {
        "full_capacity": 12,
        "warning_threshold": 8,
        "critical_threshold": 4
    },
    "bread": {
        "full_capacity": 8,
        "warning_threshold": 5,
        "critical_threshold": 2
    },
    "default": {
        "full_capacity": 15,
        "warning_threshold": 10,
        "critical_threshold": 5
    }
}

# STOCK LEVEL THRESHOLDS
STOCK_THRESHOLDS = {
    "full": 80,      # Above 80% = full
    "adequate": 60,   # 60-80% = adequate
    "moderate": 40,   # 40-60% = moderate
    "low": 20,        # 20-40% = low
    "critical": 20    # Below 20% = critical
}

# CALIBRATION FACTORS (adjust if needed)
CALIBRATION_FACTORS = {
    "banana": 1.0,    # 1.0 = no adjustment, 1.2 = 20% higher, 0.8 = 20% lower
    "apple": 1.0,
    "orange": 1.0,
    "milk": 1.0,
    "bread": 1.0,
    "default": 1.0
}

def get_shelf_config(product_name):
    """Get configuration for a specific product"""
    product_lower = product_name.lower()
    return SHELF_CAPACITIES.get(product_lower, SHELF_CAPACITIES["default"])

def calculate_stock_percentage(detection_count, product_name):
    """Calculate stock percentage using actual shelf capacity"""
    config = get_shelf_config(product_name)
    full_capacity = config["full_capacity"]
    
    # Apply calibration factor
    calibration = CALIBRATION_FACTORS.get(product_name.lower(), 1.0)
    adjusted_capacity = full_capacity * calibration
    
    # Calculate percentage
    stock_percent = min(100.0, (detection_count / adjusted_capacity) * 100)
    return round(stock_percent, 1)

def get_stock_status(stock_percent, product_name):
    """Get stock status based on thresholds"""
    config = get_shelf_config(product_name)
    
    if stock_percent >= config["full_capacity"] * 0.8:
        return "full"
    elif stock_percent >= config["adequate"]:
        return "adequate"
    elif stock_percent >= config["moderate"]:
        return "moderate"
    elif stock_percent >= config["low"]:
        return "low"
    else:
        return "critical"

def get_recommendation(stock_percent, product_name):
    """Get recommendation based on stock level"""
    status = get_stock_status(stock_percent, product_name)
    
    recommendations = {
        "full": "Stock level is adequate",
        "adequate": "Monitor stock levels",
        "moderate": "Consider restocking soon",
        "low": "Restocking needed",
        "critical": "Immediate restocking required"
    }
    
    return recommendations.get(status, "Check stock levels")

# Example usage:
if __name__ == "__main__":
    # Test with your banana case
    detection_count = 11
    product = "banana"
    
    stock_percent = calculate_stock_percentage(detection_count, product)
    status = get_stock_status(stock_percent, product)
    recommendation = get_recommendation(stock_percent, product)
    
    print(f"Product: {product}")
    print(f"Detected: {detection_count}")
    print(f"Full Capacity: {get_shelf_config(product)['full_capacity']}")
    print(f"Stock Percentage: {stock_percent}%")
    print(f"Status: {status}")
    print(f"Recommendation: {recommendation}")
