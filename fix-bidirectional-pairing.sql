-- 双方向ペアリング機能の修正
-- Supabaseダッシュボードで実行してください

-- 双方向でユーザーをペアリングする専用関数
CREATE OR REPLACE FUNCTION pair_users_bidirectional(current_user_id UUID, partner_code TEXT)
RETURNS TABLE(
  success BOOLEAN,
  paired_user1_id UUID,
  paired_user2_id UUID,
  result_message TEXT
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  user2_record RECORD;
  update_count INTEGER;
BEGIN
  -- ペアリングコードでユーザー2を検索
  SELECT id, name, pairing_code INTO user2_record
  FROM users
  WHERE pairing_code = partner_code
  LIMIT 1;
  
  -- ユーザー2が見つからない場合
  IF user2_record.id IS NULL THEN
    RETURN QUERY SELECT FALSE, current_user_id, NULL::UUID, 'Partner not found with that pairing code';
    RETURN;
  END IF;
  
  -- 自分自身とのペアリングを防ぐ
  IF current_user_id = user2_record.id THEN
    RETURN QUERY SELECT FALSE, current_user_id, user2_record.id, 'Cannot pair with yourself';
    RETURN;
  END IF;
  
  -- 両方のユーザーのpartner_idを更新
  UPDATE users SET partner_id = user2_record.id WHERE id = current_user_id;
  GET DIAGNOSTICS update_count = ROW_COUNT;
  
  IF update_count = 0 THEN
    RETURN QUERY SELECT FALSE, current_user_id, user2_record.id, 'Failed to update user1 partner_id';
    RETURN;
  END IF;
  
  UPDATE users SET partner_id = current_user_id WHERE id = user2_record.id;
  GET DIAGNOSTICS update_count = ROW_COUNT;
  
  IF update_count = 0 THEN
    -- user1の更新をロールバック
    UPDATE users SET partner_id = NULL WHERE id = current_user_id;
    RETURN QUERY SELECT FALSE, current_user_id, user2_record.id, 'Failed to update user2 partner_id';
    RETURN;
  END IF;
  
  -- 成功
  RETURN QUERY SELECT TRUE, current_user_id, user2_record.id, 'Users paired successfully';
  RETURN;
END;
$$;

-- 関数に適切な権限設定
REVOKE ALL ON FUNCTION pair_users_bidirectional(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION pair_users_bidirectional(UUID, TEXT) TO anon, authenticated;