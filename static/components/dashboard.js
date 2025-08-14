export default {
  template: `
  <div class="bg-container">
    <div class="container mt-4">
      <div class="card shadow-sm p-3 bg-white bg-opacity-75">
        <h4 class="text-center text-dark mb-3 border-bottom pb-2">Upcoming Quizzes</h4>
        <div class ="text-end my-2">
          <router-link class="btn btn-success text-white fw-bold px-3 py-1" to="/scores">Scores</router-link>
        </div>
        <div class="table-responsive">
          <table class="table table-bordered text-center">
            <thead class="table-primary">
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Time</th>
                <th>Duration (hh:mm)</th>
                <th>Remark</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="quiz in quizzes" :key="quiz.id">
                <td>{{ quiz.id }}</td>
                <td>{{ quiz.quiz_date }}</td>
                <td>{{ quiz.quiz_time }}</td>
                <td>{{ quiz.time_duration }}</td>
                <td>{{ quiz.remark }}</td>
                <td>
                  <button class="btn btn-success btn-sm" @click="openModal(quiz)">Start</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Bootstrap Modal -->
    <div class="modal fade" id="quizModal" tabindex="-1" aria-labelledby="quizModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="quizModalLabel">Start Quiz</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p><strong>Date:</strong> {{ selectedQuiz.quiz_date || 'N/A' }}</p>
            <p><strong>Time:</strong> {{ selectedQuiz.quiz_time || 'N/A' }}</p>
            <p><strong>Duration:</strong> {{ selectedQuiz.time_duration || 'N/A' }}</p>
            <p><strong>Remark:</strong> {{ selectedQuiz.remark || 'N/A' }}</p>
            <h6>Instructions:</h6>
            <ul>
              <li>The quiz timer will start immediately after you begin.</li>
              <li>You must complete the quiz within the given time.</li>
              <li>Do not refresh or leave the page once the quiz starts.</li>
            </ul>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" @click="startQuiz(selectedQuiz.id)">Begin Quiz</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  data() {
    return {
      quizzes: [],
      selectedQuiz: {}
    };
  },
  mounted() {
    this.fetchQuizzes();
  },
  methods: {
    fetchQuizzes() {
      fetch('/api/user/dashboard', {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("token")
        }
      })
      .then(response => response.json())
      .then(data => {
        this.quizzes = data.quizzes;
      })

    },
    openModal(quiz) {
      this.selectedQuiz = quiz;
      const modal = new bootstrap.Modal(document.getElementById('quizModal'));
      modal.show();
    },
    startQuiz(id) {
      this.$router.push(`/user/dashboard/quiz/${id}`);
    }
  }
}
