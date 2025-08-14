export default {
    template: `
    <div class="bg-container">
    <div class="container mt-4">
      <div class="card shadow-sm p-3 bg-white bg-opacity-75">
        <h4 class="text-center text-dark mb-3 border-bottom pb-2">Users</h4>
        <div class="table-responsive">
          <table class="table table-bordered text-center">
            <thead class="table-primary">
              <tr>
                <th>ID</th>
                <th>E-mail</th>
                <th>User Name</th>
                <th>Full Name</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in user" :key="u.id">
                <td>{{ u.id}}</td>
                <td>{{ u.email}}</td>
                <td>{{ u.username}}</td>          
                <td>{{ u.full_name }}</td>
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
        user : [] 
    };

    },
    mounted(){
      this.get_user();
    },
    methods :{
      get_user(){
        fetch(`/api/admin/users`,{
          method : "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": localStorage.getItem("token")
        }
        })
        .then(response => response.json())
        .then(data => {
          this.user = data.user;
        });
      }

    }
  };
  