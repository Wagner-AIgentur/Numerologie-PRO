-- ============================================================
-- 019: Advanced Analytics Functions
-- Server-side aggregation for revenue, lead sources, sequences
-- ============================================================

-- ── Revenue by period (daily/weekly/monthly aggregation) ──
CREATE OR REPLACE FUNCTION revenue_by_period(
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  granularity TEXT DEFAULT 'daily'
)
RETURNS TABLE(period TEXT, revenue_cents BIGINT, order_count BIGINT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE granularity
      WHEN 'daily'   THEN to_char(o.created_at, 'YYYY-MM-DD')
      WHEN 'weekly'  THEN to_char(date_trunc('week', o.created_at), 'YYYY-"W"IW')
      WHEN 'monthly' THEN to_char(o.created_at, 'YYYY-MM')
      ELSE to_char(o.created_at, 'YYYY-MM-DD')
    END AS period,
    COALESCE(SUM(o.amount_cents), 0)::BIGINT AS revenue_cents,
    COUNT(*)::BIGINT AS order_count
  FROM public.orders o
  WHERE o.status = 'paid'
    AND o.created_at >= start_date
    AND o.created_at <= end_date
  GROUP BY 1
  ORDER BY 1;
END;
$$;

-- ── Source conversion stats (which lead sources convert best) ──
CREATE OR REPLACE FUNCTION source_conversion_stats()
RETURNS TABLE(
  source TEXT,
  total_leads BIGINT,
  verified_leads BIGINT,
  converted_leads BIGINT,
  conversion_rate NUMERIC
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.source,
    COUNT(*)::BIGINT AS total_leads,
    COUNT(*) FILTER (WHERE l.email_verified = true)::BIGINT AS verified_leads,
    COUNT(*) FILTER (WHERE l.converted = true)::BIGINT AS converted_leads,
    CASE
      WHEN COUNT(*) > 0
      THEN ROUND((COUNT(*) FILTER (WHERE l.converted = true)::NUMERIC / COUNT(*)::NUMERIC) * 100, 1)
      ELSE 0
    END AS conversion_rate
  FROM public.leads l
  GROUP BY l.source
  ORDER BY total_leads DESC;
END;
$$;

-- ── Sequence performance stats ──
CREATE OR REPLACE FUNCTION sequence_performance_stats()
RETURNS TABLE(
  sequence_id UUID,
  sequence_name TEXT,
  total_enrolled BIGINT,
  active_enrolled BIGINT,
  completed BIGINT,
  completion_rate NUMERIC
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id AS sequence_id,
    s.name AS sequence_name,
    COUNT(e.id)::BIGINT AS total_enrolled,
    COUNT(e.id) FILTER (WHERE e.status = 'active')::BIGINT AS active_enrolled,
    COUNT(e.id) FILTER (WHERE e.status = 'completed')::BIGINT AS completed,
    CASE
      WHEN COUNT(e.id) > 0
      THEN ROUND((COUNT(e.id) FILTER (WHERE e.status = 'completed')::NUMERIC / COUNT(e.id)::NUMERIC) * 100, 1)
      ELSE 0
    END AS completion_rate
  FROM public.email_sequences s
  LEFT JOIN public.email_sequence_enrollments e ON e.sequence_id = s.id
  GROUP BY s.id, s.name
  ORDER BY total_enrolled DESC;
END;
$$;
