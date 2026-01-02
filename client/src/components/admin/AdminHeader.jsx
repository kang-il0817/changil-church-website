function AdminHeader({ title, onBack, onLogout, onHome }) {
  return (
    <div className="admin-header">
      <h1 className="admin-title">{title}</h1>
      <div className="admin-header-buttons">
        {onHome && (
          <button onClick={onHome} className="home-button">
            홈으로 돌아가기
          </button>
        )}
        {onBack && (
          <button onClick={onBack} className="back-to-main-button">
            ← 메인으로
          </button>
        )}
        <button onClick={onLogout} className="logout-button">
          로그아웃
        </button>
      </div>
    </div>
  )
}

export default AdminHeader

