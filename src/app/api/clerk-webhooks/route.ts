import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/lib/db'; // Ensure correct path to Prisma client
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  console.log('Received webhook request');

  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    console.error('SIGNING_SECRET is missing');
    return new Response('Error: Missing signing secret', { status: 500 });
  }

  // Log the presence and length of the secret for debugging
  console.log('SIGNING_SECRET is set:', SIGNING_SECRET ? 'Yes' : 'No');
  console.log('SIGNING_SECRET length:', SIGNING_SECRET.length);

  const wh = new Webhook(SIGNING_SECRET);

  const headerPayload = headers();

  // Option 1: Using Record<string, string>
  const allHeaders: Record<string, string> = {};

  // Option 2: Using Index Signature
  // const allHeaders: { [key: string]: string } = {};

  // Populate allHeaders
  for (const [key, value] of headerPayload.entries()) {
    allHeaders[key] = value;
  }

  console.log('All Headers:', allHeaders);

  const svix_id = allHeaders['svix-id'];
  const svix_timestamp = allHeaders['svix-timestamp'];
  const svix_signature = allHeaders['svix-signature'];

  // Log specific svix headers
  console.log('svix-id:', svix_id);
  console.log('svix-timestamp:', svix_timestamp);
  console.log('svix-signature:', svix_signature);

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing Svix headers');
    return new Response('Error: Missing Svix headers', { status: 400 });
  }

  let rawBody: string;
  try {
    // Read the raw body as text
    rawBody = await req.text();
    console.log('Raw body length:', rawBody.length);
    // Log a snippet to verify content without exposing sensitive data
    console.log('Raw body snippet:', rawBody.substring(0, 200));
  } catch (err) {
    console.error('Error reading raw body:', err);
    return new Response('Error: Invalid body', { status: 400 });
  }

  let evt: WebhookEvent;

  try {
    // Verify the webhook signature using the raw body
    evt = wh.verify(rawBody, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
    console.log('Webhook verified:', evt.type);
  } catch (err) {
    console.error('Verification error:', err);
    return new Response('Error: Verification failed', { status: 400 });
  }

  let payload: any;
  try {
    // Parse the JSON payload after verification
    payload = JSON.parse(rawBody);
    console.log('Payload received:', payload);
  } catch (err) {
    console.error('Error parsing JSON:', err);
    return new Response('Error: Invalid JSON', { status: 400 });
  }

  // Handle specific event types
  if (evt.type === 'user.created' || evt.type === 'user.updated') {
    console.log(`Handling ${evt.type} event`);
    const user = evt.data;

    console.log('User data:', user);

    const userId = user.id;
    const email = user.email_addresses?.[0]?.email_address || 'unknown@example.com';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    const name = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : null;

    console.log(`Upserting user in DB: ${userId}, ${email}, ${name}`);

    try {
      const upsertedUser = await db.user.upsert({
        where: { email }, // Use email as the unique identifier
        update: {
          id: userId, // Update the id if necessary
          name,
          // Add other fields you want to update
        },
        create: {
          id: userId, // Clerk's user.id
          email,
          name,
          // Add other fields required for creation
        },
      });
      console.log(`User ${upsertedUser.id} upserted in database.`);
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('id')) {
        console.error('Unique constraint failed on id field:', error);
        // Handle the conflict, e.g., merge users or notify admin
      } else {
        console.error('Database error during upsert:', error);
      }
      return new Response('Error: Database upsert failed', { status: 500 });
    }
  } else {
    console.log(`Unhandled event type: ${evt.type}`);
  }

  return new Response('Webhook received', { status: 200 });
}


// import { Webhook } from 'svix';
// import { headers } from 'next/headers';
// import { WebhookEvent } from '@clerk/nextjs/server';
// import { db } from '@/lib/db'; // Ensure correct path to Prisma client
// import { NextResponse } from 'next/server';

// export async function POST(req: Request) {
//   console.log('Received webhook request');

//   const SIGNING_SECRET = process.env.SIGNING_SECRET;

//   if (!SIGNING_SECRET) {
//     console.error('SIGNING_SECRET is missing');
//     return new Response('Error: Missing signing secret', { status: 500 });
//   }

