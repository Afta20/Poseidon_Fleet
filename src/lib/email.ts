import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendBookingConfirmationEmail = async (
  toEmail: string,
  customerName: string,
  shipment: {
    id: string;
    title: string;
    origin: string;
    destination: string;
    cost: number | null;
    paymentMethod: string;
  }
) => {
  const isQrisOrTransfer = shipment.paymentMethod === 'E_WALLET' || shipment.paymentMethod === 'TRANSFER_BANK';
  const amountStr = shipment.cost ? `Rp ${shipment.cost.toLocaleString('id-ID')}` : 'Belum Ditetapkan';

  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #6366f1; margin: 0;">POSEIDON FLEET</h1>
        <p style="color: #666; font-size: 14px; margin-top: 5px;">Sistem Navigasi & Logistik Maritim</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <h2 style="color: #333; margin-top: 0;">Halo, ${customerName}!</h2>
        <p style="color: #555; line-height: 1.6;">
          Terima kasih telah menggunakan layanan pengiriman Poseidon Fleet. Pesanan kargo Anda telah kami terima dan saat ini sedang dalam status <strong>PENDING</strong> (Menunggu Konfirmasi).
        </p>
        
        <div style="background-color: #f3f4f6; border-left: 4px solid #6366f1; padding: 15px; margin: 25px 0;">
          <h3 style="margin-top: 0; color: #333; font-size: 16px;">Detail Pesanan</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 5px 0; color: #666; width: 40%;">Nomor Resi:</td>
              <td style="padding: 5px 0; font-weight: bold; color: #333;">${shipment.id}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #666;">Nama Barang:</td>
              <td style="padding: 5px 0; font-weight: bold; color: #333;">${shipment.title}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #666;">Rute:</td>
              <td style="padding: 5px 0; font-weight: bold; color: #333;">${shipment.origin} &rarr; ${shipment.destination}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #666;">Metode Bayar:</td>
              <td style="padding: 5px 0; font-weight: bold; color: #333;">${shipment.paymentMethod.replace('_', ' ')}</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #666;">Total Tagihan:</td>
              <td style="padding: 5px 0; font-weight: bold; color: #10b981;">${amountStr}</td>
            </tr>
          </table>
        </div>

        ${isQrisOrTransfer ? `
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #555; margin-bottom: 15px;">Silakan selesaikan pembayaran agar pesanan dapat segera diproses:</p>
            <a href="https://poseidon-fleet.vercel.app/customer/payment/${shipment.id}" style="background-color: #6366f1; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold; display: inline-block;">Halaman Pembayaran</a>
          </div>
        ` : `
          <p style="color: #555; line-height: 1.6;">Karena Anda memilih metode COD (Bayar di Pelabuhan), silakan siapkan dana sejumlah <strong>${amountStr}</strong> saat menyerahkan muatan.</p>
        `}
        
        <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 30px 0;" />
        <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
          Ini adalah email otomatis, mohon tidak membalas email ini.<br/>
          &copy; ${new Date().getFullYear()} Poseidon Fleet. All rights reserved.
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: '"Poseidon Fleet" <kelompok2bsiweb@gmail.com>',
      to: toEmail,
      subject: `Konfirmasi Pesanan Kargo: ${shipment.id}`,
      html: htmlTemplate,
    });
    console.log(`Email konfirmasi terkirim ke ${toEmail}`);
  } catch (error) {
    console.error('Gagal mengirim email:', error);
  }
};

export const sendVerificationEmail = async (toEmail: string, userName: string, token: string) => {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #6366f1; margin: 0;">POSEIDON FLEET</h1>
        <p style="color: #666; font-size: 14px; margin-top: 5px;">Sistem Navigasi & Logistik Maritim</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <h2 style="color: #333; margin-top: 0;">Halo, ${userName}!</h2>
        <p style="color: #555; line-height: 1.6;">
          Terima kasih telah mendaftar di Poseidon Fleet. Untuk mulai menggunakan layanan kami dan memastikan keamanan akun Anda, silakan verifikasi alamat email Anda dengan mengklik tombol di bawah ini:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #6366f1; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold; display: inline-block;">Verifikasi Email Saya</a>
        </div>
        
        <p style="color: #555; line-height: 1.6; font-size: 14px;">
          Atau salin dan tempel tautan berikut di browser Anda:<br>
          <a href="${verifyUrl}" style="color: #6366f1; word-break: break-all;">${verifyUrl}</a>
        </p>
        
        <p style="color: #888; line-height: 1.6; font-size: 13px; margin-top: 20px;">
          Link ini akan kedaluwarsa dalam waktu 24 jam. Jika Anda tidak mendaftar di Poseidon Fleet, abaikan email ini.
        </p>
        
        <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 30px 0;" />
        <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
          Ini adalah email otomatis, mohon tidak membalas email ini.<br/>
          &copy; ${new Date().getFullYear()} Poseidon Fleet. All rights reserved.
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: '"Poseidon Fleet" <kelompok2bsiweb@gmail.com>',
      to: toEmail,
      subject: 'Verifikasi Akun Poseidon Fleet Anda',
      html: htmlTemplate,
    });
    console.log(`Email verifikasi terkirim ke ${toEmail}`);
  } catch (error) {
    console.error('Gagal mengirim email verifikasi:', error);
  }
};
