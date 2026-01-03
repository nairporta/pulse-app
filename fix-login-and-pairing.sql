-- ログイン機能とペアリング機能の修正
-- Supabaseダッシュボードで実行してください

-- 名前とペアリングコードでユーザーを検索する専用関数
CREATE OR REPLACE FUNCTION find_user_by_name_and_code(search_name TEXT, search_code TEXT)
RETURNS TABLE(
  user_id UUID, 
  user_name TEXT, 
  user_pairing_code TEXT
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id,
    name,
    pairing_code
  FROM users
  WHERE name = search_name AND pairing_code = search_code
  LIMIT 1;
END;
$$;

-- 関数に適切な権限設定
REVOKE ALL ON FUNCTION find_user_by_name_and_code(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION find_user_by_name_and_code(TEXT, TEXT) TO anon, authenticated;