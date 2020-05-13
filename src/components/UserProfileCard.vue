<template>
  <div class="profile_card" @click="$router.push('/account')" v-if="$store.state.currentUser">
    <img :src="$store.state.profilePicture" />
    <div class="detail">
      <div>{{$store.state.currentUser.displayName}}</div>
    </div>
  </div>
</template>

<script>
export default {
    name:"UserProfileCard",
    computed: {
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
  background: linear-gradient(
    195deg,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 0) 70%
  );
  cursor: pointer;
}
.detail {
  display: flex;
  flex-direction: column;
  padding: 10px;
}
img {
  max-width: 50px;
  max-height: 50px;
}
</style>
