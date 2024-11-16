from flask import Flask, jsonify, request
from flask_cors import CORS
import stripe
import os
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

load_dotenv()

app = Flask(__name__)
CORS(app)

stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

def send_email(to_email, subject, template_name, context=None):
    """Send an email using SMTP"""
    smtp_host = os.getenv('SMTP_HOST')
    smtp_port = int(os.getenv('SMTP_PORT'))
    smtp_user = os.getenv('SMTP_USER')
    smtp_pass = os.getenv('SMTP_PASS')

    # Create message
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = smtp_user
    msg['To'] = to_email

    # Load and format template
    template_path = f'email_templates/{template_name}.html'
    with open(template_path, 'r') as f:
        template = f.read()
        if context:
            template = template.format(**context)
    
    # Attach HTML content
    html_part = MIMEText(template, 'html')
    msg.attach(html_part)

    # Send email
    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        return False

@app.route('/api/create-payment-intent', methods=['POST'])
def create_payment():
    try:
        data = request.json
        amount = data.get('amount', 5)
        currency = data.get('currency', 'usd').lower()
        email = data.get('email')

        # Create a PaymentIntent with the order amount and currency
        intent = stripe.PaymentIntent.create(
            amount=int(amount * 100),  # Convert to cents
            currency=currency,
            automatic_payment_methods={
                'enabled': True,
            },
            metadata={
                'email': email
            }
        )

        return jsonify({
            'clientSecret': intent.client_secret
        })

    except Exception as e:
        return jsonify(error=str(e)), 403

@app.route('/api/webhook/stripe', methods=['POST'])
def stripe_webhook():
    payload = request.get_data()
    sig_header = request.headers.get('Stripe-Signature')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.getenv('STRIPE_WEBHOOK_SECRET')
        )

        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            customer_email = payment_intent.metadata.get('email')

            if customer_email:
                # Send welcome email
                send_email(
                    customer_email,
                    'Welcome to DealFinder AI Premium!',
                    'welcome',
                    {
                        'date': datetime.now().strftime('%Y-%m-%d'),
                        'amount': payment_intent.amount / 100
                    }
                )

        return jsonify(success=True)

    except Exception as e:
        return jsonify(error=str(e)), 400

if __name__ == '__main__':
    app.run(port=5000)