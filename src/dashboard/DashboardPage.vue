<template>
  <div>
    <b-container fluid>
      <b-row>
        <b-col md="6">
          <b-card title="Project Completion">
            <b-progress :value="projectCompletionValue" :max="100" variant="success" class="mb-2"></b-progress>
          </b-card>
          <b-card title="Project Names">
            <b-list-group>
              <b-list-group-item
                v-for="project in projects.items"
                :key="project.id"
                :class="{ 'active-project': project === selectedProject }"
                @click="selectProject(project)"
              >
                {{ project.projectName }}
              </b-list-group-item>
            </b-list-group>
          </b-card>
        </b-col>
        <b-col md="6">
          <b-card>
            <template #header>
              <div class="d-flex justify-content-between align-items-center">
                <span>
                  {{ currentView === 'summary' ? 'Project Summary' : currentView === 'costs' ? 'Tasks - Costs' : 'Tasks - Status' }}
                </span>
                <b-button size="sm" @click="setView('summary')">View Summary</b-button>
                <b-button size="sm" @click="setView('costs')">View Costs</b-button>
              </div>
            </template>
            <div v-if="currentView === 'summary'">
              <b-table :items="projectSummary" :fields="['key', 'value']"></b-table>
              <b-progress class="mb-2" :max="totalTasksCount">
                <b-progress-bar :value="completedTasksCount" variant="success">{{ completedTasksCount }}</b-progress-bar>
                <b-progress-bar :value="ongoingTasksCount" variant="warning">{{ ongoingTasksCount }}</b-progress-bar>
                <b-progress-bar :value="plannedTasksCount" variant="info">{{ plannedTasksCount }}</b-progress-bar>
                <b-progress-bar :value="overdueTasksCount" variant="danger">{{ overdueTasksCount }}</b-progress-bar>
              </b-progress>
              <b-badge variant="success">Completed</b-badge>
              <span>{{ completedTasksCount }}</span>
              <b-badge variant="warning">In-Progress</b-badge>
              <span>{{ ongoingTasksCount }}</span>
              <b-badge variant="info">Planned</b-badge>
              <span>{{ plannedTasksCount }}</span>
              <b-badge variant="danger">Overdue</b-badge>
              <span>{{ overdueTasksCount }}</span>
            </div>
            <div v-if="currentView === 'costs'">
              <b-table :items="tasksWithPlannedBudget" :fields="['task', 'plannedBudget']"></b-table>
            </div>
          </b-card>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-card title="Project Budget">
            <b-row>
              <b-col md="6">
                <b-badge variant="info">Estimated</b-badge>
                <span>{{ selectedProjectBudget }}</span>
              </b-col>
              <b-col md="6">
                <b-badge variant="warning">Actual</b-badge>
                <b-form-input v-model="actualBudget" placeholder="Enter actual budget" @input="updateActualBudget"></b-form-input>
              </b-col>
            </b-row>
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  data() {
    return {
      resourceAllocationValue: 100, // Add actual logic to compute this value
      resourceCompletionValue: 0, // Add actual logic to compute this value
      selectedProject: null, // To store the selected project
      actualBudget: '', // To store the actual budget input
      currentView: 'summary', // Toggle between summary, costs, and status views
      taskActivityByCost: [
        { task: 'Reinstall Camera Set', cost: 'IDR 0' },
        { task: 'Camera Set', cost: 'IDR 0' },
        { task: 'Masspro', cost: 'IDR 0' },
        { task: 'Design', cost: 'IDR 0' },
        { task: 'Process & Monitoring', cost: 'IDR 0' }
      ],
      taskActivityByPercentage: [
        { task: 'Reinstall Camera Set', percentage: '0%' },
        { task: 'Camera Set', percentage: '0%' },
        { task: 'Masspro', percentage: '0%' },
        { task: 'Design', percentage: '0%' },
        { task: 'Process & Monitoring', percentage: '0%' }
      ]
    };
  },
  computed: {
    ...mapState('projects', ['projects', 'tasks', 'subtasks']),
    projectSummary() {
      if (this.selectedProject) {
        return [
          { key: 'Project Status', value: this.selectedProject.status || 'N/A' }, // Replace with actual status
          { key: 'PIC', value: this.selectedProject.PIC || 'N/A' }, // Replace with actual status
          { key: 'Start Date', value: this.selectedProject.startDate || 'N/A' },
          { key: 'End Date', value: this.selectedProject.endDate || 'N/A' },
          { key: 'Total Task', value: this.totalTasksCount }, // Add total task count here
          // { key: 'Planned', value:this.plannedTasksCount },
          // { key: 'Overdue', value: this.overdueTasksCount },
          // { key: 'Ongoing', value: this.ongoingTasksCount },
          // { key: 'Completed', value: this.completedTasksCount},
          // Add other fields as needed
        ];
      }
      return [];
    },
    totalTasksCount() {
      if (this.selectedProject) {
        return this.tasks.filter(task => task.projectId === this.selectedProject.id).length;
      }
      return 0;
    },
    overdueTasksCount() {
      if (this.selectedProject) {
        const today = new Date();
        const overdueTasks = this.tasks.filter(task => 
          new Date(task.taskEndDate) < today && 
          task.projectId === this.selectedProject.id
        ).length;

        const completedTasks = this.tasks.filter(task => {
            // Find the task that matches the selected project
            const taskSubtasks = task.subtasks || [];
            // console.log(Task ${task.id} subtasks:, taskSubtasks); // Debugging log
            return taskSubtasks.length > 0 && taskSubtasks.every(subtask => subtask.completed === true);
        }).length;

        return overdueTasks - completedTasks;

      }
      return 0;
    },
    ongoingTasksCount() {
      if (this.selectedProject) {
        const today = new Date();
        return this.tasks.filter(task => new Date(task.taskStartDate) <= today && new Date(task.taskEndDate) >= today && task.projectId === this.selectedProject.id).length;
      }
      return 0;
    },
    completedTasksCount() {
      if (this.selectedProject) {
          return this.tasks.filter(task => {
              // Find the task that matches the selected project
              const taskSubtasks = task.subtasks || [];
              // console.log(Task ${task.id} subtasks:, taskSubtasks); // Debugging log
              return taskSubtasks.length > 0 && taskSubtasks.every(subtask => subtask.completed === true);
          }).length;
      }
      return 0;
    },
    plannedTasksCount(){
      if (this.selectedProject) {
        const today = new Date();

        return this.tasks.filter(task => 
          new Date(task.taskStartDate) > today && 
          task.projectId === this.selectedProject.id
        ).length;
      }
      return 0;
    },
    selectedProjectBudget() {
      if (this.selectedProject) {
        return this.selectedProject.budget || 'IDR 0';
      }
      return "IDR 0";
    },
    projectCompletionValue() {
      const totalTasks = this.totalTasksCount;
      const completedTasks = this.completedTasksCount;

      if (totalTasks === 0) {
        return 0;
      }
      return (completedTasks / totalTasks) * 100;
    },
    tasksCompletionValue() {
      return this.projectCompletionValue;
    },
    tasksWithPlannedBudget() {
      if (this.selectedProject) {
        return this.tasks
          .filter(task => task.projectId === this.selectedProject.id)
          .map(task => ({
            task: task.taskName,
            plannedBudget: task.taskBudget || 'IDR 0'
          }));
      }
      return [];
    }
  },
  mounted() {
    this.getAll();
  },
  methods: {
    ...mapActions('projects', ['getAll', 'getAllTasks', 'getAllSubtasks']),
    async selectProject(project) {
      this.selectedProject = project;
      this.actualBudget = project.actualBudget || ''; // Initialize actualBudget with the project's actualBudget if available
      try {
        await this.getAllTasks(project.id);
      } catch (error) {
        console.error('Error fetching tasks and subtasks:', error);
      }
    },
    updateActualBudget() {
      if (this.selectedProject) {
        this.updateActualBudgetInStore({ projectId: this.selectedProject.id, actualBudget: this.actualBudget });
      }
    },
    setView(view) {
      this.currentView = view;
    }
  }
};
</script>

<style scoped>
.b-card {
  margin-bottom: 20px;
}
.active-project {
  background-color: #f0f0f0; /* Example of a highlighted background color */
  border-left: 3px solid #3490dc; /* Example of a border indicating selection */
}
</style>
