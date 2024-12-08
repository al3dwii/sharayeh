import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/lib/db' // Ensure correct path to Prisma client
import { NextResponse } from 'next/server'

// export async function POST(req: Request) {
//   const SIGNING_SECRET = process.env.SIGNING_SECRET

//   if (!SIGNING_SECRET) {
//     throw new Error('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local')
//   }

//   // Create new Svix instance with secret
//   const wh = new Webhook(SIGNING_SECRET)

//   // Get headers
//   const headerPayload = headers()
//   const svix_id = headerPayload.get('svix-id')
//   const svix_timestamp = headerPayload.get('svix-timestamp')
//   const svix_signature = headerPayload.get('svix-signature')

//   // If there are no headers, error out
//   if (!svix_id || !svix_timestamp || !svix_signature) {
//     return new Response('Error: Missing Svix headers', {
//       status: 400,
//     })
//   }

//   // Get body
//   const payload = await req.json()
//   const body = JSON.stringify(payload)

//   let evt: WebhookEvent

//   // Verify payload with headers
//   try {
//     evt = wh.verify(body, {
//       'svix-id': svix_id,
//       'svix-timestamp': svix_timestamp,
//       'svix-signature': svix_signature,
//     }) as WebhookEvent
//   } catch (err) {
//     console.error('Error: Could not verify webhook:', err)
//     return new Response('Error: Verification error', {
//       status: 400,
//     })
//   }

//   // Handle specific events
//   if (evt.type === 'user.created') {
//     const user = evt.data // Adjust based on actual payload structure

//     // Extract necessary user details
//     const userId = user.id
//     const email = user.email_addresses[0]?.email_address || null
//     const firstName = user.first_name || ''
//     const lastName = user.last_name || ''
//     const name = firstName || lastName ? `${firstName} ${lastName}`.trim() : null

//     // Create the User record in the database
//     try {
//       await db.user.create({
//         data: {
//           id: userId, // Clerk's user.id
//           email,
//           name,
//         },
//       })
//       console.log(`User ${userId} created in database.`)
//     } catch (error: any) {
//       if (error.code === 'P2002') {
//         // Unique constraint failed (user already exists)
//         console.warn(`User ${userId} already exists in the database.`)
//       } else {
//         console.error('Error creating user in database:', error)
//       }
//     }
//   }

//   // Optionally handle other event types (e.g., user.updated, user.deleted)

//   return new Response('Webhook received', { status: 200 })
// }


export async function POST(req: Request) {
  console.log('Received webhook request');

  const SIGNING_SECRET = process.env.SIGNING_SECRET

  if (!SIGNING_SECRET) {
    console.error('SIGNING_SECRET is missing');
    return new Response('Error: Missing signing secret', { status: 500 });
  }

  const wh = new Webhook(SIGNING_SECRET)

  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing Svix headers');
    return new Response('Error: Missing Svix headers', { status: 400 });
  }

  let payload;
  try {
    payload = await req.json();
    console.log('Payload received:', payload);
  } catch (err) {
    console.error('Error parsing JSON:', err);
    return new Response('Error: Invalid JSON', { status: 400 });
  }

  const body = JSON.stringify(payload)

  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
    console.log('Webhook verified:', evt.type);
  } catch (err) {
    console.error('Verification error:', err)
    return new Response('Error: Verification failed', { status: 400 })
  }

  if (evt.type === 'user.created') {
    console.log('Handling user.created event');
    const user = evt.data

    console.log('User data:', user);

    const userId = user.id
    const email = user.email_addresses && user.email_addresses.length > 0 ? user.email_addresses[0].email_address : null
    const firstName = user.first_name || ''
    const lastName = user.last_name || ''
    const name = firstName || lastName ? `${firstName} ${lastName}`.trim() : null

    console.log(`Creating user in DB: ${userId}, ${email}, ${name}`);

    try {
      await db.user.create({
        data: {
          id: userId, // Clerk's user.id
          email,
          name,
        },
      })
      console.log(`User ${userId} created in database.`)
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.warn(`User ${userId} already exists in the database.`)
      } else {
        console.error('Database error:', error)
      }
    }
  } else {
    console.log(`Unhandled event type: ${evt.type}`);
  }

  return new Response('Webhook received', { status: 200 })
}
