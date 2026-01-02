import { createClient } from '@supabase/supabase-js'

// Supabase 클라이언트 생성
// 환경 변수에서 가져오기
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 환경 변수 확인
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase 환경 변수가 설정되지 않았습니다.')
  console.warn('📝 client 폴더에 .env 파일을 생성하고 다음 내용을 추가하세요:')
  console.warn('   VITE_SUPABASE_URL=https://your-project.supabase.co')
  console.warn('   VITE_SUPABASE_ANON_KEY=your-anon-key')
}

// Supabase 클라이언트 생성 (환경 변수가 없어도 빈 문자열로 생성하여 오류 방지)
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Storage bucket 이름 (Supabase에서 생성한 bucket 이름)
export const GALLERY_BUCKET = 'gallery-images'
export const BULLETIN_BUCKET = 'bulletins'

