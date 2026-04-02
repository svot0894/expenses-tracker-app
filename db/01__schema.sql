-- create 'families' table
create table public.families (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

-- create 'family_members' table
create table public.family_members (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

-- Create 'categories' table
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  family_id uuid references public.families(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  name text
);

-- Create 'expenses' table
create table public.expenses (
  id uuid default gen_random_uuid() primary key,
  family_id uuid references public.families(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  description text,
  amount float not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  date date not null
);

-- Create 'incomes' table
create table public.incomes (
  id uuid default gen_random_uuid() primary key,
  family_id uuid references public.families(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  source text,
  amount float not null,
  frequency text,
  date date not null
);

-- Create 'investments' table
create table public.investments (
  id uuid default gen_random_uuid() primary key,
  family_id uuid references public.families(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  description text,
  type text,
  amount float not null,
  currentValue float not null,
  purchaseDate date not null
);