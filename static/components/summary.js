export default {
  template: `
  <div class="container mt-4">
      <h2 class="text-center font-weight-bold mb-4">Summary Statistics</h2>

      <div class="row text-center mb-4">
          <div class="col-md-3">
              <div class="card text-black p-3">
                  <h4>Total Users</h4>
                  <h3>{{ summaryData.total_users }}</h3>
              </div>
          </div>
          <div class="col-md-3">
              <div class="card  text-black p-3">
                  <h4>Total Subjects</h4>
                  <h3>{{ summaryData.total_subjects }}</h3>
              </div>
          </div>
          <div class="col-md-3">
              <div class="card text-black p-3">
                  <h4>Total Chapters</h4>
                  <h3>{{ summaryData.total_chapters }}</h3>
              </div>
          </div>
          <div class="col-md-3">
              <div class="card text-black p-3">
                  <h4>Total Quizzes</h4>
                  <h3>{{ summaryData.total_quizzes }}</h3>
              </div>
          </div>
      </div>

      <div class="row">
          <div class="col-md-6 d-flex flex-column align-items-center">
              <h3 class="text-center font-weight-semibold mb-3">Quiz-wise Top Scores</h3>
              <div class="chart-container">
                  <canvas id="quizTopScoresChart"></canvas>
              </div>
          </div>

          <div class="col-md-6 d-flex flex-column align-items-center">
              <h3 class="text-center font-weight-semibold mb-3">Subject-wise User Attempts</h3>
              <div class="chart-container">
                  <canvas id="subjectUserAttemptsChart"></canvas>
              </div>
          </div>
      </div>
  </div>
  `,
  data() {
      return {
        summaryData: {
          total_users: 0,
          total_subjects: 0,
          total_chapters: 0,
          total_quizzes: 0,
          quiz_top_scores: {},
          subject_user_attempts: {}
      }
      };
  },
  mounted() {
      fetch("/api/admin/summary", {
          method: "GET",
          headers: {
              "Content-Type": "application/json",
              "Authentication-Token": localStorage.getItem("token")
          }
      })
      .then(response => response.json())
      .then(summaryData => {
          if (summaryData) {
              this.summaryData = summaryData;
              this.totalUsers = summaryData.total_users;
              this.totalSubjects = summaryData.total_subjects;
              this.totalChapters = summaryData.total_chapters;
              this.totalQuizzes = summaryData.total_quizzes;
              this.renderCharts();
          }
      });
  },
  methods: {
      renderCharts() {
          if (!this.summaryData) return;

          // Quiz-wise Top Scores Chart
          const quizScoresData = Object.entries(this.summaryData.quiz_top_scores);
          new Chart(document.getElementById("quizTopScoresChart"), {
              type: "bar",
              data: {
                  labels: quizScoresData.map(item => item[0]),
                  datasets: [{
                      label: "Top Score",
                      data: quizScoresData.map(item => item[1]),
                      backgroundColor: "#4A90E2"
                  }]
              }
          });

          // Subject-wise User Attempts Chart
          const subjectAttemptsData = Object.entries(this.summaryData.subject_user_attempts);
          new Chart(document.getElementById("subjectUserAttemptsChart"), {
              type: "pie",
              data: {
                  labels: subjectAttemptsData.map(item => item[0]),
                  datasets: [{
                      label: "User Attempts",
                      data: subjectAttemptsData.map(item => item[1]),
                      backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"]
                  }]
              }
          });
      }
  }
};
