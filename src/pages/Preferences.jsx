import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Slider } from "../components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Progress } from "../components/ui/progress";
import { Bot, MapPin, Tag, Bell } from 'lucide-react';
import PaymentForm from '../components/PaymentForm';

const mainCategories = [
  { id: 'electronics', name: 'Electronics', subCategories: ['Laptops', 'Smartphones', 'TVs', 'Gaming', 'Audio'] },
  { id: 'fashion', name: 'Fashion', subCategories: ['Men', 'Women', 'Kids', 'Shoes', 'Accessories'] },
  { id: 'home', name: 'Home & Living', subCategories: ['Furniture', 'Appliances', 'Kitchen', 'Decor'] },
  { id: 'beauty', name: 'Beauty', subCategories: ['Skincare', 'Makeup', 'Haircare', 'Fragrance'] },
  { id: 'sports', name: 'Sports & Outdoors', subCategories: ['Exercise', 'Outdoor', 'Sports Equipment'] },
  { id: 'toys', name: 'Toys & Games', subCategories: ['Board Games', 'Video Games', 'Educational', 'Action Figures'] },
  { id: 'books', name: 'Books & Media', subCategories: ['Fiction', 'Non-Fiction', 'Digital', 'Audiobooks'] },
  { id: 'auto', name: 'Automotive', subCategories: ['Parts', 'Accessories', 'Tools', 'Electronics'] },
  { id: 'pets', name: 'Pet Supplies', subCategories: ['Dog', 'Cat', 'Fish', 'Small Pets'] },
];

const countries = {
  us: {
    name: 'United States',
    states: {
      ny: { name: 'New York', cities: ['New York City', 'Buffalo', 'Albany'] },
      ca: { name: 'California', cities: ['Los Angeles', 'San Francisco', 'San Diego'] },
      tx: { name: 'Texas', cities: ['Houston', 'Austin', 'Dallas'] },
    }
  },
  uk: {
    name: 'United Kingdom',
    regions: {
      eng: { name: 'England', cities: ['London', 'Manchester', 'Birmingham'] },
      sct: { name: 'Scotland', cities: ['Edinburgh', 'Glasgow', 'Aberdeen'] },
      wls: { name: 'Wales', cities: ['Cardiff', 'Swansea', 'Newport'] },
    }
  },
  // Add more countries as needed
};

