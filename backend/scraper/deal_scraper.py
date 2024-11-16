import asyncio
import aiohttp
from bs4 import BeautifulSoup
from fake_useragent import UserAgent
from datetime import datetime
import json
import logging
from typing import List, Dict, Optional, Set
import anthropic
import os
from dotenv import load_dotenv
import re

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DealScraper:
    def __init__(self):
        self.ua = UserAgent()
        self.headers = {
            'User-Agent': self.ua.random,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        }
        self.client = anthropic.Client(api_key=os.getenv('ANTHROPIC_API_KEY'))
        self.categories = {
            'electronics': ['laptop', 'phone', 'tv', 'camera', 'headphone', 'tablet', 'console'],
            'fashion': ['clothing', 'shoes', 'accessories', 'watch', 'jewelry', 'handbag'],
            'home': ['furniture', 'appliance', 'kitchen', 'bedding', 'decor'],
            'beauty': ['makeup', 'skincare', 'fragrance', 'haircare'],
            'sports': ['fitness', 'outdoor', 'exercise', 'sports'],
            'toys': ['games', 'toys', 'kids'],
            'books': ['book', 'ebook', 'audiobook'],
            'auto': ['automotive', 'car', 'motorcycle'],
            'grocery': ['food', 'beverage', 'grocery'],
            'pet': ['pet', 'dog', 'cat']
        }

    async def extract_product_images(self, product_elem: BeautifulSoup, selectors: Dict, base_url: str) -> Dict[str, str]:
        """Extract all available product images including thumbnails and high-res versions."""
        images = {}
        try:
            # Check for data attributes containing image URLs
            data_attrs = [attr for attr in product_elem.attrs if 'data-' in attr and ('image' in attr.lower() or 'img' in attr.lower())]
            for attr in data_attrs:
                if product_elem[attr] and 'http' in product_elem[attr]:
                    images['data_attr'] = product_elem[attr]

            # Look for structured data (JSON-LD)
            json_ld = product_elem.find('script', type='application/ld+json')
            if json_ld:
                try:
                    data = json.loads(json_ld.string)
                    if 'image' in data:
                        images['structured'] = data['image']
                except:
                    pass

            # Check common image selectors
            img_selectors = [
                selectors.get('image', ''),  # Primary image selector
                '.product-image img',        # Common product image class
                '.main-image img',           # Main product image
                '.product-img-primary',      # Primary product image
                'img[itemprop="image"]',     # Schema.org image
                '.gallery-image',            # Image gallery
                '.product-hero-image img'    # Hero/main product image
            ]

            for selector in img_selectors:
                if selector:
                    img_elem = product_elem.select_one(selector)
                    if img_elem:
                        # Check srcset for responsive images
                        if img_elem.get('srcset'):
                            srcset = img_elem['srcset'].split(',')
                            # Get the highest resolution image
                            highest_res = max(
                                [(src.strip().split(' ')[0], int(src.strip().split(' ')[1].replace('w', ''))) 
                                 for src in srcset if src.strip().split(' ')[1].replace('w', '').isdigit()],
                                key=lambda x: x[1]
                            )[0]
                            images['high_res'] = self.normalize_url(highest_res, base_url)

                        # Check data-zoom or similar attributes for high-res versions
                        zoom_attrs = ['data-zoom', 'data-zoom-image', 'data-large', 'data-full']
                        for attr in zoom_attrs:
                            if img_elem.get(attr):
                                images['zoom'] = self.normalize_url(img_elem[attr], base_url)

                        # Get standard src as fallback
                        if img_elem.get('src'):
                            images['standard'] = self.normalize_url(img_elem['src'], base_url)

            # Clean and validate URLs
            valid_images = {}
            for key, url in images.items():
                if url and isinstance(url, str) and ('http://' in url or 'https://' in url):
                    # Remove tracking parameters
                    clean_url = re.sub(r'\?.*$', '', url)
                    # Ensure it's an image file
                    if any(ext in clean_url.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp', '.gif']):
                        valid_images[key] = clean_url

            # Select the best image
            if valid_images:
                # Prefer high resolution images
                if 'high_res' in valid_images:
                    return valid_images['high_res']
                elif 'zoom' in valid_images:
                    return valid_images['zoom']
                elif 'standard' in valid_images:
                    return valid_images['standard']
                else:
                    return next(iter(valid_images.values()))

        except Exception as e:
            logger.error(f"Error extracting product images: {str(e)}")

        return None

    async def parse_deals(self, html: str, url: str, retailer: str) -> List[Dict]:
        """Parse deals from HTML content using dynamic selectors."""
        deals = []
        try:
            selectors = await self.analyze_page_structure(html, url)
            if not selectors:
                return deals

            soup = BeautifulSoup(html, 'html.parser')
            
            for product in soup.select(selectors['product_container']):
                try:
                    # Extract basic deal information
                    title_elem = product.select_one(selectors['title'])
                    price_elem = product.select_one(selectors['current_price'])
                    original_price_elem = product.select_one(selectors['original_price'])
                    link_elem = product.select_one(selectors['product_link'])
                    desc_elem = product.select_one(selectors.get('description', ''))
                    
                    if not all([title_elem, price_elem, link_elem]):
                        continue

                    # Extract and validate prices
                    price = self.extract_price(price_elem.text)
                    original_price = self.extract_price(original_price_elem.text) if original_price_elem else price

                    if price and original_price and price < original_price:
                        # Extract product images
                        image_url = await self.extract_product_images(product, selectors, url)
                        
                        # Create basic deal object
                        deal = {
                            'title': title_elem.text.strip(),
                            'description': desc_elem.text.strip() if desc_elem else '',
                            'price': price,
                            'original_price': original_price,
                            'discount_percentage': round(((original_price - price) / original_price) * 100, 2),
                            'retailer': retailer,
                            'url': self.normalize_url(link_elem.get('href'), url),
                            'image_url': image_url,
                            'timestamp': datetime.now().isoformat()
                        }
                        
                        # Categorize the product
                        categorization = await self.categorize_product(
                            deal['title'], 
                            deal['description']
                        )
                        deal.update({
                            'category': categorization['primary_category'],
                            'category_confidence': categorization['confidence_scores'],
                            'tags': categorization['tags']
                        })
                        
                        # Validate the deal
                        deal = await self.validate_deal(deal)
                        if deal.get('is_valid', False):
                            deals.append(deal)
                            
                except Exception as e:
                    logger.error(f"Error parsing individual deal: {str(e)}")
                    continue

        except Exception as e:
            logger.error(f"Error parsing deals from {url}: {str(e)}")
        
        return deals

    # ... (rest of the class implementation remains the same)