-- パートナー情報取得用の安全な関数を作成
-- Supabaseダッシュボードで実行してください

-- 自分のパートナー情報を取得する専用関数（RLSバイパス）
CREATE OR REPLACE FUNCTION get_user_with_partner_info(user_id_param UUID)
RETURNS TABLE(
  id UUID, 
  name TEXT, 
  pairing_code TEXT,
  partner_id UUID,
  partner_name TEXT,
  partner_pairing_code TEXT
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.pairing_code,
    u.partner_id,
    p.name as partner_name,
    p.pairing_code as partner_pairing_code
  FROM users u
  LEFT JOIN users p ON u.partner_id = p.id
  WHERE u.id = user_id_param;
END;
$$;

-- 関数に適切な権限設定
REVOKE ALL ON FUNCTION get_user_with_partner_info(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_user_with_partner_info(UUID) TO anon, authenticated;