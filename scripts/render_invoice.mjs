import fs from "fs/promises";
import puppeteer from "puppeteer";
import QRCode from "qrcode";

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error("Usage: node render_invoice.mjs <input.json> <output.pdf>");
  process.exit(1);
}

const santoriniWatermark = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="320" viewBox="0 0 1200 320">
    <g fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="3">
      <path d="M40 240h140v-60h40v60h80v-90h60v90h60v-120h90v120h80v-70h60v70h90v-100h80v100h80" />
      <path d="M110 180c0-25 20-45 45-45s45 20 45 45" />
      <path d="M610 160c0-28 22-50 50-50s50 22 50 50" />
    </g>
  </svg>
`);

function currency(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0);
}

const payload = JSON.parse(await fs.readFile(inputPath, "utf8"));
const qrCodeDataUrl = await QRCode.toDataURL(payload.dashboardUrl, {
  color: { dark: "#1A2B3C", light: "#ffffff" },
  margin: 1,
  width: 120,
});

const subtotal = payload.lineItems.reduce((sum, item) => sum + Number(item.value || 0), 0);
const serviceFee = Number((subtotal * 0.06).toFixed(2));
const taxes = Number((subtotal * 0.04).toFixed(2));
const totalPaid = payload.amountPaid || subtotal + serviceFee + taxes;

const html = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${payload.invoiceNumber}</title>
    <style>
      @page { size: A4; margin: 22mm 18mm; }
      body {
        margin: 0;
        color: #1A2B3C;
        font-family: "Inter", "Montserrat", Arial, sans-serif;
        background: #ffffff;
      }
      .page {
        position: relative;
        min-height: 100%;
      }
      .watermark {
        height: 180px;
        border-radius: 28px;
        background:
          linear-gradient(135deg, rgba(0,118,206,0.96), rgba(15,23,42,0.92)),
          url("data:image/svg+xml;charset=utf-8,${santoriniWatermark}") center bottom / cover no-repeat;
        padding: 28px 32px;
        color: white;
        overflow: hidden;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .brand {
        font-family: "Playfair Display", Georgia, serif;
        font-size: 34px;
        letter-spacing: 0.08em;
        font-weight: 700;
      }
      .invoice-meta {
        text-align: right;
        font-size: 12px;
        line-height: 1.8;
      }
      .status-badge {
        display: inline-block;
        margin-top: 12px;
        border-radius: 999px;
        background: rgba(22, 163, 74, 0.18);
        color: #d9ffe8;
        border: 1px solid rgba(255,255,255,0.22);
        padding: 8px 14px;
        font-size: 12px;
        font-weight: 700;
      }
      .hero {
        margin-top: 28px;
      }
      .trip-title {
        font-family: "Playfair Display", Georgia, serif;
        font-size: 30px;
        font-weight: 700;
        margin: 0;
      }
      .dates {
        margin-top: 8px;
        font-size: 14px;
        opacity: 0.88;
      }
      .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin-top: 28px;
      }
      .panel {
        border: 1px solid #e2e8f0;
        border-radius: 22px;
        padding: 22px;
        background: #fbfdff;
      }
      .panel h3 {
        margin: 0 0 14px 0;
        font-size: 12px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: #0076CE;
      }
      .row {
        display: flex;
        justify-content: space-between;
        gap: 18px;
        padding: 14px 0;
        border-bottom: 1px solid #e2e8f0;
        font-size: 14px;
      }
      .row:last-child {
        border-bottom: none;
      }
      .label {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      .pricing {
        margin-top: 28px;
        border: 1px solid #dbeafe;
        border-radius: 24px;
        padding: 26px;
        background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
      }
      .pricing h3 {
        margin: 0 0 12px 0;
        font-size: 12px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: #0076CE;
      }
      .total-box {
        margin-top: 20px;
        padding: 22px 24px;
        border-radius: 22px;
        background: #1A2B3C;
        color: white;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .total-box .caption {
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        opacity: 0.8;
      }
      .total-box .price {
        font-family: "Playfair Display", Georgia, serif;
        font-size: 34px;
        font-weight: 700;
      }
      .footer {
        margin-top: 26px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 24px;
        border-top: 1px solid #e2e8f0;
        padding-top: 18px;
      }
      .activity-list {
        margin-top: 20px;
        border-top: 1px solid #e2e8f0;
        padding-top: 18px;
      }
      .activity-list h4 {
        margin: 0 0 10px 0;
        font-size: 12px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #0076CE;
      }
      .activity-list ul {
        margin: 0;
        padding-left: 18px;
        color: #475569;
        font-size: 13px;
        line-height: 1.8;
      }
      .footer-copy {
        max-width: 70%;
      }
      .footer-copy h4 {
        margin: 0 0 8px 0;
        font-family: "Playfair Display", Georgia, serif;
        font-size: 18px;
      }
      .footer-copy p {
        margin: 0;
        font-size: 13px;
        color: #475569;
        line-height: 1.7;
      }
      .qr-box {
        text-align: center;
      }
      .qr-box img {
        width: 88px;
        height: 88px;
        border-radius: 16px;
        padding: 10px;
        background: white;
        border: 1px solid #e2e8f0;
      }
      .qr-box span {
        display: block;
        margin-top: 8px;
        font-size: 11px;
        color: #64748b;
      }
    </style>
  </head>
  <body>
    <div class="page">
      <section class="watermark">
        <div class="header">
          <div class="brand">VOYAGEUR</div>
          <div class="invoice-meta">
            <div>${payload.invoiceNumber}</div>
            <div>${payload.bookingReference}</div>
            <div class="status-badge">${payload.bookingStatus}</div>
          </div>
        </div>
        <div class="hero">
          <h1 class="trip-title">${payload.tripTitle}</h1>
          <div class="dates">${payload.dates}</div>
        </div>
      </section>

      <section class="grid">
        <div class="panel">
          <h3>Company & Client</h3>
          <div class="row"><span>Company</span><strong>${payload.company.name}</strong></div>
          <div class="row"><span>Client</span><strong>${payload.client.name}</strong></div>
          <div class="row"><span>Email</span><strong>${payload.client.email}</strong></div>
          <div class="row"><span>Phone</span><strong>${payload.client.phone}</strong></div>
        </div>
        <div class="panel">
          <h3>Trip & Booking</h3>
          <div class="row"><span>Destination</span><strong>${payload.trip.destination}</strong></div>
          <div class="row"><span>Travelers</span><strong>${payload.trip.travelers}</strong></div>
          <div class="row"><span>Hotel</span><strong>${payload.trip.hotel}</strong></div>
          <div class="row"><span>Transport</span><strong>${payload.trip.transport}</strong></div>
        </div>
      </section>

      <section class="pricing">
        <h3>Billing Summary</h3>
        ${payload.lineItems
          .map(
            (item) => `
              <div class="row">
                <div class="label"><span>${item.icon}</span><span>${item.label}</span></div>
                <strong>${currency(item.value)}</strong>
              </div>
            `
          )
          .join("")}
        <div class="row"><span>Service Fee</span><strong>${currency(serviceFee)}</strong></div>
        <div class="row"><span>Taxes</span><strong>${currency(taxes)}</strong></div>
        <div class="total-box">
          <div>
            <div class="caption">Amount Paid</div>
            <div>${payload.bookingStatus}</div>
          </div>
          <div class="price">${currency(totalPaid)}</div>
        </div>
        ${
          payload.activitySummary?.length
            ? `<div class="activity-list"><h4>Selected Activities</h4><ul>${payload.activitySummary
                .map((item) => `<li>${item}</li>`)
                .join("")}</ul></div>`
            : ""
        }
      </section>

      <section class="footer">
        <div class="footer-copy">
          <h4>Need help?</h4>
          <p>Scan the QR code to open your Voyageur dashboard and contact support for itinerary updates, concierge requests, or billing help.</p>
        </div>
        <div class="qr-box">
          <img src="${qrCodeDataUrl}" alt="Voyageur QR code" />
          <span>Open Dashboard</span>
        </div>
      </section>
    </div>
  </body>
</html>`;

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle0" });
await page.pdf({
  path: outputPath,
  format: "A4",
  printBackground: true,
  margin: { top: "18mm", right: "14mm", bottom: "18mm", left: "14mm" },
});
await browser.close();
