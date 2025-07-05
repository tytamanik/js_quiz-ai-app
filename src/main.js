import Groq from 'groq-sdk'
import './style.scss'
const API_KEY = import.meta.env.VITE_GROQ_API_KEY
const topic = document.getElementById('topicInput')
const difficulty = document.getElementById('difficultySelect')
const startButton = document.getElementById('startButton')
const quizContainer = document.getElementById('quizContainer')
const groq = new Groq({ apiKey: API_KEY, dangerouslyAllowBrowser: true })
const scoreOutput = document.createElement('output')
let scoreCounter = 0
let attepmpts = 0
let currentQuestion = null
let currentAnswers = null
startButton.addEventListener('click', e => {
	e.preventDefault()
	if (currentQuestion) currentQuestion.remove()
	if (currentAnswers) currentAnswers.remove()
	createQuiz()
	scoreOutput.style.display = 'block'
	quizContainer.style.display = 'block'
})

scoreOutput.innerText = `Score: ${scoreCounter} out of ${attepmpts}`
scoreOutput.classList.add('card__progress')
quizContainer.append(scoreOutput)

async function createQuiz() {
	const completion = await groq.chat.completions
		.create({
			messages: [
				{
					role: 'user',
					content: `Generate 1 quiz question on topic ${topic.value}, difficulty should be ${difficulty.value}. Return a raw JSON object only. Each option (of total 3) must be a STRING that looks like this: "<li class=\\"card__answer\\">Answer</li>". Do not return HTML nodes. Return ONLY JSON. Example format:
{
  "question": "string",
  "options": [
   "<li class=\"card__answer\" data-answer=\"incorrect\">Answer 1</li>",
  "<li class=\"card__answer\" data-answer=\"correct\">Correct Answer</li>",
  "<li class=\"card__answer\" data-answer=\"incorrect\">Answer 3</li>"
  ]

}`,
				},
			],
			model: 'llama-3.3-70b-versatile',
		})
		.then(chatCompletion => {
			let response = JSON.parse(chatCompletion.choices[0].message.content)
			startQuiz(response)
		})
}
function startQuiz(response) {
	startButton.innerHTML = 'Start'
	startButton.setAttribute('disabled', 'true')
	let question = document.createElement('p')
	question.classList.add('card__question')
	question.textContent = response.question
	quizContainer.insertBefore(question, scoreOutput)
	let answersContainer = document.createElement('ul')
	answersContainer.classList.add('card__answers')
	answersContainer.innerHTML = response.options.join('')
	quizContainer.insertBefore(answersContainer, scoreOutput)
	currentQuestion = question
	currentAnswers = answersContainer
	attepmpts++
	scoreOutput.innerText = `Score: ${scoreCounter} out of ${attepmpts}`
	let answered = false
	answersContainer.addEventListener('click', e => {
		if (answered) return
		answered = true
		if (e.target.dataset.answer === 'correct') {
			scoreCounter++
			scoreOutput.innerText = `Score: ${scoreCounter} out of ${attepmpts}`
		}
		startButton.removeAttribute('disabled')
		startButton.innerHTML = 'Restart?'
		const restAnswers = document.querySelectorAll('.card__answer')
		restAnswers.forEach(answer => {
			if (answer.dataset.answer === 'correct') {
				answer.classList.add('card__answer--correct')
			} else {
				answer.classList.add('card__answer--wrong')
			}
		})
	})
}
