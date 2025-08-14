export default {
  template: `
    <div class="container mt-4">
  <div class="card shadow-lg p-3 rounded-4 border-0" style="max-width: 500px; margin: auto;">
    <h2 class="mb-3 text-center text-black fw-bold" style="font-size: 1.5rem;">Manage Quiz Questions</h2>
    
    <!-- Add Question Form -->
    <form @submit.prevent="addQuestion">
      <div class="mb-2">
        <label class="form-label fw-bold" style="font-size: 0.9rem;">Question</label>
        <input v-model="newQuestion.question" type="text" class="form-control rounded-pill" required placeholder="Enter question" />
      </div>
      
      <div class="mb-2">
        <label class="form-label fw-bold" style="font-size: 0.9rem;">Options</label>
        <input v-model="newQuestion.option1" type="text" class="form-control mb-2 rounded-pill" required placeholder="Option 1" />
        <input v-model="newQuestion.option2" type="text" class="form-control mb-2 rounded-pill" required placeholder="Option 2" />
        <input v-model="newQuestion.option3" type="text" class="form-control mb-2 rounded-pill" required placeholder="Option 3" />
        <input v-model="newQuestion.option4" type="text" class="form-control rounded-pill" required placeholder="Option 4" />
      </div>
      
      <div class="mb-2">
        <label class="form-label fw-bold" style="font-size: 0.9rem;">Correct Answer</label>
        <select v-model="newQuestion.answer" class="form-select rounded-pill" required>
          <option disabled value="">Select the correct answer</option>
          <option v-if="newQuestion.option1" :value="newQuestion.option1">{{ newQuestion.option1 }}</option>
          <option v-if="newQuestion.option2" :value="newQuestion.option2">{{ newQuestion.option2 }}</option>
          <option v-if="newQuestion.option3" :value="newQuestion.option3">{{ newQuestion.option3 }}</option>
          <option v-if="newQuestion.option4" :value="newQuestion.option4">{{ newQuestion.option4 }}</option>
        </select>
      </div>
      
      <button type="submit" class="btn btn-black w-100 rounded-pill shadow-sm" style="font-size: 0.9rem;">Add Question</button>
    </form>
  </div>

  <!-- Questions List -->
  <div v-if="questions.length" class="mt-5">
    <h3 class="text-center text-secondary">Existing Questions</h3>
    <div class="list-group shadow-sm rounded-3">
      <div v-for="question in questions" :key="question.id" class="list-group-item d-flex justify-content-between align-items-center border-0 py-2 px-4">
        <div>
          <h5 class="fw-bold text-dark">{{ question.question }}</h5>
          <ul class="list-unstyled mt-2 text-muted small">
            <li>{{ question.option1 }}</li>
            <li>{{ question.option2 }}</li>
            <li>{{ question.option3 }}</li>
            <li>{{ question.option4 }}</li>
          </ul>
        </div>
        <div>
          <button @click="editQuestion(question)" class="btn btn-warning btn-sm me-2 shadow-sm">Edit</button>
          <button @click="deleteQuestion(question.id)" class="btn btn-danger btn-sm shadow-sm">Delete</button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center mt-4">
    <p class="text-muted">No questions added yet.</p>
  </div>

  <!-- Edit Question Modal -->
  <div class="modal fade" id="editModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content rounded-4">
        <div class="modal-header bg-primary text-white rounded-top-4">
          <h5 class="modal-title">Edit Question</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updateQuestion">
            <div class="mb-2">
              <label class="form-label">Question</label>
              <input v-model="editQuestionData.question" type="text" class="form-control rounded-pill" required />
            </div>
            
            <div class="mb-3">
              <label class="form-label">Options</label>
              <input v-model="editQuestionData.option1" placeholder="Option 1" type="text" class="form-control mb-2 rounded-pill" required />
              <input v-model="editQuestionData.option2" placeholder="Option 2" type="text" class="form-control mb-2 rounded-pill" required />
              <input v-model="editQuestionData.option3" placeholder="Option 3" type="text" class="form-control mb-2 rounded-pill" required />
              <input v-model="editQuestionData.option4" placeholder="Option 4" type="text" class="form-control rounded-pill" required />
            </div>
            
            <div class="mb-3">
              <label class="form-label fw-bold">Correct Answer</label>
              <select v-model="editQuestionData.answer" class="form-select rounded-pill" required>
                <option disabled value="">Select the correct answer</option>
                <option v-if="editQuestionData.option1" :value="editQuestionData.option1">{{ editQuestionData.option1 }}</option>
                <option v-if="editQuestionData.option2" :value="editQuestionData.option2">{{ editQuestionData.option2 }}</option>
                <option v-if="editQuestionData.option3" :value="editQuestionData.option3">{{ editQuestionData.option3 }}</option>
                <option v-if="editQuestionData.option4" :value="editQuestionData.option4">{{ editQuestionData.option4 }}</option>
              </select>
            </div>
            
            <button type="submit" class="btn btn-success w-100 rounded-pill shadow-sm">Save Changes</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>

  `,

  data() {
    return {
      questions: [],
      editModal: null,
      newQuestion: {
        subject_id: this.$route.params.id,
        chapter_id: this.$route.params.chapter_id,
        quiz_id: this.$route.params.quiz_id,
        question: "",
        option1: "",
        option2: "",
        option3: "",
        option4: "",
        answer: "",
      },
      editQuestionData: {
        id: null,
        question: "",
        option1: "",
        option2: "",
        option3: "",
        option4: "",
        answer: "",
      }
    };
  },

  mounted() {
    this.getQuestions();
    this.editModal = new bootstrap.Modal(document.getElementById("editModal"));
  },

  methods: {
    getQuestions() {
      fetch(`/api/admin/subject/${this.$route.params.id}/chapters/${this.$route.params.chapter_id}/quizzes/${this.$route.params.quiz_id}/questions`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("token"),
        },
      })
      .then(response => response.json())
      .then(data => { this.questions = data.questions; });
    },

    addQuestion() {
      fetch(`/api/admin/subject/${this.$route.params.id}/chapters/${this.$route.params.chapter_id}/quizzes/${this.$route.params.quiz_id}/questions`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("token"),
        },
        body: JSON.stringify(this.newQuestion),
      })
      .then(response => response.json())
      .then(new_data => {
        this.questions.push({ ...this.newQuestion, id: new_data.id });
        this.newQuestion = {
          subject_id: this.$route.params.id,
          chapter_id: this.$route.params.chapter_id,
          quiz_id: this.$route.params.quiz_id,
          question: "",
          option1: "",
          option2: "",
          option3: "",
          option4: "",
          answer: "",
        };
      });
    },

    deleteQuestion(id) {
      fetch(`/api/admin/subject/${this.$route.params.id}/chapters/${this.$route.params.chapter_id}/quizzes/${this.$route.params.quiz_id}/questions/${id}`, {
        method: "DELETE",
        headers: { "Authentication-Token": localStorage.getItem("token") }
      })
      .then(() => {
        this.questions = this.questions.filter(q => q.id !== id);
      });
    },

    editQuestion(q) {
      this.editQuestionData = { ...q };
      this.editModal.show(); 
    },

    updateQuestion() {
      fetch(`/api/admin/subject/${this.$route.params.id}/chapters/${this.$route.params.chapter_id}/quizzes/${this.$route.params.quiz_id}/questions/${this.editQuestionData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("token"),
        },
        body: JSON.stringify({
          question: this.editQuestionData.question,
          option1: this.editQuestionData.option1,
          option2: this.editQuestionData.option2,
          option3: this.editQuestionData.option3,
          option4: this.editQuestionData.option4,
          answer: this.editQuestionData.answer, 
        }),
      })
      .then(() => {
        this.getQuestions();
        this.editModal.hide(); 
      });
    }
  }
};
