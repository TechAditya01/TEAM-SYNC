-- Function to update alert vote counts
CREATE OR REPLACE FUNCTION update_alert_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'up' THEN
      UPDATE public.alerts SET upvotes = upvotes + 1 WHERE id = NEW.alert_id;
    ELSIF NEW.vote_type = 'down' THEN
      UPDATE public.alerts SET downvotes = downvotes + 1 WHERE id = NEW.alert_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'up' THEN
      UPDATE public.alerts SET upvotes = upvotes - 1 WHERE id = OLD.alert_id;
    ELSIF OLD.vote_type = 'down' THEN
      UPDATE public.alerts SET downvotes = downvotes - 1 WHERE id = OLD.alert_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vote count updates
DROP TRIGGER IF EXISTS alert_vote_trigger ON public.alert_votes;
CREATE TRIGGER alert_vote_trigger
  AFTER INSERT OR DELETE ON public.alert_votes
  FOR EACH ROW EXECUTE FUNCTION update_alert_vote_counts();

-- Function to get nearby alerts (within radius in km)
CREATE OR REPLACE FUNCTION get_nearby_alerts(
  lat DECIMAL,
  lng DECIMAL,
  radius_km DECIMAL DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  category alert_category,
  title TEXT,
  description TEXT,
  location_lat DECIMAL,
  location_lng DECIMAL,
  location_address TEXT,
  severity severity_level,
  status verification_status,
  upvotes INTEGER,
  downvotes INTEGER,
  created_at TIMESTAMPTZ,
  distance_km DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.category,
    a.title,
    a.description,
    a.location_lat,
    a.location_lng,
    a.location_address,
    a.severity,
    a.status,
    a.upvotes,
    a.downvotes,
    a.created_at,
    (
      6371 * acos(
        cos(radians(lat)) * cos(radians(a.location_lat)) *
        cos(radians(a.location_lng) - radians(lng)) +
        sin(radians(lat)) * sin(radians(a.location_lat))
      )
    )::DECIMAL(10,2) AS distance_km
  FROM public.alerts a
  WHERE a.status IN ('verified', 'pending')
  AND (
    6371 * acos(
      cos(radians(lat)) * cos(radians(a.location_lat)) *
      cos(radians(a.location_lng) - radians(lng)) +
      sin(radians(lat)) * sin(radians(a.location_lat))
    )
  ) <= radius_km
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;
