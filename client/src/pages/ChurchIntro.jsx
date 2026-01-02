import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './ChurchIntro.css'

function ChurchIntro() {
  const [activeTab, setActiveTab] = useState('pastor') // 기본: 담임목사 인사
  const [openItem, setOpenItem] = useState(null) // 열린 교회 유형 항목

  const tabs = [
    { id: 'pastor', label: '담임목사 인사' },
    { id: 'church', label: '사역철학' },
    { id: 'ci', label: 'CI 소개' }
  ]

  const churchTypes = [
    { 
      id: 1, 
      title: '하나님 나라 복음을 전파하는 교회', 
      content: `예수님이 선포하신 복음은 개인의 영혼구원에 한정된 것이 아니라, 이 땅에 임한 하나님 나라(하나님의 통치)였습니다. 성경이 말하는 하나님 나라는 구약의 언약 역사 속에서 예언되었고, 예수의 십자가와 부활로 성취되었으며, 그분의 다시 오심으로 완성될 것입니다. 그러므로 하나님 나라는 성령 안에서 경험되는 종말론적 생명의 현실입니다.
이렇게 복음을 하나님 나라의 관점에서 이해할 때, 교회는 예수님을 왕으로 고백하며 세상 속에서 새로운 삶과 실천의 변화를 살아가게 됩니다.` 
    },
    { 
      id: 2, 
      title: '성령의 능력 안에 있는 선교적 교회', 
      content: `우리는 하나님 나라를 지향하는 선교적 공동체로서, 모든 삶의 영역을 하나님의 통치와 선교의 현장으로 이해합니다. 선교는 교회가 선택적으로 하는 활동이 아니라, 삼위일체 하나님의 본성에서 비롯된 교회의 정체성입니다. 따라서 신앙은 교회 안의 신앙생활을 넘어, 일상 전체에서 소명으로 살아가는 생활신앙으로 전환되어야 합니다. 교회는 지역사회 속에서 이웃 사랑을 실천하는 선한 이웃이 되어야 하며, 세계 선교를 위해 선교사들과 지속적으로 소통하고 협력하는 네트워크 공동체로 살아가야 합니다.` 
    },
    { 
      id: 3, 
      title: '초대교회와 같은 가정 목장의 교회', 
      content: `바울이 에베소 감옥의 간수를 향해 "주 예수를 믿으시오. 그리하면 그대와 그대의 집안이 구원을 얻을 것입니다"(행 16:31)라고 선포한 것은 회심이 개인적 사건이면서 동시에 공동체적· 문화적 사건임을 보여줍니다. 초대교회는 가정에서 말씀과 주의 만찬을 나누는 가정교회로 시작되었고, 이것이 교회 성장의 중요한 기반이 되었습니다.
우리는 오늘날 가정이 자녀 신앙 전수와 부부의 신앙 대화를 강화하는 성경적이고 선교적인 사역의 장임을 기억합니다. 다만 다양한 가족 형태가 존재하는 현대 사회에서, 배제 없이 참여할 수 있는 가정목장 모델을 마련하는 것이 우리의 중요한 과제입니다.` 
    },
    { 
      id: 4, 
      title: '모두가 함께 섬기는 교회', 
      content: `개신교의 다양한 교회 정치 전통은 교회의 결정권을 분산하고 공동 책임을 실현하려는 시도였으며, 이는 교회 민주주의와 팀사역의 신학적 뿌리라 할 수 있습니다. 신약 교회는 한 사람의 카리스마에 의존하는 구조가 아니라, 성령이 주신 다양한 은사를 존중하며 함께 사역하는 공동체였습니다. 따라서 팀사역은 단순한 운영 방식이 아니라, 만민에게 성령을 주신 하나님의 약속을 신뢰하고 실천하는 성령론적 삶의 결과입니다.` 
    }
  ]

  const handleItemClick = (itemId) => {
    setOpenItem(openItem === itemId ? null : itemId)
  }

  return (
    <div className="church-intro-page">
      <Header />
      <div className="church-intro-container">
        <div className="church-intro-header">
          <h1 className="church-intro-title">교회소개</h1>
          <div className="church-intro-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="church-intro-content">
          {activeTab === 'pastor' && (
            <div className="tab-content">
              <div className="pastor-greeting-section">
                <div className="pastor-greeting-content">
                  <div className="pastor-greeting-text">
                    <p className="pastor-quote">
                      "우리 세계에서 별은 그저 활활 타오르는 거대한 가스 덩어리에요."<br />
                      "얘야, 사실 너희 세계에서도 별은 그런 것이 아니란다.<br />
                      별이 무엇으로 만들어졌는지가 곧 별이 무엇인지를 말해주는 것은 아니란다."<br />
                      - C. S. 루이스, 나니아 연대기 〈새벽 출정호의 항해〉 중
                    </p>
                    <p>
                      언젠가부터 우리는 세상을 효율의 언어로만 이해하려 합니다.<br />
                      하지만 그럴수록 우리의 삶에서는 신비와 경이, 참된 만남은 조금씩 사라져 갑니다.<br />
                      하나님은 복음으로 우리를 부르시고 우리와 마주하시는 인격적인 분이십니다.<br />
                      그리고 하나님을 만나는 그 자리에서<br />
                      우리는 비로소 서로를 '대상'이 아닌 '이웃'으로 다시 만납니다.
                    </p>
                    <p>
                      창일교회는 이러한 참된 만남을 지향합니다.<br />
                      말씀과 기도를 통해 하나님을 만나고,<br />
                      그 만남의 자리에서 서로의 삶을 존중하며<br />
                      함께 걸어가는 만남의 공동체를 꿈꿉니다.
                    </p>
                    <p>
                      의미와 경이가 다시 살아나는 여정,<br />
                      하나님과 이웃을 인격으로 마주하는 이 아름다운 길에<br />
                      여러분을 진심으로 초대합니다.
                    </p>
                  </div>
                </div>
                <div className="pastor-photo-container">
                  <div className="pastor-photo-placeholder">
                    <span className="pastor-photo-text">담임목사 사진</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'church' && (
            <div className="tab-content">
                <div className="church-intro-description">
                  <p className="intro-subtitle">
                    다시 일천척을 척량하니 물이 내가 건너지 못할 강이 된지라<br />
                    그 물이 창일하여 헤엄할 물이요 사람이 능히 건너지 못할 강이더라(겔 47:5)
                  </p>
                </div>
              
              <div className="church-vision-section">
                <div className="content-body vision-text">
                  <p>
                    "창일"은 성전에서 시작된 하나님의 영광이 온 세상에 충만해지는 에스겔 47장의 비전을 의미합니다. 
                    <p></p>우리는 하나님의 영광이 온 세상에 충만해질 것을 기대하며 다음과 같은 가치를 공유합니다.
                  </p>
                </div>
              </div>

              <div className="church-types-section">
                <ol className="church-types-list">
                  {churchTypes.map((item) => (
                    <li key={item.id} className="church-type-item">
                      <div 
                        className={`church-type-header ${openItem === item.id ? 'active' : ''}`}
                        onClick={() => handleItemClick(item.id)}
                      >
                        <span className="church-type-title">{item.title}</span>
                        <span className="church-type-arrow">
                          {openItem === item.id ? '▼' : '▶'}
                        </span>
                      </div>
                      {openItem === item.id && (
                        <div className="church-type-content">
                          <div className="church-type-content-inner">
                            {item.content || '내용을 입력해주세요.'}
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="church-affiliation-section">
                <p className="church-affiliation-text">
                  창일교회는 기독교한국침례회에 소속된 건강한 교회로,<br />
                  기독교한국침례회의 신학과 전통을 준수합니다.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'ci' && (
            <div className="tab-content">
              <h2 className="content-title">CI 소개</h2>
              <div className="content-body">
                <p>준비중입니다.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default ChurchIntro

