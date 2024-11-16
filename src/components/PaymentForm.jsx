import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Shield, CreditCard, Check, Loader2 } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function CheckoutForm({ onSuccess, amount, currency }) {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount, 
          currency,
          email: user.primaryEmailAddress.emailAddress 
        }),
      });

      const { clientSecret } = await response.json();

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            email: user.primaryEmailAddress.emailAddress,
            name: user.fullName
          }
        },
      });

      if (stripeError) {
        setError(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <p className="text-sm font-medium">What you get:</p>
          <ul className="text-sm space-y-1">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              Advanced AI deal analysis
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              Unlimited deal monitoring
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              Priority deal notifications
            </li>
          </ul>
        </div>

        <div className="p-4 border rounded-md bg-white">
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }} />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button 
          type="submit"
          className="w-full" 
          disabled={!stripe || loading || !user}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Pay {currency === 'EUR' ? '€' : '$'}{amount}
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}

export default function PaymentForm({ onSuccess }) {
  const [currency, setCurrency] = useState('USD');
  const [amount, setAmount] = useState(5);

  useEffect(() => {
    const userLocale = navigator.language;
    if (userLocale.includes('EU') || userLocale.includes('DE') || userLocale.includes('FR')) {
      setCurrency('EUR');
    }
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Secure Payment
        </CardTitle>
        <CardDescription>
          One-time payment of {currency === 'EUR' ? '€' : '$'}{amount} for premium access
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise}>
          <CheckoutForm 
            onSuccess={onSuccess} 
            amount={amount}
            currency={currency.toLowerCase()}
          />
        </Elements>
      </CardContent>
    </Card>
  );
}