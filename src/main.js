import Groq from 'groq-sdk'
import './style.scss'
const API_KEY = import.meta.env.VITE_GROQ_API_KEY
const topic = document.getElementById('topicInput')
const difficulty = document.getElementById('difficultySelect')
const startButton = document.getElementById('startButton')
const quizContainer = document.getElementById('quizContainer')
const answersContainer = document.getElementById('answersContainer')

const groq = new Groq({ apiKey: API_KEY, dangerouslyAllowBrowser: true })

startButton.addEventListener('click', e => {
	e.preventDefault()
	createQuiz()
})

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
    "<li class=\\"card__answer\\">...</li>",
    "<li class=\\"card__answer\\">...</li>",
    "<li class=\\"card__answer\\">...</li>"
  ],
  "correct": "<li class=\\"card__answer\\">...</li>"
}`,
				},
			],
			model: 'llama-3.3-70b-versatile',
		})
		.then(chatCompletion => {
			startButton.setAttribute('disabled', 'true')
			console.log(chatCompletion.choices[0].message.content)
			let response = JSON.parse(chatCompletion.choices[0].message.content)
			let question = document.createElement('p')
			question.classList.add('card__question')
			question.innerHTML = `${response.question}`
			quizContainer.append(question)
			let answersContainer = document.createElement('ul')
			answersContainer.classList.add('card__answers')
			answersContainer.innerHTML = `${response.options.join('')}`
			quizContainer.append(answersContainer)
			console.log(response)
		})
}
