// app/api/send-booking-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { recipientEmail, bookingDetails } = await req.json();

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      port: 465,
      secure: true,
      auth: {
        user: 'biswajit.cp2026@gmail.com',
        pass: 'wtoq jljb xiza duhi',
        //lbwg cyuz kaji wvzd - secyweb
      },
    });

    const mailOptions = {
      from: 'biswajit.cp2026@gmail.com',
      to: recipientEmail,
      subject: 'New Booking Request',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>New Booking Request</h2>
          <p><strong>Requester:</strong> ${bookingDetails.requesterName}</p>
          <p><strong>Item:</strong> ${bookingDetails.itemName}</p>
          <p><strong>Quantity:</strong> ${bookingDetails.bookedQuantity}</p>
          <p><strong>Purpose:</strong> ${bookingDetails.purpose}</p>
          <p>Click the buttons below to approve or reject the request:</p>
          <a href="${bookingDetails.approveLink}" style="display: inline-block; margin-right: 10px; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Approve</a>
          <a href="${bookingDetails.rejectLink}" style="display: inline-block; margin-left: 10px; padding: 10px 20px; background-color: #f44336; color: white; text-decoration: none; border-radius: 5px;">Reject</a>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Error sending email' }, { status: 500 });
  }
}
