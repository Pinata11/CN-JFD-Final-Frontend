<template>
  <div id="Container">
    <form action="" method="post" id="form" @submit.prevent="handleSubmit">
      <div id="form-body">
        <div id="welcome-lines">
          <div id="welcome-line-1">Musashi</div>
          <div id="welcome-line-2">Go Far Beyond</div>
        </div>
        <div id="input-area">
          <div class="form-inp">
            <input v-model="email" placeholder="Email Address" type="text"/>
          </div>
          <div class="form-inp">
            <input v-model="password" placeholder="Password" type="password"/>
          </div>
        </div>
        <div id="submit-button-cvr">
          <button id="submit-button" :disabled="status.loggingIn">Login</button>
        </div>
        <div class="register-link">
          <p class="account-text">Don't have an account?</p>
          <router-link to="/register" class="btn btn-link" style="color: #fb3b3b; text-decoration: none; font-size: 12px;">Register</router-link>
        </div>
      </div>
    </form>
  </div>
</template>


<script>
import { mapState, mapActions } from 'vuex'

export default {
    data () {
        return {
            email: '',
            password: '',
            submitted: false
        }
    },
    computed: {
        ...mapState('account', ['status'])
    },
    created () {
        // reset login status
        this.logout();
    },
    methods: {
        ...mapActions('account', ['login', 'logout']),
        handleSubmit (e) {
            this.submitted = true;
            const { email, password } = this;
            if (email && password) {
                this.login({ email, password })
            }
        }
    }
};
</script>

<style scoped>
 
 #Container {
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: fixed;
  height: 100%;
}

#form {
  display: grid;
  width: 350px;
  height: 500px;
  background-color: #fbfbfb;
  box-shadow: 0px 15px 60px #fb3b3b;
  outline: 1px solid #9d2626;
  border-radius: 10px;
}

#form-body {  
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: auto;
  width: auto;
  border-radius: 20px;
}

#welcome-lines {
  text-align: center;
  line-height: 1;
}

#welcome-line-1 {
  color: #fb3b3b;
  font-weight: 600;
  font-size: 40px;
}

#welcome-line-2 {
  color: #161616;
  font-size: 18px;
  margin-top: 17px;
}

#input-area {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: baseline;
}

.form-inp {
  padding: 11px 25px;
  background: transparent;
  line-height: 1;
  border-radius: 8px;
}

.form-inp:focus {
  border: 1px solid #9d2626;
}

.form-inp:first-child {
  margin-bottom: 15px;
}

.form-inp input {
  background: none;
  color: #9d2626;
  margin: 0;
  outline: none;
  border: 2px solid #9d2626;
  box-shadow: 3px 4px 0px 1px #fb3b3b;
  width: 290px;
  padding: 12px 10px;
  border-radius: 4px;
  font-size: 15px;
}

.form-inp input:focus, #submit-button:focus {
  outline: none;
  transform: translateY(4px);
  box-shadow: 1px 2px 0px 0px #fb3b3b;
}

#submit-button-cvr {
  margin-top: 10px;
}

#submit-button {
  display: block;
  color: #fb3b3b;
  background-color: transparent;
  font-size: 14px;
  border: 0;
  outline: 1px solid #fb3b3b;
  border-radius: 8px;
  line-height: 1;
  cursor: pointer;
  transition: all ease-in-out .3s;
  padding: 15px;
  margin: 25px 0px;
  width: 290px;
  font-size: 15px;
  font-weight: 800;
  box-shadow: 3px 3px 0px 0px #fb3b3b;
}

#submit-button:hover {
  transition: all ease-in-out .3s;
  background-color: #fb3b3b;
  color: #fbfbfb;
  cursor: pointer;
  opacity: .9;
}

.register-link {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 0;
}

.account-text {
  color: #161616;
  font-size: 12px;
  margin-right: 1em;
  margin-bottom: 0;
}
  
</style>