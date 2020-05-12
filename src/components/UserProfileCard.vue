<template>
  <div class="profile_card" @click="$router.push('/account')" v-if="$store.state.currentUser">
    <img :src="profilePicture" />
    <div class="detail">
      <div>{{$store.state.currentUser.displayName}}</div>
    </div>
  </div>
</template>

<script>
import md5 from 'js-md5'
export default {
    name:"UserProfileCard",
    computed: {
        profilePicture(){
            let hash = md5(this.$store.state.currentUser.email);
            let gravatar_link = 'http://www.gravatar.com/avatar/' + hash + '?s=50';
            return gravatar_link;
        }
    }
}
</script>

<style scoped>
.profile_card {
  position: fixed;
  right: 0;
  top: 0;
  display: flex;
  align-items: center;
  opacity: 0.5;
  padding: 5px;
  background: rgba(0, 0, 0, 0.5);
  cursor: pointer;
}
.detail {
  display: flex;
  flex-direction: column;
  padding: 10px;
}
</style>
