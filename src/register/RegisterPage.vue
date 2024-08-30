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
            <input placeholder="Full Name" type="text" v-model="user.fullName" v-validate="'required'" name="fullName" class="form-control" :class="{ 'is-invalid': submitted && errors.has('fulltName') }" />
            <div v-if="submitted && errors.has('fullName')" class="invalid-feedback">{{ errors.first('fullName') }}</div>
          </div>
          <div class="form-inp">
            <input placeholder="Email Address" type="text" v-model="user.email" v-validate="'required'" name="email" class="form-control" :class="{ 'is-invalid': submitted && errors.has('email') }" />
            <div v-if="submitted && errors.has('email')" class="invalid-feedback">{{ errors.first('email') }}</div>
          </div>
          <div class="form-inp">
            <input placeholder="Password" type="password" v-model="user.password" v-validate="{ required: true, min: 6 }" name="password" class="form-control" :class="{ 'is-invalid': submitted && errors.has('password') }" />
            <div v-if="submitted && errors.has('password')" class="invalid-feedback">{{ errors.first('password') }}</div>
          </div>
          <!-- <div v-if="showOTPInput" class="form-inp">
            <input placeholder="Enter OTP" type="text" v-model="otp" class="form-control" />
          </div> -->
        </div>
        <div id="submit-button-cvr">
          <button class="btn btn-primary" id="submit-button" :disabled="status.registering">Register</button>
          <img v-show="status.registering" src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
          <router-link to="/login" class="btn btn-link" style="color: #fb3b3b; text-decoration: none; font-size: 14px;">Cancel</router-link>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  data() {
    return {
      user: {
        fullName: '',
        email: '',
        password: ''
      },
      submitted: false,
      // showOTPInput: false,
      otp: ''
    }
  },
  computed: {
    ...mapState('account', ['status'])
  },
  methods: {
    ...mapActions('account', ['register', 'sendOTP']),
    handleSubmit(e) {
      this.submitted = true;
      this.$validator.validate().then(valid => {
        if (valid) {
          // if (!this.showOTPInput) {
          //   // Show OTP input field
          //   this.showOTPInput = true;
          //   // Get the email value from the input field
          //   const userEmail = this.user.email
          //   console.log("Email before sending OTP:", this.user.email);
          //   // Pass the email to sendOTP action
          //   this.sendOTP(userEmail);
          // } else {
          //   // Proceed with registration
          //   this.user.otp = this.otp;
          //   this.register(this.user);
          // }
          this.register(this.user);
        }
      });
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
  place-items: center;
  width: 350px;
  height: 560px;
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
  margin-top: 40px;
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

.form-inp input:focus,
#submit-button:focus {
  outline: none;
  transform: translateY(4px);
  box-shadow: 1px 2px 0px 0px #fb3b3b;
}

#submit-button-cvr {
  display: inline-flexbox;
  margin-top: 10px;
  text-align: center;
}

#submit-button, #send-otp-button {
  display: block;
  color: #fb3b3b;
  background-color: transparent;
  font-size: 14px;
  border: 0;
  outline: 1px solid #fb3b3b;
  border-radius: 8px;
  line-height: 1;
  cursor: pointer;
  transition: all ease-in-out 0.3s;
  padding: 15px;
  margin: 25px 0px;
  width: 290px;
  font-size: 15px;
  font-weight: 800;
  box-shadow: 3px 3px 0px 0px #fb3b3b;
}

#submit-button:hover, #send-otp-button:hover {
  transition: all ease-in-out 0.3s;
  background-color: #fb3b3b;
  color: #fbfbfb;
  cursor: pointer;
  opacity: 0.9;
}
</style>
