📦 SmartInventory AI
Inventory Management with Market Intelligence
SmartInventory is a full-stack dashboard designed to manage stock levels while using AI-driven market analysis. It helps businesses track products, monitor shortfalls, and stay updated with real-time economic news from the Indian market.

🚀 Features
Real-time Dashboard: Track total nodes (products) and current stock shortfalls at a glance.
Inventory Management: Seamlessly add new products and manage existing stock.
AI Market News: Integration with NewsAPI to fetch the latest trends in the Indian retail and economy sectors.
Dynamic Visuals: Clean, modern UI built with React and Tailwind CSS.
FastAPI Backend: High-performance Python backend for database communication.

🛠️ Tech Stack
Frontend: React.js, Tailwind CSS, Lucide React (Icons).
Backend: Python, FastAPI, Uvicorn.
Database: Supabase (PostgreSQL).
APIs: NewsAPI for market intelligence.

📋 Installation & Setup
1. Clone the Project
Bash
git clone <your-repo-link>
cd "new project 2"

2. Backend Setup
Navigate to the backend folder: cd backend
Create and activate a virtual environment:
Bash
python -m venv venv
.\venv\Scripts\activate
Install dependencies:
Bash
pip install fastapi uvicorn supabase pydantic requests
Run the server:
Bash
python main.py

3. Frontend Setup
Navigate to the project root and install dependencies:
Bash
npm install
Start the development server:
Bash

npm run dev
⚙️ Environment Configuration
Make sure your main.py (Backend) and your Supabase config (Frontend) include your specific credentials:
Supabase URL: https://nlyvivelvwbzskefxxob.supabase.co
Service Role Key: (Keep this private!)
NewsAPI Key: Used for fetching economic data.

🛡️ Database Policies (Current Configuration)
The project currently uses Open Access Policies for rapid development. The following Row Level Security (RLS) rules are applied to the products table:
Enable read access for all users
Enable insert access for all users
Enable update access for all users
Enable delete access for all users
