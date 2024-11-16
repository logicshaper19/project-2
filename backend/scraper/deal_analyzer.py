import pandas as pd
from typing import List, Dict
import logging
from datetime import datetime
import anthropic
import os
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DealAnalyzer:
    def __init__(self, min_discount: float = 20.0):
        self.min_discount = min_discount
        self.df = None
        self.client = anthropic.Client(api_key=os.getenv('ANTHROPIC_API_KEY'))

    async def analyze_deal_quality(self, deal: Dict) -> Dict:
        """Use Claude to analyze the quality and legitimacy of a deal."""
        try:
            message = await self.client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=1000,
                temperature=0,
                messages=[{
                    "role": "user",
                    "content": f"""Analyze this Black Friday deal and provide insights:
                    Product: {deal['title']}
                    Original Price: ${deal['original_price']}
                    Sale Price: ${deal['price']}
                    Retailer: {deal['retailer']}
                    
                    Please evaluate:
                    1. Is this a genuine deal or potentially misleading?
                    2. How does this price compare to typical market prices?
                    3. What's the value proposition for consumers?
                    4. Any red flags or concerns?
                    
                    Provide a brief analysis and a deal quality score (0-100)."""
                }]
            )
            
            analysis = message.content[0].text
            
            # Extract score from analysis
            try:
                score = int([line for line in analysis.split('\n') if 'score' in line.lower()][0].split(':')[1].strip())
            except:
                score = 50  # Default score if parsing fails
                
            deal['quality_score'] = score
            deal['ai_analysis'] = analysis
            
            return deal
            
        except Exception as e:
            logger.error(f"Error analyzing deal with Claude: {str(e)}")
            deal['quality_score'] = 0
            deal['ai_analysis'] = "Analysis failed"
            return deal

    async def validate_deals(self, deals: List[Dict]) -> List[Dict]:
        """Validate and enrich deals using Claude."""
        validated_deals = []
        for deal in deals:
            enriched_deal = await self.analyze_deal_quality(deal)
            if enriched_deal['quality_score'] >= 60:  # Only include deals with good quality scores
                validated_deals.append(enriched_deal)
        return validated_deals

    def load_deals(self, deals: List[Dict]):
        """Load deals into a pandas DataFrame."""
        self.df = pd.DataFrame(deals)
        self.df['timestamp'] = pd.to_datetime(self.df['timestamp'])
        logger.info(f"Loaded {len(self.df)} deals for analysis")

    def get_recommendations(self, user_preferences: Dict) -> pd.DataFrame:
        """Get personalized deal recommendations based on user preferences."""
        if self.df is None:
            return pd.DataFrame()

        filtered_deals = self.df.copy()

        # Apply quality score filter
        filtered_deals = filtered_deals[filtered_deals['quality_score'] >= 70]

        # Apply price range filter
        if 'max_price' in user_preferences:
            filtered_deals = filtered_deals[filtered_deals['price'] <= user_preferences['max_price']]

        # Apply category filter
        if 'categories' in user_preferences:
            category_mask = filtered_deals['title'].str.contains('|'.join(user_preferences['categories']), case=False)
            filtered_deals = filtered_deals[category_mask]

        # Apply minimum discount filter
        if 'min_discount' in user_preferences:
            filtered_deals = filtered_deals[filtered_deals['discount_percentage'] >= user_preferences['min_discount']]

        return filtered_deals.sort_values(['quality_score', 'discount_percentage'], ascending=[False, False])

    def generate_report(self) -> Dict:
        """Generate a summary report of deals."""
        if self.df is None:
            return {}

        return {
            'total_deals': len(self.df),
            'avg_discount': self.df['discount_percentage'].mean(),
            'max_discount': self.df['discount_percentage'].max(),
            'avg_quality_score': self.df['quality_score'].mean(),
            'retailers': self.df['retailer'].value_counts().to_dict(),
            'price_ranges': {
                'min': self.df['price'].min(),
                'max': self.df['price'].max(),
                'avg': self.df['price'].mean()
            },
            'quality_distribution': {
                'excellent': len(self.df[self.df['quality_score'] >= 90]),
                'good': len(self.df[(self.df['quality_score'] >= 70) & (self.df['quality_score'] < 90)]),
                'fair': len(self.df[(self.df['quality_score'] >= 50) & (self.df['quality_score'] < 70)]),
                'poor': len(self.df[self.df['quality_score'] < 50])
            },
            'timestamp': datetime.now().isoformat()
        }