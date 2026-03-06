-- SpentControl - Schema SQL
-- Ejecutar en Supabase > SQL Editor

-- Transactions
create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  description text not null,
  amount numeric(12, 2) not null,
  type text not null check (type in ('INCOME', 'EXPENSE')),
  category text not null default 'other',
  date date not null,
  created_at timestamptz default now()
);
alter table transactions enable row level security;
create policy "Users own transactions" on transactions for all using (auth.uid() = user_id);

-- Budgets
create table if not exists budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null,
  limit_amount numeric(12, 2) not null,
  month int not null,
  year int not null,
  created_at timestamptz default now(),
  unique(user_id, category, month, year)
);
alter table budgets enable row level security;
create policy "Users own budgets" on budgets for all using (auth.uid() = user_id);

-- Fixed Payments
create table if not exists fixed_payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  amount numeric(12, 2) not null,
  category text not null default 'services',
  frequency text not null default 'MONTHLY' check (frequency in ('DAILY','WEEKLY','MONTHLY','YEARLY')),
  day_of_month int not null default 1 check (day_of_month between 1 and 31),
  color text not null default '#ff6b35',
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table fixed_payments enable row level security;
create policy "Users own fixed_payments" on fixed_payments for all using (auth.uid() = user_id);

-- Fixed Payment Status (paid/unpaid per month)
create table if not exists fixed_payment_status (
  id uuid default gen_random_uuid() primary key,
  fixed_payment_id uuid references fixed_payments(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  month int not null,
  year int not null,
  is_paid boolean default false,
  unique(fixed_payment_id, month, year)
);
alter table fixed_payment_status enable row level security;
create policy "Users own fixed_payment_status" on fixed_payment_status for all using (auth.uid() = user_id);

-- Saving Goals
create table if not exists saving_goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  target_amount numeric(12, 2) not null,
  saved_amount numeric(12, 2) not null default 0,
  target_date date not null,
  color text not null default '#ff6b35',
  created_at timestamptz default now()
);
alter table saving_goals enable row level security;
create policy "Users own saving_goals" on saving_goals for all using (auth.uid() = user_id);
