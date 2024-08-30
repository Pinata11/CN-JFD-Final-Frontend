<template>
    <div class="jumbotron">
         <div v-if="alert.message" :class="`alert ${alert.type}`">{{alert.message}}</div>
         <router-view></router-view>
     </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
    name: 'app',
    computed: {
        ...mapState({
            alert: state => state.alert
        })
    },
    methods: {
        ...mapActions({
            clearAlert: 'alert/clear' 
        })
    },
    watch: {
        $route (to, from){
            // clear alert on location change
            this.clearAlert();
        }
    } 
};
</script>

<style scoped>
* {
    background-color: white;
}
.alert-wrapper {
    position: absolute;
    width: 100%;
    display: flex;
    justify-content: center;
    top: 20px; /* Adjust as needed */
}

.alert {
    /* Modify size and other styles as needed */
    padding: 10px 20px;
    border-radius: 5px;
    font-size: 18px; /* Adjust size */
    /* Add other styles for alert */
}
</style>