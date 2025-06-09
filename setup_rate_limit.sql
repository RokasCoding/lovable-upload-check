-- Create rate limits table if it doesn't exist
create table if not exists public.rate_limits (
  id uuid primary key default gen_random_uuid(),
  ip text,
  email text,
  endpoint text not null,
  attempts int default 1,
  last_attempt timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  unique(ip, email, endpoint)
);

-- Enable RLS
alter table public.rate_limits enable row level security;

-- Allow all authenticated users to use rate limits
create policy "Enable all access to rate_limits"
on public.rate_limits for all
using (true)
with check (true);

-- Function to check and update rate limits
create or replace function check_rate_limit(
  client_ip text,
  user_email text,
  endpoint_name text,
  max_attempts int default 5,
  window_minutes int default 15
)
returns boolean
language plpgsql
security definer
as $$
declare
  current_attempts int;
  last_try timestamp with time zone;
begin
  -- Get current attempts
  select attempts, last_attempt into current_attempts, last_try
  from public.rate_limits
  where (ip = client_ip or email = user_email) and endpoint = endpoint_name;
  
  -- If no record exists, create one and allow
  if current_attempts is null then
    insert into public.rate_limits (ip, email, endpoint)
    values (client_ip, user_email, endpoint_name);
    return true;
  end if;
  
  -- Check if window has expired
  if now() - last_try > (window_minutes || ' minutes')::interval then
    -- Reset attempts
    update public.rate_limits
    set attempts = 1, last_attempt = now()
    where (ip = client_ip or email = user_email) and endpoint = endpoint_name;
    return true;
  end if;
  
  -- Check if max attempts reached
  if current_attempts >= max_attempts then
    return false;
  end if;
  
  -- Increment attempts
  update public.rate_limits
  set attempts = attempts + 1, last_attempt = now()
  where (ip = client_ip or email = user_email) and endpoint = endpoint_name;
  
  return true;
end;
$$; 