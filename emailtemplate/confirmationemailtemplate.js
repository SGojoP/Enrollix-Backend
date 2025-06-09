const generateConfirmationEmailHTML = ({ name, freeCredits = 4, price = 499 }) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Subscription Confirmation</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">

      <!-- Header with logo -->
      <div style="background-color: #10b981; padding: 20px; text-align: center;">
        <img src="https://res.cloudinary.com/dx2gk4mlj/image/upload/v1749491311/Enrollix-removebg-preview_pcc3nt.png" alt="Enrollix Logo" style="height: 80px;" />
      </div>

      <!-- Body content -->
      <div style="padding: 30px;">
        <h2 style="color: #10b981; margin-top: 0;">🎉 Welcome to Enrollix!</h2>
        <p style="font-size: 16px; color: #111827;">Hi <strong>${name}</strong>,</p>

        <p style="font-size: 16px; color: #111827;">
          We're excited to confirm your subscription to our notification service!
        </p>

        <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 10px 15px; margin: 20px 0;">
          <p style="margin: 0; font-size: 15px; color: #065f46;">
            🎁 You will receive <strong>${freeCredits} free notifications</strong>.
            After that, you can continue receiving updates for just <strong>₹${price}/year</strong>.
          </p>
        </div>

        <ul style="font-size: 15px; color: #374151; padding-left: 20px; line-height: 1.6;">
          <li>No credits are used for promotional emails.</li>
          <li>You’ll get alerts only when they matter most.</li>
          <li>You can cancel anytime.</li>
        </ul>

        <p style="font-size: 16px; color: #111827;">
          Thank you for trusting <strong>Enrollix</strong>. We're here to make your journey smoother.
        </p>
      </div>

      <!-- Footer with social links -->
      <div style="background-color: #f9fafb; padding: 20px; text-align: center;">
        <p style="font-size: 14px; color: #6b7280;">Follow us on</p>
        <div style="margin: 10px 0;">
          <a href="https://www.instagram.com/enrollix" style="margin: 0 10px;"><img src="https://cdn-icons-png.flaticon.com/24/2111/2111463.png" alt="Instagram" /></a>
          <a href="https://www.facebook.com/enrollix" style="margin: 0 10px;"><img src="https://cdn-icons-png.flaticon.com/24/145/145802.png" alt="Facebook" /></a>
          <a href="https://www.youtube.com/enrollix" style="margin: 0 10px;"><img src="https://cdn-icons-png.flaticon.com/24/1384/1384060.png" alt="YouTube" /></a>
          <a href="https://www.linkedin.com/company/enrollix" style="margin: 0 10px;"><img src="https://cdn-icons-png.flaticon.com/24/145/145807.png" alt="LinkedIn" /></a>
        </div>
        <p style="font-size: 12px; color: #9ca3af; margin-top: 10px;">© ${new Date().getFullYear()} Enrollix. All rights reserved.</p>
      </div>

    </div>
  </body>
  </html>
  `;
};


export default generateConfirmationEmailHTML;