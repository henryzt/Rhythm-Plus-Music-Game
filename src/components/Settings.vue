<template>
  <div>
    <div class="st_title">Profile Settings</div>
    <form>
      <p>
        <label>Display Name</label>
        <input
          v-model="profileSt.displayName"
          name="displayName"
          placeholder="Display Name"
          type="text"
        />
      </p>
      <p>
        <label>Email</label>
        <input v-model="profileSt.email" name="email" placeholder="Email" type="text" disabled />
      </p>
      <p>
        <label>User ID</label>
        <input v-model="profileSt.uid" name="uid" placeholder="UID" type="text" disabled />
      </p>
      <p>
        <label>Avatar</label>
        <input v-model="profileSt.photoURL" name="photoURL" placeholder="Avatar URL" type="text" />
        <span style="opacity:0.5;font-size:14px;">
          You can upload a new avatar from your login provider, or leave this field empty and go to
          gravatar.com to change the avatar associated with your email.
        </span>
      </p>
      <p>
        <label>Password</label>
        <input type="button" value="Reset password" />
      </p>
    </form>

    <div class="st_title">Appearance Settings</div>
    <form>
      <p>
        <label>Main Theme</label>
        <select id="songSelect" v-model="appearanceSt.theme">
          <option value="orange">Flame Space</option>
          <option value="purple">Dark Purple Swirl</option>
        </select>
      </p>
      <p v-if="$store.state.visualizerArr">
        <label>Background Visual</label>
        <select id="visualizer" v-model="appearanceSt.overrideVisualizer">
          <option
            v-for="[key, value] in Object.entries($store.state.visualizerArr)"
            :value="value"
            :key="key"
          >{{key}}</option>
        </select>
      </p>
      <p>
        <label></label>
        <Checkbox label="Blur Background" :model="{bind:appearanceSt.blur}"></Checkbox>
      </p>
    </form>

    <div class="st_title">Default Game Settings</div>
    <play-control :playData="gameSt"></play-control>
  </div>
</template>

<script>
import Checkbox from './Checkbox.vue';
import PlayControl from './PlayControl.vue';


export default {
    name: "Settings",
    components: {
      Checkbox,
      PlayControl
    },
    data: function(){
        return {
            profileSt:{

            },
            appearanceSt:{
                theme: "purple",
                blur: false
            },
            gameSt:{

            }
        }
    }
    
}
</script>

<style scoped>
.st_title {
  margin: 30px 0;
  font-size: 2em;
}
form {
  display: table;
  width: 100%;
}
p {
  display: table-row;
  width: 100%;
}
label {
  display: table-cell;
  width: 25%;
  text-align: right;
  padding-right: 10px;
}
input {
  display: table-cell;
}

@media only screen and (max-width: 1000px) {
  label {
    width: 35%;
  }
}
</style>