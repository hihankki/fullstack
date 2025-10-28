import React from 'react'

function Home() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Добро пожаловать на сайт отзывов!</h2>
      <p>Это главная страница</p>
      <button onClick={() => alert('Сайт работает!')}>
        Нажми меня
      </button>
    </div>
  )
}

export default Home