export default {
    template: `
    <div class="container mt-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="fw-bold">Quizzes</h2>
            <button type="button" class="btn btn-primary px-4 py-2 rounded-pill" data-bs-toggle="modal" data-bs-target="#addQuizModal">
                + Add Quiz
            </button>
        </div>

        <!-- Quiz List -->
        <div class="table-responsive">
            <table class="table table-bordered table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Duration (min)</th>
                        <th>Remark</th>
                        <th>Actions</th>
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
                            <button class="btn btn-sm btn-outline-primary me-2" @click="editQuiz(quiz)">
                                Edit
                            </button>
                            <button class="btn btn-sm btn-outline-danger" @click="deleteQuiz(quiz.id)">
                                Delete
                            </button>
                            <button class="btn btn-sm btn-outline-success me-2" @click="viewQuestions(quiz.id)">
                                View Questions
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Add Quiz Modal -->
        <div class="modal fade" id="addQuizModal" tabindex="-1" aria-labelledby="addQuizModalLabel" aria-hidden="True">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title fw-bold">Add New Quiz</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <input v-model="new_quiz.quiz_date" type="date" class="form-control mb-3" placeholder="Quiz Date">
                        <input v-model="new_quiz.quiz_time" type="time" class="form-control mb-3" placeholder="Quiz Time">
                        <input v-model="new_quiz.time_duration" type="number" class="form-control mb-3" placeholder="Duration (minutes)">
                        <textarea v-model="new_quiz.remark" class="form-control mb-3" placeholder="Remark"></textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" @click="addQuiz()">Save</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Edit Quiz Modal -->
        <div class="modal fade" id="editQuizModal" tabindex="-1" aria-labelledby="editQuizModalLabel">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title fw-bold">Edit Quiz</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <input v-model="new_quiz.quiz_date" type="date" class="form-control mb-3">
                        <input v-model="new_quiz.quiz_time" type="time" class="form-control mb-3">
                        <input v-model="new_quiz.time_duration" type="number" class="form-control mb-3">
                        <textarea v-model="new_quiz.remark" class="form-control mb-3"></textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" @click="updateQuiz()">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,

    data() {
        return {
            quizzes: [],
            new_quiz: {
                subject_id: this.$route.params.id,
                chapter_id: this.$route.params.chapter_id,
                quiz_date: '',
                quiz_time: '',
                time_duration: '',
                remark: '',
            },
            chapter_id: this.$route.params.chapter_id,
        };
    },

    mounted() {
        this.getQuizzes();
    },

    methods: {
        // Fetch all quizzes
        getQuizzes() {
            fetch(`/api/admin/subject/${this.$route.params.id}/chapters/${this.chapter_id}/quizzes`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("token"),
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.quizzes) {
                    this.quizzes = data.quizzes.map(q => ({
                        ...q,
                        quiz_time: q.quiz_time.slice(0, 5) // Ensure "HH:MM" format
                    }));
                } else {
                    console.error("Error fetching quizzes:", data.message);
                }
            })
            .catch(error => console.error("Error fetching quizzes:", error));
        },

        // Add a new quiz
        addQuiz() {
            this.new_quiz.quiz_time = this.new_quiz.quiz_time.slice(0, 5); // Ensure "HH:MM" format

            fetch(`/api/admin/subject/${this.$route.params.id}/chapters/${this.chapter_id}/quizzes`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("token"),
                },
                body: JSON.stringify(this.new_quiz),
            })
            .then(response => response.json())
            .then(data => {
                if (data.id) {
                    this.getQuizzes();
                    this.new_quiz = { quiz_date: '', quiz_time: '', time_duration: '', remark: '' };
                    let modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('addQuizModal'));
                    modal.hide();
                } else {
                    alert("Failed to add quiz: " + data.message);
                }
            })
            .catch(error => console.error("Error adding quiz:", error));
        },

        // Edit existing quiz
        editQuiz(quiz) {
            this.new_quiz = { ...quiz };
            let modal = new bootstrap.Modal(document.getElementById("editQuizModal"));
            modal.show();
        },

        // Update quiz via API
        updateQuiz() {
            this.new_quiz.quiz_time = this.new_quiz.quiz_time.slice(0, 5); // Ensure "HH:MM" format

            fetch(`/api/admin/subject/${this.$route.params.id}/chapters/${this.chapter_id}/quizzes/${this.new_quiz.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("token"),
                },
                body: JSON.stringify(this.new_quiz),
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === "Quiz updated successfully") {
                    this.getQuizzes();
                    let modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("editQuizModal"));
                    modal.hide();
                } else {
                    alert("Failed to update quiz: " + data.message);
                }
            })
            .catch(error => console.error("Error updating quiz:", error));
        },

        // Delete quiz
        deleteQuiz(quiz_id) {
            if (!confirm("Are you sure you want to delete this quiz?")) return;

            fetch(`/api/admin/subject/${this.$route.params.id}/chapters/${this.chapter_id}/quizzes/${quiz_id}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("token"),
                },
            })
            .then(() => {
                this.quizzes = this.quizzes.filter(quiz => quiz.id !== quiz_id);
            })
            .catch(error => console.error("Error deleting quiz:", error));
        },

        // Navigate to view questions
        viewQuestions(quiz_id) {
            this.$router.push(`/admin/subject/${this.$route.params.id}/chapters/${this.chapter_id}/quizzes/${quiz_id}/questions`);
        }
        
    }
};
