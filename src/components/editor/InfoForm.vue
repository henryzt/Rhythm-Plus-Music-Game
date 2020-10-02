<template>
  <div>
    <form
      @submit.prevent="$emit('submitForm')"
      v-if="formOption.tab === 'form'"
    >
      <slot>
        <input
          v-model="formData.title"
          name="songTitle"
          placeholder="Song title"
          type="text"
        />
        <input
          v-model="formData.subtitle"
          name="songTitle"
          placeholder="Subtitle (E.g. xxx opening song, Optional)"
          type="text"
        />
        <input
          v-model="formData.artist"
          name="artist"
          placeholder="Artist"
          type="text"
        />
        <v-select
          class="songSelect"
          :options="tags"
          v-model="formData.tags"
          placeholder="Tags"
          taggable
          multiple
          push-tags
        ></v-select>
        <select id="songSelect" v-model="formData.srcMode">
          <option :value="null" disabled>Select music source...</option>
          <option value="youtube">Youtube Video</option>
          <option value="url">MP3 File URL</option>
        </select>
        <!-- youtube mode -->
        <div v-if="formData.srcMode === 'youtube'">
          <input
            v-model="formData.youtubeId"
            name="youtubeId"
            placeholder="Youtube ID"
            type="text"
          />
          <input
            v-model="formData.image"
            name="image"
            placeholder="Image URL (Optional)"
            type="text"
          />
        </div>
        <!-- url mode -->
        <div v-if="formData.srcMode === 'url'">
          <input
            v-model="formData.url"
            name="url"
            placeholder="MP3 URL (https://**.mp3)"
            type="text"
          />
          <input
            v-model="formData.youtubeId"
            name="youtubeId"
            placeholder="Youtube ID (for thumbnail)"
            type="text"
          />
          <input
            v-model="formData.image"
            name="image"
            placeholder="Image URL (Optional)"
            type="text"
          />
        </div>
        <!-- todo -->
        <!-- <div class="checkboxes">
          <label class="cb_container">
            Is Original
            <input type="checkbox" v-model="formData.isOriginal" />
            <span class="checkmark"></span>
          </label>
          <label class="cb_container">
            Is No Copyright
            <input type="checkbox" v-model="formData.isNC" />
            <span class="checkmark"></span>
          </label>
        </div>-->
      </slot>
      <input type="submit" :value="actionText + ' ' + itemType" />
      <div
        class="switch_tab"
        @click="formOption.tab = 'choose'"
        v-if="!formOption.isUpdate"
      >
        or Select Existing {{ itemType }}
      </div>
    </form>

    <!-- existing song chooser -->
    <form
      @submit.prevent="$emit('submitExisting')"
      v-if="formOption.tab === 'choose'"
    >
      <select id="songSelect" v-model="formOption.selected">
        <option :value="null" disabled hidden
          >Select an existing {{ itemType }}...</option
        >
        <option disabled>Your Unpublished {{ itemType }}s</option>
        <option
          v-for="item in formOption.privateList"
          :value="item"
          :key="item.id"
          >{{ item.title ? item.title : item.id }}</option
        >
        <option disabled>Public {{ itemType }}s</option>
        <option
          v-for="item in formOption.publicList"
          :value="item"
          :key="item.id"
          >{{ item.title ? item.title : item.id }}</option
        >
      </select>
      <br />
      <input type="submit" :value="'Done'" />
      <div
        class="switch_tab"
        @click="formOption.tab = 'form'"
        v-if="!formOption.isUpdate"
      >
        or {{ actionText }} New {{ itemType }}
      </div>
    </form>
  </div>
</template>

<script>
import "vue-select/dist/vue-select.css";
import vSelect from "vue-select";

export default {
  name: "InfoForm",
  props: ["formData", "formOption", "isCreate", "itemType", "tags"],
  components: {
    vSelect,
  },
  computed: {
    actionText() {
      return this.formOption.isUpdate ? "Update" : "Create";
    },
  },
};
</script>

<style scoped>
.cb_container {
  font-size: 15px;
  margin-bottom: 10px;
  margin-top: 10px;
}
.checkboxes {
  background-color: rgb(109, 109, 109);
  padding: 6px 15px;
  margin: 3px 0;
}
</style>
