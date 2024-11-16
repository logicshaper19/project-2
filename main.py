import asyncio
import json
from scraper.deal_scraper import DealScraper
from scraper.deal_analyzer import DealAnalyzer
import logging
from datetime import datetime
import signal
import sys

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BlackFridayAgent:
    def __init__(self):
        self.scraper = DealScraper()
        self.analyzer = DealAnalyzer()
        self.user_preferences = {
            'max_price': float('inf'),
            'min_discount': 20.0,
            'categories': set()
        }

    async def update_deals(self):
        """Scrape and update deals."""
        logger.info("Scraping deals...")
        deals = await self.scraper.scrape_deals()
        self.scraper.save_deals(deals)
        self.analyzer.load_deals(deals)
        logger.info(f"Found {len(deals)} deals")
        return deals

    def set_preferences(self):
        """Set user preferences interactively."""
        try:
            price = float(input("Enter maximum price (0 for no limit): "))
            self.user_preferences['max_price'] = price if price > 0 else float('inf')
            
            discount = float(input("Enter minimum discount percentage: "))
            self.user_preferences['min_discount'] = max(0, min(100, discount))
            
            categories = input("Enter categories (comma-separated): ").split(',')
            self.user_preferences['categories'] = {cat.strip() for cat in categories if cat.strip()}
            
        except ValueError:
            logger.error("Invalid input. Using default preferences.")

    def display_deals(self):
        """Display deals based on user preferences."""
        recommendations = self.analyzer.get_recommendations(self.user_preferences)
        
        if recommendations.empty:
            print("\nNo deals found matching your criteria.")
            return
            
        print("\n=== Recommended Deals ===")
        for _, deal in recommendations.iterrows():
            print(f"\nProduct: {deal['title']}")
            print(f"Retailer: {deal['retailer']}")
            print(f"Price: ${deal['price']:.2f} (was ${deal['original_price']:.2f})")
            print(f"Discount: {deal['discount_percentage']:.1f}%")
            print(f"URL: {deal['url']}")
            print("-" * 50)

    def generate_report(self):
        """Generate and display analysis report."""
        report = self.analyzer.generate_report()
        print("\n=== Deal Analysis Report ===")
        print(f"Total Deals Found: {report['total_deals']}")
        print(f"Average Discount: {report['avg_discount']:.1f}%")
        print(f"Maximum Discount: {report['max_discount']:.1f}%")
        print("\nRetailers:")
        for retailer, count in report['retailers'].items():
            print(f"- {retailer}: {count} deals")
        print("\nPrice Ranges:")
        print(f"Min: ${report['price_ranges']['min']:.2f}")
        print(f"Max: ${report['price_ranges']['max']:.2f}")
        print(f"Avg: ${report['price_ranges']['avg']:.2f}")

def signal_handler(sig, frame):
    print("\nGracefully shutting down...")
    sys.exit(0)

async def main():
    signal.signal(signal.SIGINT, signal_handler)
    agent = BlackFridayAgent()
    
    while True:
        print("\n=== Black Friday Deal Finder ===")
        print("1. Update deals")
        print("2. Set preferences")
        print("3. View deals")
        print("4. Generate report")
        print("5. Exit")
        
        choice = input("\nEnter your choice (1-5): ")
        
        if choice == '1':
            await agent.update_deals()
        elif choice == '2':
            agent.set_preferences()
        elif choice == '3':
            agent.display_deals()
        elif choice == '4':
            agent.generate_report()
        elif choice == '5':
            print("Thank you for using Black Friday Deal Finder!")
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    asyncio.run(main())