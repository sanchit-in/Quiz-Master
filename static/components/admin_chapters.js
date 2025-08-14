export default {
    template: `
    <div>
        <div class="container mt-5">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="fw-bold">Chapters</h2>
                <button type="button" class="btn btn-primary px-4 py-2 rounded-pill" data-bs-toggle="modal" data-bs-target="#addChapterModal">
                    + Add Chapter
                </button>         
            </div>

            
            <div class="row">
                <div v-for="chapter in chapters" :key="chapter.id" class="col-md-4">
                    <div class="card shadow-sm border-0 mb-4 position-relative p-3">
                        <div class="card-body text-center">
                            <h5 class="card-title fw-bold">{{ chapter.name }}</h5>
                            <p class="card-text text-muted">{{ chapter.description }}</p>
                            <div class="mt-2">
                                 <router-link :to="'/admin'+'/subject/'+ subject_id + '/chapters/' + chapter.id +'/quizzes'" class="btn btn-outline-primary w-100 mb-3">
                                View Quizzes
                                </router-link>
                                <button class="btn btn-sm btn-outline-primary me-2" @click="editChapter(chapter)">Edit</button>
                                <button class="btn btn-sm btn-outline-danger" @click="deleteChapter(chapter.id)">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Edit Chapter Modal -->
<div class="modal fade" id="editChapterModal" tabindex="-1" aria-labelledby="editChapterModalLabel">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title fw-bold" id="editChapterModalLabel">Edit Chapter</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <input v-model="edit_chapter.name" type="text" class="form-control mb-3" placeholder="Chapter Name">
                <textarea v-model="edit_chapter.description" class="form-control mb-3" placeholder="Chapter Description"></textarea>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" @click="updateChapter()">Save Changes</button>
            </div>
        </div>
    </div>
</div>


        <!-- Add Chapter Modal -->
        <div class="modal fade" id="addChapterModal" tabindex="-1" aria-labelledby="addChapterModalLabel">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title fw-bold" id="addChapterModalLabel">Add New Chapter</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <input v-model="new_chapter.name" type="text" class="form-control mb-3" placeholder="Chapter Name">
                        <textarea v-model="new_chapter.description" class="form-control mb-3" placeholder="Chapter Description"></textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" @click="addChapter()">Save</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,

    data() {
        return {
            subject_id: this.$route.params.id,
            chapters: [],
            new_chapter: { name: '', description: '' },
            edit_chapter: { id: null, name: '', description: '' }
        };
    },

    mounted() {
        let subject_id = this.$route.params.id;
        this.getChapters();
    },

    methods: {
        // Fetch chapters for the subject
        getChapters() {
            let subject_id = this.$route.params.id;
            fetch(`/api/admin/subjects/${subject_id}/chapters`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("token")
                }
            })
                .then(response => response.json())
                .then(data => {
                    this.chapters = data;
                })
                .catch(error => console.error("Error fetching chapters:", error));
        },

        // Add new chapter
        addChapter() {
            let subject_id = this.$route.params.id;

            fetch(`/api/admin/subjects/${subject_id}/chapters`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("token")
                },
                body: JSON.stringify(this.new_chapter)
            })
                .then(response => response.json())
                .then(data => {
                    this.chapters.push({
                        id: data.chapter_id,
                        name: this.new_chapter.name,
                        description: this.new_chapter.description
                    });

                    // Reset input fields
                    this.new_chapter = { name: '', description: '' };

                    // Close modal
                    let modal = bootstrap.Modal.getInstance(document.getElementById('addChapterModal'));
                    modal.hide();
                })
                .catch(error => console.error("Error adding chapter:", error));
        },

        // Delete chapter
        deleteChapter(chapter_id) {
            if (!confirm("Are you sure you want to delete this chapter?")) return;

            fetch(`/api/admin/subject/${this.$route.params.id}/chapters/${chapter_id}`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("token")
                }
            })
                .then(response => {
                    if (response.ok) {
                        this.chapters = this.chapters.filter(chapter => chapter.id !== chapter_id);
                    } else {
                        alert("Failed to delete the chapter. Please try again.");
                    }
                })
                .catch(error => console.error("Error deleting chapter:", error));
        },
        editChapter(chapter) {
            this.edit_chapter = { ...chapter }; 
            let modal = new bootstrap.Modal(document.getElementById('editChapterModal'));
            modal.show();
        },
        updateChapter() {
            let subject_id = this.$route.params.id;
    
            fetch(`/api/admin/subject/${subject_id}/chapters/${this.edit_chapter.id}`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("token")
                },
                body: JSON.stringify({
                    name: this.edit_chapter.name,
                    description: this.edit_chapter.description
                })
            })
            .then(response => response.json())
            .then(data => {
                let index = this.chapters.findIndex(ch => ch.id === this.edit_chapter.id);
                if (index !== -1) {
                    this.chapters[index] = { ...this.edit_chapter };  
                }
    
                let modal = bootstrap.Modal.getInstance(document.getElementById('editChapterModal'));
                modal.hide();
            })
            .catch(error => console.error("Error updating chapter:", error));
        }
    
    }
};
