import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const supabase = createClient(supabaseUrl!, supabaseKey!)

serve(async (req) => {
  try {
    const { record } = await req.json() // The new booking row
    
    // 1. Fetch Event Details (Now including end_date and is_online)
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('title, start_date, end_date, image_url, location_details, is_online')
      .eq('id', record.event_id)
      .single()

    if (eventError) throw new Error("Event not found")

    // 2. Smart Email Resolution (Guest Checkout + Mobile App Fallback)
    let userEmail = record.attendee_email;
    let userName = record.attendee_name?.split(" ")[0] || "there";

    if (!userEmail && record.user_id) {
      const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(record.user_id)
      if (!userError && user) {
        userEmail = user.email;
        userName = user.user_metadata?.full_name?.split(" ")[0] || "there";
      }
    }

    if (!userEmail) throw new Error("No email associated with this booking")

    // 3. Format Date, Time, and Location
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date || event.start_date);

    const formatDate = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const startDayStr = formatDate(startDate);
    const endDayStr = formatDate(endDate);
    const startTimeStr = formatTime(startDate);
    const endTimeStr = formatTime(endDate);

    let dateLine = startDayStr;
    let timeLine = `${startTimeStr} - ${endTimeStr}`;
    
    // If event spans multiple days, adjust the format to: Mon, Oct 12 - Thu, Oct 15
    if (startDayStr !== endDayStr) {
      dateLine = `${startDayStr} - ${endDayStr}`;
    }

    // Determine correct location string
    let locationText = "Location TBA";
    if (event.is_online) {
      locationText = event.location_details?.platform || "Online Event";
    } else if (event.location_details?.address) {
      locationText = event.location_details.address;
    }

    // 4. Generate QR Code Image URL & Web Ticket Link
    const qrData = JSON.stringify({ bookingId: record.id, status: "valid" })
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}&margin=10`
    const webTicketLink = `https://hosteasy-alpha.vercel.app/tickets/${record.id}`

    // 5. Send Email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'HostEasy <onboarding@resend.dev>', // Update to your verified domain later if you have one
      to: [userEmail],
      subject: `Your Ticket for ${event.title} 🎟️`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #02200f; text-align: center;">You're going to ${event.title}!</h1>
          <p style="text-align: center; font-size: 16px;">Hi ${userName}, your ticket is confirmed.</p>
          
          <img src="${event.image_url}" alt="Event Image" style="width: 100%; border-radius: 16px; margin-bottom: 20px; object-fit: cover; height: 250px;" />
          
          <div style="background: #f8f9fa; padding: 24px; border-radius: 16px; margin-bottom: 24px; border: 1px solid #eee;">
            <h3 style="margin-top: 0; color: #007BFF; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Ticket Details</h3>
            
            <p style="margin-bottom: 8px; font-size: 15px;"><strong>📅 Date:</strong> ${dateLine}</p>
            <p style="margin-bottom: 8px; font-size: 15px;"><strong>⏰ Time:</strong> ${timeLine}</p>
            <p style="margin-bottom: 8px; font-size: 15px;"><strong>📍 Location:</strong> ${locationText}</p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;" />
            
            <p style="margin-bottom: 8px; font-size: 15px;"><strong>🎟️ Type:</strong> ${record.ticket_name}</p>
            <p style="margin-bottom: 8px; font-size: 15px;"><strong>🔢 Quantity:</strong> ${record.quantity}</p>
            <p style="margin-bottom: 0; font-size: 15px;"><strong>💰 Paid:</strong> ${record.amount_paid > 0 ? `₦${record.amount_paid.toLocaleString()}` : "Free"}</p>
          </div>

          <div style="text-align: center; margin-bottom: 30px;">
            <p style="font-size: 14px; color: #666; margin-bottom: 10px;">Scan this QR code at the venue for entry:</p>
            <img src="${qrImageUrl}" alt="Ticket QR Code" style="border-radius: 8px; border: 1px solid #ddd; padding: 10px; background: white;" />
          </div>

          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
            <a href="${webTicketLink}" style="background-color: #007BFF; color: white; padding: 14px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              View Digital Ticket & Download
            </a>
            <p style="font-size: 13px; color: #888; margin-top: 16px;">
              You can also open the HostEasy App to view your ticket anytime.
            </p>
          </div>
        </div>
      `,
    })

    if (emailError) throw emailError

    return new Response(JSON.stringify(emailData), { headers: { 'Content-Type': 'application/json' } })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
