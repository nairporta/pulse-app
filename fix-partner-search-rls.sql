-- パートナー検索専用の安全な関数を作成
-- Supabaseダッシュボードで実行してください

-- パートナー検索専用の関数（RLSをバイパスしてSECURITY DEFINERで実行）
CREATE OR REPLACE FUNCTION find_partner_by_code(search_code TEXT)
RETURNS TABLE(user_id UUID, user_name TEXT, user_pairing_code TEXT)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  -- RLSをバイパスして直接検索
  RETURN QUERY
  SELECT id, name, pairing_code
  FROM users
  WHERE pairing_code = search_code
  LIMIT 1;
END;
$$;

-- 関数に適切な権限設定
REVOKE ALL ON FUNCTION find_partner_by_code(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION find_partner_by_code(TEXT) TO anon, authenticated;