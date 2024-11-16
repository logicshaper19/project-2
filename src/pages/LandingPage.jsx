import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Check, Shield } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold">DealFinder AI</span>
          </div>
          <nav>
            <ul className="flex space-x-4">
              <li><a href="#how-it-works" className="text-sm hover:text-primary transition-colors">How It Works</a></li>
              <li><a href="#pricing" className="text-sm hover:text-primary transition-colors">Pricing</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main>
        <section className="bg-gradient-to-b from-background to-secondary/20 py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Your Personal Black Friday Shopping Assistant</h1>
            <p className="text-xl mb-6 text-muted-foreground">AI-powered deal hunting and auto-purchasing. Save time, money, and grab the best discounts before they're gone.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" onClick={() => navigate('/preferences')}>Start Finding Deals</Button>
              <Button size="lg" variant="outline" onClick={() => document.getElementById('how-it-works').scrollIntoView()}>
                Learn More
              </Button>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Set Your Preferences</h3>
                  <p className="text-muted-foreground">Choose categories, brands, and your budget.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">AI Finds Deals</h3>
                  <p className="text-muted-foreground">Our AI scans thousands of retailers for the best matches.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Get Notified</h3>
                  <p className="text-muted-foreground">Receive instant alerts for the best deals.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
              <p className="text-lg text-muted-foreground">Get access to all premium features</p>
            </div>
            
            <div className="max-w-md mx-auto">
              <Card className="border-primary">
                <CardHeader>
                  <div className="bg-primary text-primary-foreground text-sm px-3 py-1 rounded-full w-fit mb-4">
                    PREMIUM ACCESS
                  </div>
                  <CardTitle>Premium</CardTitle>
                  <CardDescription>Full access to all features</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">$5</span>
                    <span className="text-muted-foreground">/one-time</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-primary mr-2" />
                      <span>Advanced AI deal analysis</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-primary mr-2" />
                      <span>Unlimited categories</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-primary mr-2" />
                      <span>Real-time price tracking</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-primary mr-2" />
                      <span>Priority deal notifications</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-primary mr-2" />
                      <span>Price history & predictions</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-primary mr-2" />
                      <span>Exclusive early access to deals</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={() => navigate('/preferences')}
                  >
                    Get Premium Access
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="mt-12 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                We charge a nominal fee to cover AI processing costs and ensure the highest quality deal recommendations.
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  <span className="text-sm">Secure payment</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2" />
                  <span className="text-sm">Money-back guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-xl font-bold">DealFinder AI</span>
            </div>
            <nav>
              <ul className="flex space-x-4">
                <li><a href="#" className="text-sm hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-sm hover:text-primary transition-colors">Contact Us</a></li>
              </ul>
            </nav>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8">© 2023 DealFinder AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}