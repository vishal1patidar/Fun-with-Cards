const container = document.querySelector('.container')
const verdictEl = document.querySelector('.verdict')
const deck = document.querySelector('.deck')
const stars = document.querySelectorAll('.tracker .stars .star')
const movesEl = document.querySelector('.moves')
const timeEl = document.querySelector('.time')
const cards = document.querySelectorAll('.card')
let clicks = 0
let moves = {
  total: 0,
  minimum: 16,
}
let score = 0
let time = {
  seconds: 0,
  minutes: 0,
  timeout: 5,
  minimum: 20,
}

window.onload = () => reshuffle()
deck.onclick = e => executeRound(e)

// The game runs once a click event happens in the `deck` container
function executeRound(e) {
  if (moves.total === 0 && time.seconds === 0) {
    startTimer()
  }

  if (e.target.classList.contains('holder')) {
    if (
      e.target.firstElementChild.classList.contains('active') ||
      e.target.firstElementChild.classList.contains('passed')
    ) {
      return
    } else {
      clicks++

      e.target.firstElementChild.classList.toggle('active')

      if (clicks === 1) {
        sessionStorage.setItem(
          'cardOne',
          e.target.firstElementChild.getAttribute('data-name')
        )
      }

      if (clicks === 2) {
        sessionStorage.setItem(
          'cardTwo',
          e.target.firstElementChild.getAttribute('data-name')
        )

        inspectCards(
          sessionStorage.getItem('cardOne'),
          sessionStorage.getItem('cardTwo')
        )

        clicks = 0
      }

      moves.total++
      updateMoves()
    }
  }
}

// Check if player's cards match
function inspectCards(cardOne, cardTwo) {
  cards.forEach(card => {
    card.parentElement.classList.add('active')
  })

  setTimeout(() => {
    cards.forEach(card => {
      if (cardOne === cardTwo) {
        if (
          card.getAttribute('data-name') === cardOne ||
          card.getAttribute('data-name') === cardTwo
        ) {
          card.classList.add('passed')
          updateScore()
          refreshCards()
        } else {
          card.parentElement.classList.remove('active')
        }
      } else {
        card.classList.remove('active')
        card.parentElement.classList.remove('active')
      }
    })
  }, 800)
}

/*
  Refresh player's score
  - We calculate the score based on the minumum moves and time
  needed to complete the game.
  - The faster and accurate a player is, the higher the score.
*/
function updateScore() {
  if (time.minutes >= 1) {
    score = Math.round(
      Math.floor(
        (((time.minimum / time.seconds) / ((time.minutes * 60) + time.seconds)) *
          (moves.minimum * moves.total) *
          5) /
        5
      )
    )
  } else {
    score = Math.round(
      Math.floor(
        (time.minimum / time.seconds) * (moves.minimum * moves.total) * 5
      ) / 20
    )
  }

  stars.forEach((star, index) => {
    if (score >= (index + 1) * 10) {
      star.classList.add('active')
    } else {
      star.classList.remove('active')
    }
  })
}

// Update moves as player plays
function updateMoves() {
  movesEl.innerHTML = `<p>Moves: ${moves.total}</p>`
}

// Check how many cards have been flipped and pass the verdict
function refreshCards() {
  const flippedCards = document.querySelectorAll('.card.passed').length
  const cardsRemaining = deck.children.length - flippedCards

  if (cardsRemaining === 0) {
    setTimeout(() => verdict(), 800)
  }
}

// Decide based on the users performance
function verdict() {
  const playermMssage = document.querySelector('.verdict .message')
  const playerTip = document.querySelector('.verdict .statement')
  const playerStars = document.querySelectorAll('.verdict .stats .stars .star')
  const playerMoves = document.querySelector('.verdict .stats .moves')
  const playerTime = document.querySelector('.verdict .stats .time')

  container.style.display = 'none'
  verdictEl.style.display = 'block'
  playerMoves.innerHTML = `<p>Moves: ${moves.total}</p>`
  playerTime.innerHTML = `<p>Time: ${time.minutes}m ${time.seconds}s</p>`

  playerStars.forEach((star, index) => {
    if (score >= (index + 1) * 10) {
      star.classList.add('active')
    } else {
      star.classList.remove('active')
    }
  })

  if (score > 30) {
    playermMssage.innerHTML = 'Congratulations!'
    playerTip.innerHTML = `You did well.`
  } else {
    playermMssage.innerHTML = 'Try again!'
    playerTip.innerHTML = `Your score was too low.`
  }

  if (time.minutes >= time.timeout) {
    playermMssage.innerHTML = 'Try again!'
    playerTip.innerHTML = `You took too long.`
  }
}

// Restart game
function restartGame() {
  container.style.display = 'block'
  verdictEl.style.display = 'none'

  if (moves.total > 0 || time.seconds > 0) {
    clicks = 0
    score = 0
    moves.total = 0
    time.seconds = 0
    time.minutes = 0

    cards.forEach(card => {
      card.classList.remove('active')
      card.classList.remove('passed')
    })

    stars.forEach(star => {
      star.classList.remove('active')
    })

    if (time.minutes >= time.timeout) {
      startTimer()
    }

    updateMoves()
    reshuffle()
  }
}

// Timer
function startTimer() {
  const x = setInterval(() => {
    let seconds = ++time.seconds

    if (seconds > 59) {
      time.minutes++
      time.seconds = 0
    }

    if (time.minutes === time.timeout) {
      clearInterval(x)
      verdict()
    }

    timeEl.innerHTML = `<p>Time: ${time.minutes}m ${time.seconds}s</p>`
  }, 1000)
}

// Re-shuffle cards
function reshuffle() {
  for (let i = deck.children.length; i >= 0; i--) {
    deck.appendChild(deck.children[Math.floor(Math.random() * i)])
  }
}
