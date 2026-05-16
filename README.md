# ChargeGuard

> **AI-Powered Buyer Trust & Chargeback Protection Platform for Squadco Merchants**

Protect your Nigerian e-commerce business from chargeback fraud with instant buyer risk intelligence.

---

## 📸 Preview

[![Screenshot-from-2026-05-16-05-21-30.png](https://i.postimg.cc/9f62vhJX/Screenshot-from-2026-05-16-05-21-30.png)](https://postimg.cc/QBJvTv2v)

---

## 🚀 About ChargeGuard

ChargeGuard is a **merchant-facing risk intelligence platform** built on top of the **Squadco** payment ecosystem. It helps Nigerian merchants assess buyer risk **before** shipping goods or releasing services by analyzing network-wide chargeback history and behavioral signals.

With rising chargeback fraud — especially during peak seasons like **Detty December** — ChargeGuard gives merchants the power to make informed decisions and defend disputes effectively.

---

## ✨ Features

### 🔍 Instant Risk Scoring
Search any buyer using their email or phone number and receive a **0–100 trust/risk score** instantly.

### 🧠 8-Signal Deterministic Risk Engine
Analyzes multiple fraud indicators including:

- Total chargebacks
- Chargeback velocity
- Cross-merchant fraud patterns
- IP/device reuse
- Merchant fight-back rate
- Repeat dispute behavior
- Network-wide risk activity
- Suspicious transaction frequency

### 📂 Dispute Management
Centralized dashboard for:

- Viewing active disputes
- Tracking dispute statuses
- Monitoring merchant responses

### 🤖 AI Defence Case Generator
Automatically generates strong dispute defence letters merchants can submit to Squadco.

### 📊 Merchant Dashboard
Get insights into:

- Revenue protected
- Active disputes
- Recent searches
- Buyer risk trends

### 🌐 Network Intelligence
Leverages shared fraud intelligence across Squadco merchants to identify suspicious buyers early.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js + Vite |
| Backend | Node.js + Express |
| Database | Supabase (PostgreSQL) |
| Authentication | JWT |
| Styling | Custom CSS + Sora Font |

---

## 📁 Project Structure

```bash
chargeguard/
├── backend/                # Node.js + Express API
├── frontend/               # React + Vite application
├── docs/                   # Documentation files
├── .env.example
├── README.md
└── seed-data.sql
```

---

## ⚙️ Installation & Setup

### Prerequisites

Before getting started, ensure you have:

- Node.js (v18+)
- A Supabase account
- A Squadco Merchant account
- Git installed

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/chargeguard.git
cd chargeguard
```

---

## 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

---

## 3️⃣ Frontend Setup

```bash
cd frontend
npm install
```

---

## 4️⃣ Database Setup

1. Create a new Supabase project
2. Run your migration scripts
3. Seed dummy data into the database

---

## 5️⃣ Run the Application

### Start Backend

```bash
cd backend
npm run dev
```

### Start Frontend

```bash
cd frontend
npm run dev
```

---

## 🔐 Environment Variables

Create a `.env` file inside the `backend/` folder.

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Squadco
SQUADCO_API_KEY=sandbox_xxxxxxxxxxxx

# JWT
JWT_SECRET=your_super_secret_jwt_key

# App
NODE_ENV=development
PORT=5000
```

---

## 🌱 Seeding Dummy Data

Populate your database with test customers and disputes.

```bash
cd backend
node seed/seedDummyData.js
```

### Test Accounts

| Buyer | Risk Level |
|---|---|
| fraudster@gmail.com | 🔴 Critical Risk |
| suspicious@yahoo.com | 🟠 Moderate Risk |
| goodbuyer@gmail.com | 🟢 Low Risk |

---

## 📈 Current Status

| Feature | Status |
|---|---|
| Risk Engine | ✅ Fully Functional |
| Squadco Integration | ✅ Live Dispute Fetching |
| Defence Submission | ✅ Working |
| AI Layer | 🚧 Planned for Phase 2 |

---

## 🧭 Future Roadmap

- [ ] Advanced AI/ML risk scoring
- [ ] Real-time transaction scoring API
- [ ] Merchant credibility profiling
- [ ] Automated evidence collection
- [ ] Admin analytics dashboard
- [ ] Multi-merchant fraud intelligence network
- [ ] Webhook-based real-time alerts

---

## 💡 Use Case

ChargeGuard is ideal for:

- Nigerian e-commerce merchants
- Digital service providers
- Vendors processing online card payments
- Businesses facing frequent chargeback fraud

---

## 🤝 Contributing

Contributions, ideas, and feedback are welcome.

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Open a pull request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Authors

Built with ❤️ by Opaluwa Ismail and John Martins during a fintech hackathon to combat chargeback fraud in Nigeria.

---

## ⭐ Support

If you found this project useful, consider giving it a star on GitHub ⭐