//   const wh = new Webhook(SIGNING_SECRET);

//   const headerPayload = headers();
//   const svix_id = headerPayload.get('svix-id');
//   const svix_timestamp = headerPayload.get('svix-timestamp');
//   const svix_signature = headerPayload.get('svix-signature');

//   if (!svix_id || !svix_timestamp || !svix_signature) {
//     console.error('Missing Svix headers');
//     return new Response('Error: Missing Svix headers', { status: 400 });
//   }

//   let payload;
//   try {
//     payload = await req.json();
//     console.log('Payload received:', payload);
//   } catch (err) {
//     console.error('Error parsing JSON:', err);
//     return new Response('Error: Invalid JSON', { status: 400 });
//   }

//   const body = JSON.stringify(payload);

//   let evt: WebhookEvent;

//   try {
//     evt = wh.verify(body, {
//       'svix-id': svix_id,
//       'svix-timestamp': svix_timestamp,
//       'svix-signature': svix_signature,
//     }) as WebhookEvent;
//     console.log('Webhook verified:', evt.type);
//   } catch (err) {
//     console.error('Verification error:', err);
//     return new Response('Error: Verification failed', { status: 400 });
//   }

//   if (evt.type === 'user.created' || evt.type === 'user.updated') { // Optionally handle more event types
//     console.log(`Handling ${evt.type} event`);
//     const user = evt.data;

//     console.log('User data:', user);

//     const userId = user.id;
//     const email = user.email_addresses?.[0]?.email_address || 'unknown@example.com';
//     const firstName = user.first_name || '';
//     const lastName = user.last_name || '';
//     const name = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : null;

//     console.log(`Upserting user in DB: ${userId}, ${email}, ${name}`);

//     try {
//       const upsertedUser = await db.user.upsert({
//         where: { email }, // Use email as the unique identifier
//         update: {
//           id: userId, // Update the id if necessary
//           name,
//           // Add other fields you want to update
//         },
//         create: {
//           id: userId, // Clerk's user.id
//           email,
//           name,
//           // Add other fields required for creation
//         },
//       });
//       console.log(`User ${upsertedUser.id} upserted in database.`);
//     } catch (error: any) {
//       if (error.code === 'P2002' && error.meta?.target?.includes('id')) {
//         console.error('Unique constraint failed on id field:', error);
//         // Handle the conflict, e.g., merge users or notify admin
//       } else {
//         console.error('Database error during upsert:', error);
//       }
//       return new Response('Error: Database upsert failed', { status: 500 });
//     }
//   } else {
//     console.log(`Unhandled event type: ${evt.type}`);
//   }

//   return new Response('Webhook received', { status: 200 });
// }




// import { Webhook } from 'svix'
// import { headers } from 'next/headers'
// import { WebhookEvent } from '@clerk/nextjs/server'
// import { db } from '@/lib/db' // Ensure correct path to Prisma client
// import { NextResponse } from 'next/server'

// export async function POST(req: Request) {
//   console.log('Received webhook request');

//   const SIGNING_SECRET = process.env.SIGNING_SECRET

//   if (!SIGNING_SECRET) {
//     console.error('SIGNING_SECRET is missing');
//     return new Response('Error: Missing signing secret', { status: 500 });
//   }

//   const wh = new Webhook(SIGNING_SECRET)

//   const headerPayload = headers()
//   const svix_id = headerPayload.get('svix-id')
//   const svix_timestamp = headerPayload.get('svix-timestamp')
//   const svix_signature = headerPayload.get('svix-signature')

//   if (!svix_id || !svix_timestamp || !svix_signature) {
//     console.error('Missing Svix headers');
//     return new Response('Error: Missing Svix headers', { status: 400 });
//   }

//   let payload;
//   try {
//     payload = await req.json();
//     console.log('Payload received:', payload);
//   } catch (err) {
//     console.error('Error parsing JSON:', err);
//     return new Response('Error: Invalid JSON', { status: 400 });
//   }

//   const body = JSON.stringify(payload)

//   let evt: WebhookEvent

