export default {
    template: `
    <div class="bg-container">
    <div class="container mt-4">
      <div class="card shadow-sm p-3 bg-white bg-opacity-75">
        <h4 class="text-center text-dark mb-3 border-bottom pb-2">Scores</h4>
        <div class="table-responsive">
          <table class="table table-bordered text-center">
            <thead class="table-primary">
              <tr>
                <th>ID</th>
                <th>Quiz ID</th>
           
                <th>Total Score</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in scores" :key="s.id">
                <td>{{ s.id}}</td>
                <td>{{ s.quiz_id}}</td>
           
                <td>{{ s.total_marks }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
    `
    ,data(){
      return {
        scores : [] 
    };

    },
    mounted(){
      this.get_scores();
    },
    methods :{
      get_scores(){
        fetch(`/api/user/scores`,{
          method : "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": localStorage.getItem("token")
        }
        })
        .then(response => response.json())
        .then(data => {
          this.scores = data.scores;
        });
      }

    }
  };
  