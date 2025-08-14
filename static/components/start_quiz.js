export default {
    template: `
    <div class="container d-flex justify-content-center align-items-center vh-100">
      <div class="card shadow-lg p-4" style="width: 600px; border-radius: 15px;" v-if="questions.length > 0">
        
        <!-- Quiz Header -->
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div class="px-3 py-1 rounded bg-success text-white">
            <strong>QNo.</strong> {{ currentQuestionIndex + 1 }}/{{ questions.length }}
          </div>
          <div class="px-3 py-1 rounded bg-primary text-white">
            ⏳ {{ formattedTime }}
          </div>
        </div>
  
        <!-- Question Box -->
        <div class="border p-3 rounded mb-3 text-center bg-light">
          <h5 class="text-dark">{{ currentQuestion.question }}</h5>
        </div>
  
        <!-- Options -->
        <div class="mb-3">
          <div v-for="(option, index) in options" :key="index" class="form-check">
            <input 
              class="form-check-input" 
              type="radio" 
              :id="'option' + index" 
              v-model="answers[currentQuestionIndex]" 
              :value="option"
            />
            <label class="form-check-label" :for="'option' + index">
              {{ index + 1 }}) {{ option }}
            </label>
          </div>
        </div>
  
        <!-- Buttons -->
        <div class="d-flex justify-content-between">
          <button class="btn btn-primary" @click="nextQuestion">Save and Next</button>
          <button class="btn btn-success" @click="submitQuiz" v-if="currentQuestionIndex === questions.length - 1">Submit</button>
        </div>
  
      </div>
      <div v-else class="text-center mt-5">
        <p>Loading questions...</p>
      </div>
    </div>
    `,
    
    data() {
      return {
        questions: [],
        currentQuestionIndex: 0,
        answers: [],
        timeLeft: 900, // 15 minutes in seconds
        timer: null,
      };
    },
  
    computed: {
      currentQuestion() {
        return this.questions[this.currentQuestionIndex] || {};
      },
      options() {
        return this.currentQuestion
          ? [this.currentQuestion.option1, this.currentQuestion.option2, this.currentQuestion.option3, this.currentQuestion.option4]
          : [];
      },
      formattedTime() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      }
    },
  
    mounted() {
      this.fetchQuestions();
      this.startTimer();
    },
  
    methods: {
      fetchQuestions() {
        fetch(`/api/user/dashboard/quiz/${this.$route.params.quiz_id}`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authentication-Token": localStorage.getItem("token")
            }
        })
        .then(response => response.json())
        .then(data => {
          this.questions = data.questions;
          this.answers = new Array(this.questions.length).fill(null);
        });
      },
      nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
          this.currentQuestionIndex++;
        }
      },
      submitQuiz() {
        const answersObj = {}; // Declare answersObj properly
        this.answers.forEach((option, index) => {
        if (option !== null) {
            answersObj[this.questions[index].id] = option;
    }
  });
  
        fetch(`/api/user/quiz/${this.$route.params.quiz_id}`,{
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authentication-Token": localStorage.getItem("token")
            },
            body: JSON.stringify({ answers: answersObj }),

        })
        .then(response => response.json())
        .then(() => {
          alert("Quiz submitted successfully!");
          this.$router.push('/user/dashboard'); 
        });
      },
      startTimer() {
        this.timer = setInterval(() => {
          if (this.timeLeft > 0) {
            this.timeLeft--;
          } else {
            clearInterval(this.timer);
            this.submitQuiz();
          }
        }, 1000);
      }
    },
    beforeUnmount() {
      clearInterval(this.timer);
    }
  };
