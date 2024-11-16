import { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Bell, Heart, MapPin, Search, Settings, Tag, Zap, 
  Percent, Clock, ArrowDown, Filter
} from 'lucide-react';

// Sample deals data (replace with API call)
const sampleDeals = [
  {
    id: 1,
    product: "4K Smart TV",
    originalPrice: 999.99,
    discountPrice: 599.99,
    store: "TechMart",
    image: "https://placehold.co/300x200",
    category: "electronics",
    savings: 400,
    discountPercentage: 40,
    location: "New York",
    rating: 4.5,
    inStock: true
  },
  // ... (more sample deals)
];

const categories = [
  { id: 'electronics', name: 'Electronics', icon: Zap },
  { id: 'fashion', name: 'Fashion', icon: Tag },
  { id: 'home', name: 'Home & Living', icon: Tag },
  { id: 'beauty', name: 'Beauty', icon: Tag },
  { id: 'sports', name: 'Sports & Outdoors', icon: Tag },
  { id: 'toys', name: 'Toys & Games', icon: Tag },
  { id: 'books', name: 'Books & Media', icon: Tag },
  { id: 'auto', name: 'Automotive', icon: Tag },
  { id: 'pets', name: 'Pet Supplies', icon: Tag }
];

function DealCard({ deal, onSave }) {
  const [isSaved, setIsSaved] = useState(false);
  
  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave(deal);
  };

  return (
    <Card className="overflow-hidden h-full">
      <div className="relative">
        <img 
          src={deal.image} 
          alt={deal.product} 
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="bg-white/90 hover:bg-white"
            onClick={handleSave}
          >
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold line-clamp-2">{deal.product}</h3>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{deal.store}</span>
          </div>
        </div>
        <div className="flex justify-between items-end mt-4">
          <div>
            <p className="text-lg font-bold">${deal.discountPrice.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground line-through">
              ${deal.originalPrice.toFixed(2)}
            </p>
          </div>
          <div className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
            Save {deal.discountPercentage}%
          </div>
        </div>
        <Button className="w-full mt-4" onClick={() => window.open(deal.url, '_blank')}>
          View Deal
        </Button>
      </CardContent>
    </Card>
  );
}

function FilterSection({ onFilterChange }) {
  return (
    <div className="flex items-center space-x-4 mb-6">
      <Button variant="outline" className="flex items-center">
        <Filter className="h-4 w-4 mr-2" />
        Price Range
      </Button>
      <Button variant="outline" className="flex items-center">
        <Percent className="h-4 w-4 mr-2" />
        Discount
      </Button>
      <Button variant="outline" className="flex items-center">
        <Clock className="h-4 w-4 mr-2" />
        Latest Deals
      </Button>
      <Button variant="outline" className="flex items-center">
        <ArrowDown className="h-4 w-4 mr-2" />
        Sort By
      </Button>
    </div>
  );
}

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [deals, setDeals] = useState(sampleDeals);
  const [savedDeals, setSavedDeals] = useState([]);

  const handleSaveDeal = (deal) => {
    setSavedDeals(prev => {
      const exists = prev.find(d => d.id === deal.id);
      if (exists) {
        return prev.filter(d => d.id !== deal.id);
      }
      return [...prev, deal];
    });
  };

  const filteredDeals = deals.filter(deal => 
    (activeCategory === 'all' || deal.category === activeCategory) &&
    (searchQuery === '' || deal.product.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Your Personalized Deals</h1>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search for products, stores, or brands"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Change Location
            </Button>
          </div>
          <FilterSection />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Featured Deals */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Trending in Your Region</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredDeals.slice(0, 4).map(deal => (
              <DealCard key={deal.id} deal={deal} onSave={handleSaveDeal} />
            ))}
          </div>
        </section>

        {/* Deals by Category */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Browse by Category</h2>
          <Tabs 
            defaultValue="all" 
            value={activeCategory}
            onValueChange={setActiveCategory}
            className="w-full"
          >
            <TabsList className="mb-6 flex flex-wrap gap-2">
              <TabsTrigger value="all">All Deals</TabsTrigger>
              {categories.map(category => (
                <TabsTrigger key={category.id} value={category.id}>
                  <category.icon className="h-4 w-4 mr-2" />
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredDeals.map(deal => (
                  <DealCard key={deal.id} deal={deal} onSave={handleSaveDeal} />
                ))}
              </div>
            </TabsContent>

            {categories.map(category => (
              <TabsContent key={category.id} value={category.id}>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredDeals
                    .filter(deal => deal.category === category.id)
                    .map(deal => (
                      <DealCard key={deal.id} deal={deal} onSave={handleSaveDeal} />
                    ))
                  }
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* Localized Deals */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Local Deals for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredDeals
              .filter(deal => deal.location === "New York")
              .slice(0, 4)
              .map(deal => (
                <DealCard key={deal.id} deal={deal} onSave={handleSaveDeal} />
              ))
            }
          </div>
        </section>

        {/* Saved Deals */}
        {savedDeals.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-6">Your Saved Deals</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {savedDeals.map(deal => (
                <DealCard key={deal.id} deal={deal} onSave={handleSaveDeal} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}