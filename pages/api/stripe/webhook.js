import { buffer } from 'micro';
import Stripe from 'stripe';
import { db } from '../../../config/firebaseconfig';
import { doc, updateDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const buf = await buffer(req);
        const sig = req.headers['stripe-signature'];

        try {
            const event = stripe.webhooks.constructEvent(
                buf,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );

            if (event.type === 'checkout.session.completed') {
                const session = event.data.object;
                const appointmentId = session.metadata.appointmentId;

                // Update the appointment in Firebase
                const appointmentRef = doc(db, 'appointments', appointmentId);
                await updateDoc(appointmentRef, { isPaid: true });
            }

            res.status(200).send('Success');
        } catch (err) {
            console.error('Error verifying Stripe webhook:', err);
            res.status(400).send(`Webhook Error: ${err.message}`);
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}
