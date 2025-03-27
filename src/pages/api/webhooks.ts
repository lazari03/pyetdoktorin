import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
})

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sig = req.headers['stripe-signature'] as string
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

  let event

  try {
    const rawBody = await new Promise<Buffer>((resolve, reject) => {
      let data = ''
      req.on('data', (chunk) => (data += chunk))
      req.on('end', () => resolve(Buffer.from(data)))
      req.on('error', (err) => reject(err))
    })

    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return res.status(400).send(`Webhook Error: ${errorMessage}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    console.log('Payment successful for session:', session.id)
    // TODO: Update your database to mark the payment as complete
  }

  res.status(200).json({ received: true })
}
