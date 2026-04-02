alter table "families" enable row level security;
alter table "family_members" enable row level security;
alter table "expenses" enable row level security;
alter table "incomes" enable row level security;
alter table "investments" enable row level security;
alter table "categories" enable row level security;


/* Expenses-related policies */
create policy "Families: members can view expenses"
on "expenses" for select
to authenticated
using (
  exists (
    select 1
    from "family_members" fm
    where fm."family_id" = "expenses"."family_id"
      and fm."user_id" = auth.uid()
  )
);

create policy "Families: members can insert expenses"
on "expenses" for insert
to authenticated
with check (
  exists (
    select 1
    from "family_members" fm
    where fm."family_id" = "expenses"."family_id"
      and fm."user_id" = auth.uid()
  )
);

create policy "Families: members can update expenses"
on "expenses" for update
to authenticated
using (
  exists (
    select 1
    from "family_members" fm
    where fm."family_id" = "expenses"."family_id"
      and fm."user_id" = auth.uid()
  )
)
with check (
  exists (
    select 1
    from "family_members" fm
    where fm."family_id" = "expenses"."family_id"
      and fm."user_id" = auth.uid()
  )
);

create policy "Families: members can delete expenses"
on "expenses" for delete
to authenticated
using (
  exists (
    select 1
    from "family_members" fm
    where fm."family_id" = "expenses"."family_id"
      and fm."user_id" = auth.uid()
  )
);

/* Incomes-related policies */
create policy "Families: members can view incomes"
on "incomes" for select
to authenticated
using (
  exists (
    select 1
    from "family_members" fm
    where fm."family_id" = "incomes"."family_id"
      and fm."user_id" = auth.uid()
  )
);

create policy "Families: members can insert incomes"
on "incomes" for insert
to authenticated
with check (
  exists (
    select 1
    from "family_members" fm
    where fm."family_id" = "incomes"."family_id"
      and fm."user_id" = auth.uid()
  )
);

create policy "Families: members can update incomes"
on "incomes" for update
to authenticated
using (
  exists (
    select 1
    from "family_members" fm
    where fm."family_id" = "incomes"."family_id"
      and fm."user_id" = auth.uid()
  )
)
with check (
  exists (
    select 1
    from "family_members" fm
    where fm."family_id" = "incomes"."family_id"
      and fm."user_id" = auth.uid()
  )
);

create policy "Families: members can delete incomes"
on "incomes" for delete
to authenticated
using (
  exists (
    select 1
    from "family_members" fm
    where fm."family_id" = "incomes"."family_id"
      and fm."user_id" = auth.uid()
  )
);

/* Investments-related policies */
create policy "Families: members can view investments"
on "investments" for select
to authenticated
using (
  exists (
    select 1
    from "family_members" fm
    where fm."family_id" = "investments"."family_id"
      and fm."user_id" = auth.uid()
  )
);

create policy "Families: members can insert investments"
on "investments" for insert
to authenticated
with check (
  exists (
    select 1
    from "family_members" fm
    where fm."family_id" = "investments"."family_id"
      and fm."user_id" = auth.uid()
  )
);

create policy "Families: members can update investments"
on "investments" for update
to authenticated
using (
  exists (
    select 1
    from "family_members" fm
    where fm."family_id" = "investments"."family_id"
      and fm."user_id" = auth.uid()
  )
)
with check (
  exists (
    select 1
    from "family_members" fm
    where fm."family_id" = "investments"."family_id"
      and fm."user_id" = auth.uid()
  )
);

create policy "Families: members can delete investments"
on "investments" for delete
to authenticated
using (
  exists (
    select 1
    from "family_members" fm
    where fm."family_id" = "investments"."family_id"
      and fm."user_id" = auth.uid()
  )
);

/* Categories-related policies */
create policy "Families: members can view categories"
on "categories" for select
to authenticated
using (
  exists (
    select 1
    from "family_members" fm
    where fm."family_id" = "categories"."family_id"
      and fm."user_id" = auth.uid()
  )
);

create policy "Families: members can insert categories"
on "categories" for insert
to authenticated
with check (
  exists (
    select 1
    from "family_members" fm
    where fm."family_id" = "categories"."family_id"
      and fm."user_id" = auth.uid()
  )
);

create policy "Families: members can update categories"
on "categories" for update
to authenticated
using (
  exists (
    select 1
    from "family_members" fm
    where fm."family_id" = "categories"."family_id"
      and fm."user_id" = auth.uid()
  )
)
with check (
  exists (
    select 1
    from "family_members" fm
    where fm."family_id" = "categories"."family_id"
      and fm."user_id" = auth.uid()
  )
);

create policy "Families: members can delete categories"
on "categories" for delete
to authenticated
using (
  exists (
    select 1
    from "family_members" fm
    where fm."family_id" = "categories"."family_id"
      and fm."user_id" = auth.uid()
  )
);