//   try {
//     evt = wh.verify(body, {
//       'svix-id': svix_id,
//       'svix-timestamp': svix_timestamp,
//       'svix-signature': svix_signature,
//     }) as WebhookEvent
//     console.log('Webhook verified:', evt.type);
//   } catch (err) {
//     console.error('Verification error:', err)
//     return new Response('Error: Verification failed', { status: 400 })
//   }

//   if (evt.type === 'user.created' || evt.type === 'user.updated') { // Optionally handle more event types
//     console.log(`Handling ${evt.type} event`);
//     const user = evt.data

//     console.log('User data:', user);

//     const userId = user.id
//     const email = user.email_addresses?.[0]?.email_address || 'unknown@example.com';
//     const firstName = user.first_name || ''
//     const lastName = user.last_name || ''
//     const name = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : null

//     console.log(`Upserting user in DB: ${userId}, ${email}, ${name}`);

//     try {
//       const upsertedUser = await db.user.upsert({
//         where: { id: userId }, // Unique identifier
//         update: {
//           email,
//           name,
//           // Add other fields you want to update
//         },
//         create: {
//           id: userId, // Clerk's user.id
//           email,
//           name,
//           // Add other fields required for creation
//         },
//       })
//       console.log(`User ${upsertedUser.id} upserted in database.`)
//     } catch (error: any) {
//       console.error('Database error during upsert:', error)
//       return new Response('Error: Database upsert failed', { status: 500 })
//     }
//   } else {
//     console.log(`Unhandled event type: ${evt.type}`);
//   }

//   return new Response('Webhook received', { status: 200 })
// }




// import { Webhook } from 'svix'
// import { headers } from 'next/headers'
// import { WebhookEvent } from '@clerk/nextjs/server'
// import { db } from '@/lib/db' // Ensure correct path to Prisma client
// import { NextResponse } from 'next/server'

// export async function POST(req: Request) {
//   console.log('Received webhook request');

//   const SIGNING_SECRET = process.env.SIGNING_SECRET

//   if (!SIGNING_SECRET) {
//     console.error('SIGNING_SECRET is missing');
//     return new Response('Error: Missing signing secret', { status: 500 });
//   }

//   const wh = new Webhook(SIGNING_SECRET)

//   const headerPayload = headers()
//   const svix_id = headerPayload.get('svix-id')
//   const svix_timestamp = headerPayload.get('svix-timestamp')
//   const svix_signature = headerPayload.get('svix-signature')

//   if (!svix_id || !svix_timestamp || !svix_signature) {
//     console.error('Missing Svix headers');
//     return new Response('Error: Missing Svix headers', { status: 400 });
//   }

//   let payload;
//   try {
//     payload = await req.json();
//     console.log('Payload received:', payload);
//   } catch (err) {
//     console.error('Error parsing JSON:', err);
//     return new Response('Error: Invalid JSON', { status: 400 });
//   }

//   const body = JSON.stringify(payload)

//   let evt: WebhookEvent

//   try {
//     evt = wh.verify(body, {
//       'svix-id': svix_id,
//       'svix-timestamp': svix_timestamp,
//       'svix-signature': svix_signature,
//     }) as WebhookEvent
//     console.log('Webhook verified:', evt.type);
//   } catch (err) {
//     console.error('Verification error:', err)
//     return new Response('Error: Verification failed', { status: 400 })
//   }

//   if (evt.type === 'user.created') {
//     console.log('Handling user.created event');
//     const user = evt.data

//     console.log('User data:', user);

//     const userId = user.id
//     const email = user.email_addresses?.[0]?.email_address || 'unknown@example.com';
//     const firstName = user.first_name || ''
//     const lastName = user.last_name || ''
//     const name = firstName || lastName ? `${firstName} ${lastName}`.trim() : null

//     console.log(`Creating user in DB: ${userId}, ${email}, ${name}`);

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
//         console.warn(`User ${userId} already exists in the database.`)
//       } else {
//         console.error('Database error:', error)
//       }
//     }
//   } else {
//     console.log(`Unhandled event type: ${evt.type}`);
//   }

//   return new Response('Webhook received', { status: 200 })
// }
