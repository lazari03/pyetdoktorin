import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth';
import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { UserRole } from '@/domain/entities/UserRole';
import {
  createSupportTicket,
  listTicketsForUser,
  listAllTickets,
  getTicketById,
  updateTicketStatus,
} from '@/services/supportTicketsService';
import { createUserNotification } from '@/services/userNotificationsService';
import { sendPlatformEmail } from '@/services/emailService';

const router = Router();

const createSchema = z.object({
  topic: z.string().min(1).max(120),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
});

const updateSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved']).optional(),
  adminNotes: z.string().max(5000).optional(),
});

router.post('/', requireAuth(), async (req: AuthenticatedRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid ticket', issues: parsed.error.issues });
  }
  try {
    const uid = req.user!.uid;
    const admin = getFirebaseAdmin();
    const [userDoc, authUser] = await Promise.all([
      admin.firestore().collection('users').doc(uid).get(),
      admin.auth().getUser(uid).catch(() => null),
    ]);
    const data = userDoc.data() ?? {};
    const userName = [data.name, data.surname].filter(Boolean).join(' ').trim() || authUser?.displayName || uid;
    const userEmail = (data.email as string | undefined) || authUser?.email || '';

    const ticket = await createSupportTicket({
      userId: uid,
      userName,
      userEmail,
      userRole: req.user!.role,
      ...parsed.data,
    });

    try {
      const adminsSnap = await admin.firestore().collection('users').where('role', '==', UserRole.Admin).get();
      await Promise.all(
        adminsSnap.docs.map((doc) =>
          createUserNotification({
            userId: doc.id,
            type: 'support_ticket_created',
            title: 'New support ticket',
            body: `${userName}: ${ticket.subject}`,
            metadata: { ticketId: ticket.id },
          }),
        ),
      );
    } catch (error) {
      console.error('Failed to notify admins of new support ticket:', error);
    }

    sendPlatformEmail({
      to: 'info@pyetdoktorin.al',
      subject: `New support ticket: ${ticket.subject}`,
      text: `From: ${userName} <${userEmail}>\nRole: ${ticket.userRole}\nTopic: ${ticket.topic}\n\n${ticket.message}`,
      ...(userEmail ? { replyTo: userEmail } : {}),
    }).catch((error) => console.error('Failed to send support ticket email:', error));

    res.status(201).json({ ticket });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

router.get('/mine', requireAuth(), async (req: AuthenticatedRequest, res) => {
  try {
    const items = await listTicketsForUser(req.user!.uid);
    res.json({ items });
  } catch (error) {
    console.error('Error listing support tickets:', error);
    res.status(500).json({ error: 'Failed to list tickets' });
  }
});

router.get('/', requireAuth([UserRole.Admin]), async (_req, res) => {
  try {
    const items = await listAllTickets();
    res.json({ items });
  } catch (error) {
    console.error('Error listing all support tickets:', error);
    res.status(500).json({ error: 'Failed to list tickets' });
  }
});

router.get('/:id', requireAuth(), async (req: AuthenticatedRequest, res) => {
  const { id } = req.params as { id: string };
  try {
    const ticket = await getTicketById(id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    if (ticket.userId !== req.user!.uid && req.user!.role !== UserRole.Admin) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json({ ticket });
  } catch (error) {
    console.error('Error fetching support ticket:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

router.patch('/:id', requireAuth([UserRole.Admin]), async (req, res) => {
  const { id } = req.params as { id: string };
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid update', issues: parsed.error.issues });
  }
  try {
    const { status, adminNotes } = parsed.data;
    const updated = await updateTicketStatus(id, {
      ...(status !== undefined ? { status } : {}),
      ...(adminNotes !== undefined ? { adminNotes } : {}),
    });
    if (!updated) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json({ ticket: updated });
  } catch (error) {
    console.error('Error updating support ticket:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

export default router;