export default function Preferences() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    country: '',
    region: '',
    city: '',
    categories: new Set(),
    subCategories: new Set(),
    priceRange: [0, 1000],
    notificationLevel: 50, // Default to moderate notifications
  });

  const totalSteps = 5;
  const progressPercentage = (step / totalSteps) * 100;

  const stepTitles = [
    "Location",
    "Categories",
    "Price Range",
    "Review",
    "Payment"
  ];

  const handleCountryChange = (value) => {
    setFormData(prev => ({
      ...prev,
      country: value,
      region: '',
      city: ''
    }));
  };

  const handleRegionChange = (value) => {
    setFormData(prev => ({
      ...prev,
      region: value,
      city: ''
    }));
  };

  const handleCityChange = (value) => {
    setFormData(prev => ({
      ...prev,
      city: value
    }));
  };

  const handleCategoryToggle = (categoryId, subCategory = null) => {
    setFormData(prev => {
      const newCategories = new Set(prev.categories);
      const newSubCategories = new Set(prev.subCategories);

      if (subCategory) {
        if (newSubCategories.has(subCategory)) {
          newSubCategories.delete(subCategory);
          // If no subcategories remain, remove the main category
          const remainingSubCats = Array.from(newSubCategories).filter(
            sub => mainCategories.find(cat => cat.id === categoryId)?.subCategories.includes(sub)
          );
          if (remainingSubCats.length === 0) {
            newCategories.delete(categoryId);
          }
        } else {
          newSubCategories.add(subCategory);
          newCategories.add(categoryId);
        }
      } else {
        if (newCategories.has(categoryId)) {
          newCategories.delete(categoryId);
          // Remove all subcategories of this category
          mainCategories.find(cat => cat.id === categoryId)?.subCategories.forEach(sub => {
            newSubCategories.delete(sub);
          });
        } else {
          newCategories.add(categoryId);
        }
      }

      return {
        ...prev,
        categories: newCategories,
        subCategories: newSubCategories
      };
    });
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="country">Country</Label>
              <Select value={formData.country} onValueChange={handleCountryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(countries).map(([code, country]) => (
                    <SelectItem key={code} value={code}>{country.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.country && (
              <div>
                <Label htmlFor="region">
                  {countries[formData.country].states ? 'State' : 'Region'}
                </Label>
                <Select value={formData.region} onValueChange={handleRegionChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Select your ${countries[formData.country].states ? 'state' : 'region'}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(countries[formData.country].states || countries[formData.country].regions).map(([code, region]) => (
                      <SelectItem key={code} value={code}>{region.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.region && (
              <div>
                <Label htmlFor="city">City</Label>
                <Select value={formData.city} onValueChange={handleCityChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your city" />
                  </SelectTrigger>
                  <SelectContent>
                    {(countries[formData.country].states?.[formData.region] || 
                      countries[formData.country].regions?.[formData.region])?.cities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="max-h-[400px] overflow-y-auto pr-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {mainCategories.map(category => (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={category.id}
                      checked={formData.categories.has(category.id)}
                      onCheckedChange={() => handleCategoryToggle(category.id)}
                    />
                    <Label htmlFor={category.id} className="font-medium">{category.name}</Label>
                  </div>
                  <div className="ml-6 grid grid-cols-2 gap-2">
                    {category.subCategories.map(subCategory => (
                      <div key={subCategory} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${category.id}-${subCategory}`}
                          checked={formData.subCategories.has(subCategory)}
                          onCheckedChange={() => handleCategoryToggle(category.id, subCategory)}
                        />
                        <Label htmlFor={`${category.id}-${subCategory}`}>{subCategory}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label>Price Range</Label>
              <Slider
                min={0}
                max={1000}
                step={10}
                value={formData.priceRange}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priceRange: value }))}
                className="mt-2"
              />
              <div className="flex justify-between mt-2">
                <span>${formData.priceRange[0]}</span>
                <span>${formData.priceRange[1]}</span>
              </div>
            </div>
            <div className="space-y-4">
              <Label>Push Notification Preference</Label>
              <div className="space-y-2">
                <Slider
                  min={0}
                  max={100}
                  value={[formData.notificationLevel]}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, notificationLevel: value[0] }))}
                  className="mt-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Less Frequent</span>
                  <span>More Frequent</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {formData.notificationLevel === 0 ? "Notifications disabled" :
                   formData.notificationLevel < 33 ? "Receive only critical deal alerts" :
                   formData.notificationLevel < 66 ? "Receive moderate deal updates" :
                   "Receive all deal notifications"}
                </p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Review Your Settings</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Location:</strong> {countries[formData.country]?.name}, {formData.city}</p>
              <p><strong>Categories:</strong> {Array.from(formData.categories).map(id => 
                mainCategories.find(c => c.id === id)?.name
              ).join(', ')}</p>
              <p><strong>Price Range:</strong> ${formData.priceRange[0]} - ${formData.priceRange[1]}</p>
              <p><strong>Notification Level:</strong> {
                formData.notificationLevel === 0 ? "Disabled" :
                formData.notificationLevel < 33 ? "Critical alerts only" :
                formData.notificationLevel < 66 ? "Moderate updates" :
                "All notifications"
              }</p>
            </div>
          </div>
        );

      case 5:
        return <PaymentForm onSuccess={() => navigate('/dashboard')} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-6 h-6" />
            Set Up Your Deal Preferences
          </CardTitle>
          <CardDescription>Step {step} of {totalSteps}: {stepTitles[step - 1]}</CardDescription>
          <Progress value={progressPercentage} className="mt-2" />
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
        <CardFooter className="flex justify-between">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(prev => prev - 1)}>
              Back
            </Button>
          )}
          <Button 
            onClick={() => step < totalSteps ? setStep(prev => prev + 1) : navigate('/dashboard')}
            className={step === 1 ? 'w-full' : ''}
          >
            {step < totalSteps ? 'Next' : 'Complete Setup'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}