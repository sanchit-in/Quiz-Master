export default {
  template: `
  <div>
      <div class="container mt-3">
        
      <div class ="row border">
        
            <h2 class="fw-bold">Subjects</h2>
            <div class ="text-end my-2">
                <button @click="csvExport" class ="btn btn-secondary">Download CSV</button>
                <router-link class="btn btn-success text-white fw-bold px-3 py-1" to="/admin/user">Users</router-link>    
                <router-link class="btn btn-info text-white fw-bold px-3 py-1" to="/admin/summary">Summary</router-link> 
                <button type="button" class="btn btn-primary px-4 py-2 rounded-pill" data-bs-toggle="modal" data-bs-target="#addSubjectModal">
                  + Add Subject
              </button>    
            </div>
          
        </div>
          

          <div class="row">
              <div v-for="subject in data.subjects" :key="subject.id" class="col-md-4">
                  <div class="card shadow-sm border-0 mb-4 position-relative p-3">
                      <div class="card-body text-center">
                          <h5 class="card-title fw-bold">{{ subject.name }}</h5>
                          <p class="card-text text-muted">{{ subject.description }}</p>
                          <router-link :to="{ path :'/admin/subject/' + subject.id + '/chapters'}" class="btn btn-outline-primary w-100 mt-3">
                              View Chapters
                          </router-link>
                          <div class="mt-2">
                              <button class="btn btn-sm btn-outline-primary me-2" @click="editSubject(subject)">Edit</button>
                              <button class="btn btn-sm btn-outline-danger" @click="deleteSubject(subject.id)">Delete</button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <div class="modal fade" id="addSubjectModal" tabindex="-1" aria-labelledby="addSubjectModalLabel">
          <div class="modal-dialog">
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title fw-bold" id="addSubjectModalLabel">Add New Subject</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <div class="modal-body">
                      <input v-model="new_subject.name" type="text" class="form-control mb-3" placeholder="Subject Name">
                      <textarea v-model="new_subject.description" class="form-control mb-3" placeholder="Subject Description"></textarea>
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                      <button type="button" class="btn btn-primary" @click="addSubject">Save</button>
                  </div>
              </div>
          </div>
      </div>

      <div class="modal fade" id="editSubjectModal" tabindex="-1" aria-labelledby="editSubjectModalLabel">
          <div class="modal-dialog">
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title fw-bold" id="editSubjectModalLabel">Edit Subject</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <div class="modal-body">
                      <input v-model="curr_subject.name" type="text" class="form-control mb-3" placeholder="Subject Name">
                      <textarea v-model="curr_subject.description" class="form-control mb-3" placeholder="Subject Description"></textarea>
                  </div>
                  <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                      <button type="button" class="btn btn-primary" @click="saveEdit">Save Changes</button>
                  </div>
              </div>
          </div>
      </div>
  </div>
  `,
  data() {
      return {
          data: { subjects: [] },
          new_subject: { name: '', description: '' },
          curr_subject: { id: null, name: '', description: '' }
      };
  },
  mounted() {
      this.getSubjects();
  }, 
  methods: {
      getSubjects() {
          fetch('/api/admin/dashboard', {
              method: 'GET',
              headers: {
                  "Content-Type": "application/json",
                  "Authentication-Token": localStorage.getItem("token")
              }
          })
          .then(response => response.json())
          .then(data => this.data = data);
      },
      addSubject() {
          fetch('/api/admin/subjects', {
              method: 'POST',
              headers: {
                  "Content-Type": "application/json",
                  "Authentication-Token": localStorage.getItem("token")
              },
              body: JSON.stringify(this.new_subject)
          })
          .then(response => response.json())
          .then(data2 => {
              this.data.subjects.push({
                  id: data2.subject_id,
                  name: this.new_subject.name,
                  description: this.new_subject.description,
                  chapters: 0,
                  quizzes: 0
              });
              this.new_subject = { name: '', description: '' };
              document.querySelector("#addSubjectModal .btn-close").click();
          });
      },
      deleteSubject(id) {
          fetch(`/api/admin/subjects/${id}`, {
              method: 'DELETE',
              headers: {
                  "Content-Type": "application/json",
                  "Authentication-Token": localStorage.getItem("token")
              }
          })
          .then(response => response.json())
          .then(() => {
              this.data.subjects = this.data.subjects.filter(subject => subject.id !== id);
          });
      },
      editSubject(subject) {
          this.curr_subject = { ...subject };
          new bootstrap.Modal(document.getElementById("editSubjectModal")).show();
      },
      saveEdit() {
          fetch(`/api/admin/subjects/${this.curr_subject.id}`, {
              method: 'PUT',
              headers: {
                  "Content-Type": "application/json",
                  "Authentication-Token": localStorage.getItem("token")
              },
              body: JSON.stringify({
                  name: this.curr_subject.name,
                  description: this.curr_subject.description
              })
          })
          .then(response => response.json())
          .then(() => {
              let subject = this.data.subjects.find(sub => sub.id === this.curr_subject.id);
              if (subject) {
                  subject.name = this.curr_subject.name;
                  subject.description = this.curr_subject.description;
              }
              document.querySelector("#editSubjectModal .btn-close").click();
          });
      },
      csvExport(){
        fetch('/api/export')
        .then(response => response.json())
        .then(data => {
            window.location.href = `/api/csv_result/${data.id}`
        })
      }
  }
};
